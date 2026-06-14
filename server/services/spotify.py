import time

import requests
import spotipy
from flask import session, current_app, url_for
from spotipy.oauth2 import SpotifyOAuth, SpotifyOauthError
from spotipy.cache_handler import MemoryCacheHandler

TOKEN_INFO = 'token_info'


def get_spotify_oauth():
    cfg = current_app.config

    # Use an in-memory cache handler so spotipy never writes a `.cache` token
    # file to disk. Passing cache_path=None does NOT disable caching — spotipy
    # falls back to a default CacheFileHandler that writes `.cache` in the CWD.
    return SpotifyOAuth(
        client_id=cfg['SPOTIFY_CLIENT_ID'],
        client_secret=cfg['SPOTIFY_CLIENT_SECRET'],
        redirect_uri=url_for('auth.callback', _external=True),
        scope=cfg['SPOTIFY_SCOPES'],
        cache_handler=MemoryCacheHandler(),
    )


def get_token():
    """Return a valid Spotify token dict from the session, refreshing if needed.

    Raises ``PermissionError`` whenever a usable token cannot be produced
    (none stored, no refresh token, refresh rejected, or Spotify unreachable) so
    the central error handler can return a clean 401 → reconnect instead of a 500.
    """
    token_info = session.get(TOKEN_INFO)
    if not token_info:
        raise PermissionError('No Spotify token in session')

    expires_at = token_info.get('expires_at', 0)
    if expires_at - int(time.time()) < 60:
        refresh_token = token_info.get('refresh_token')
        if not refresh_token:
            session.pop(TOKEN_INFO, None)
            raise PermissionError('Spotify session expired; please reconnect')
        try:
            token_info = get_spotify_oauth().refresh_access_token(refresh_token)
        except SpotifyOauthError as exc:
            # Refresh token revoked/invalid — force a fresh login.
            session.pop(TOKEN_INFO, None)
            raise PermissionError('Spotify session expired; please reconnect') from exc
        except requests.RequestException as exc:
            # Transient network/Spotify outage — keep the session, ask to retry.
            raise PermissionError('Could not reach Spotify to refresh your session') from exc
        session[TOKEN_INFO] = token_info

    return token_info


def get_spotify_client():
    """Return an authenticated ``spotipy.Spotify`` client for the session user."""
    token_info = get_token()
    access_token = token_info.get('access_token')
    if not access_token:
        raise PermissionError('No Spotify access token')
    return spotipy.Spotify(auth=access_token)


def create_playlist_with_tracks(sp, user_id, name, track_ids, public=True):
    """Create a playlist and add ``track_ids``, chunked to Spotify's
    100-tracks-per-request limit.

    Shared by the manual (`/create-playlist`) and AI (`/ai/generate`) flows so
    the chunking lives in exactly one place (the AI path previously added all
    tracks in a single unchunked call).
    """
    playlist = sp.user_playlist_create(user_id, name, public=public)
    uris = [f'spotify:track:{tid}' for tid in track_ids]
    for i in range(0, len(uris), 100):
        sp.user_playlist_add_tracks(user_id, playlist['id'], uris[i:i + 100])
    return playlist
