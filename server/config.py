import os
import tempfile

from cachelib import FileSystemCache
from dotenv import load_dotenv

load_dotenv()

DEV_SECRET_KEY = 'dev-fallback-change-me'
PLACEHOLDER_SECRET_KEYS = {DEV_SECRET_KEY, 'change-me-to-a-random-string'}


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

    # Server-side sessions: the cookie holds only a random session id, and the
    # Spotify tokens stay on the server (Flask's default cookie is readable).
    SESSION_TYPE = 'cachelib'
    SESSION_PERMANENT = False
    SESSION_CACHELIB = FileSystemCache(
        os.environ.get('SESSION_DIR', os.path.join(tempfile.gettempdir(), 'sound-sculptor-sessions')),
        mode=0o600,
    )

    SPOTIFY_CLIENT_ID = os.environ.get('CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
    # private: create/fill private playlists; public: listed for DELETE /me/library (L1 cleanup).
    SPOTIFY_SCOPES = 'playlist-modify-private playlist-modify-public'

    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo')
    OPENAI_MAX_COMPLETION_TOKENS = int(os.environ.get('OPENAI_MAX_COMPLETION_TOKENS', '1000'))
    PREDICT_N = int(os.environ.get('PREDICT_N', '20'))
    AI_RATE_LIMIT = os.environ.get('AI_RATE_LIMIT', '5 per minute;50 per day')
    # In-memory limits are per gunicorn worker; use a shared store (e.g. Redis) to make them global.
    RATELIMIT_STORAGE_URI = os.environ.get('RATELIMIT_STORAGE_URI', 'memory://')

    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://127.0.0.1:5173')
    # Must be registered verbatim in the Spotify dashboard. Spotify rejects
    # `localhost`; loopback must be 127.0.0.1, anything else must be HTTPS.
    SPOTIFY_REDIRECT_URI = os.environ.get(
        'SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5173/api/callback'
    )

    @staticmethod
    def validate(app):
        """Fail fast on misconfiguration in production rather than deep in a request."""
        is_prod = os.environ.get('FLASK_ENV', 'development').lower() == 'production'
        if not is_prod:
            return

        problems = []
        secret = app.config.get('SECRET_KEY')
        if not secret or secret in PLACEHOLDER_SECRET_KEYS:
            problems.append('SECRET_KEY must be set to a strong, unique value')
        if not app.config.get('SPOTIFY_CLIENT_ID') or not app.config.get('SPOTIFY_CLIENT_SECRET'):
            problems.append('CLIENT_ID and CLIENT_SECRET must be set')
        if problems:
            raise RuntimeError('Invalid production configuration: ' + '; '.join(problems))
