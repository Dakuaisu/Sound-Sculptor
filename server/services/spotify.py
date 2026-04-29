import time
import spotipy
from flask import session, current_app, url_for
from spotipy.oauth2 import SpotifyOAuth

TOKEN_INFO = 'token_info'


def get_spotify_oauth():
    """Build a SpotifyOAuth instance from app config."""
    cfg = current_app.config
    return SpotifyOAuth(
        client_id=cfg['SPOTIFY_CLIENT_ID'],
        client_secret=cfg['SPOTIFY_CLIENT_SECRET'],
        redirect_uri=url_for('auth.callback', _external=True),
        scope=cfg['SPOTIFY_SCOPES'],
    )


def get_token():
    """Return a valid Spotify token dict from the session.

    Refreshes automatically if expired.
    Raises ``PermissionError`` when no token is stored.
    """
    token_info = session.get(TOKEN_INFO)
    if not token_info:
        raise PermissionError('No Spotify token in session')

    expires_at = token_info.get('expires_at', 0)
    if expires_at - int(time.time()) < 60:
        oauth = get_spotify_oauth()
        token_info = oauth.refresh_access_token(token_info['refresh_token'])
        session[TOKEN_INFO] = token_info

    return token_info


def get_spotify_client():
    """Return an authenticated ``spotipy.Spotify`` client."""
    token_info = get_token()
    return spotipy.Spotify(auth=token_info['access_token'])
