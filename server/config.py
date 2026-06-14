import os
from dotenv import load_dotenv

load_dotenv()

DEV_SECRET_KEY = 'dev-fallback-change-me'


def _flag(name, default=False):
    """Read a boolean-ish environment variable."""
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in ('1', 'true', 'yes', 'on')


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', DEV_SECRET_KEY)
    SESSION_COOKIE_NAME = 'sound_sculptor_cookie'

    # Cookie hardening. HttpOnly keeps the session cookie out of JS. SameSite=Lax
    # still lets the cookie ride the top-level GET redirect back from Spotify's
    # OAuth screen (so the CSRF `state` survives the round trip). Secure is opt-in
    # via SESSION_COOKIE_SECURE so HTTP-only local/dev deployments keep working;
    # set SESSION_COOKIE_SECURE=1 once the app is served over HTTPS.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = _flag('SESSION_COOKIE_SECURE', False)

    SPOTIFY_CLIENT_ID = os.environ.get('CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
    SPOTIFY_SCOPES = (
        'user-library-read '
        'playlist-read-private '
        'user-top-read '
        'playlist-modify-public'
    )

    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS', 'http://localhost:5173'
    ).split(',')

    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

    @staticmethod
    def validate(app):
        """Fail fast on misconfiguration in production rather than deep in a request."""
        is_prod = os.environ.get('FLASK_ENV', 'development').lower() == 'production'
        if not is_prod:
            return

        problems = []
        secret = app.config.get('SECRET_KEY')
        if not secret or secret == DEV_SECRET_KEY:
            problems.append('SECRET_KEY must be set to a strong, unique value')
        if not app.config.get('SPOTIFY_CLIENT_ID') or not app.config.get('SPOTIFY_CLIENT_SECRET'):
            problems.append('CLIENT_ID and CLIENT_SECRET must be set')
        if problems:
            raise RuntimeError('Invalid production configuration: ' + '; '.join(problems))
