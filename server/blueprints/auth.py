from flask import Blueprint, redirect, request, session, current_app
from server.services.spotify import (
    get_spotify_oauth,
    get_token,
    get_spotify_client,
    TOKEN_INFO,
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/connect')
def connect():
    """Redirect the user to Spotify's authorization page."""
    session.clear()
    auth_url = get_spotify_oauth().get_authorize_url()
    return redirect(auth_url)


@auth_bp.route('/callback')
def callback():
    """Handle Spotify OAuth callback, store token, redirect to frontend."""
    session.clear()
    code = request.args.get('code')
    if not code:
        return {'error': 'Missing authorization code'}, 400

    oauth = get_spotify_oauth()
    token_info = oauth.get_access_token(code, check_cache=False)
    session[TOKEN_INFO] = token_info

    frontend_url = current_app.config['FRONTEND_URL']
    return redirect(f'{frontend_url}/choice')


@auth_bp.route('/me')
def me():
    """Return basic info about the authenticated Spotify user."""
    try:
        sp = get_spotify_client()
    except PermissionError:
        return {'error': 'Not authenticated'}, 401

    user = sp.current_user()
    return {
        'id': user['id'],
        'display_name': user.get('display_name'),
        'images': user.get('images', []),
    }
