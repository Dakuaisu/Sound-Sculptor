import secrets

from flask import Blueprint, redirect, request, session, current_app
from spotipy.oauth2 import SpotifyOauthError

from server.services.spotify import get_spotify_oauth, get_spotify_client, TOKEN_INFO

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

_OAUTH_STATE = 'oauth_state'


@auth_bp.route('/connect')
def connect():
    """Redirect the user to Spotify's authorization page with a CSRF state token."""
    session.clear()
    state = secrets.token_urlsafe(24)
    session[_OAUTH_STATE] = state
    auth_url = get_spotify_oauth().get_authorize_url(state=state)
    return redirect(auth_url)


@auth_bp.route('/callback')
def callback():
    """Handle the Spotify OAuth callback: validate state, store token, redirect.

    On any problem (consent denied, missing/forged state, token-exchange error)
    the user is redirected back to the frontend connect screen rather than shown
    a raw error — the OAuth code is single-use, so a re-submitted stale code must
    not 500.
    """
    frontend_url = current_app.config['FRONTEND_URL']
    expected_state = session.get(_OAUTH_STATE)

    # The user denied consent, or Spotify returned an error.
    if request.args.get('error'):
        session.clear()
        return redirect(f'{frontend_url}/connect')

    code = request.args.get('code')
    state = request.args.get('state')

    # CSRF / login-fixation guard: the returned state must match what we issued.
    if not code or not expected_state or state != expected_state:
        session.clear()
        return redirect(f'{frontend_url}/connect')

    session.clear()
    try:
        token_info = get_spotify_oauth().get_access_token(code, check_cache=False)
    except SpotifyOauthError:
        return redirect(f'{frontend_url}/connect')

    session[TOKEN_INFO] = token_info
    return redirect(f'{frontend_url}/choice')


@auth_bp.route('/me')
def me():
    """Return basic info about the authenticated Spotify user.

    ``get_spotify_client()`` raises ``PermissionError`` (→ 401) and any Spotify
    error becomes a structured response via the central error handlers.
    """
    sp = get_spotify_client()
    user = sp.current_user()
    return {
        'id': user['id'],
        'display_name': user.get('display_name'),
        'images': user.get('images', []),
    }
