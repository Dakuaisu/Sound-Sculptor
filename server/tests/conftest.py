import os
import tempfile

import pytest

# Set a deterministic, non-production environment BEFORE the app (and its
# dotenv load) is imported, so Config.validate() is a no-op and a SECRET_KEY exists.
os.environ.setdefault('SECRET_KEY', 'test-secret-key')
os.environ.setdefault('FLASK_ENV', 'testing')
os.environ.setdefault('CLIENT_ID', 'test-client-id')
os.environ.setdefault('CLIENT_SECRET', 'test-client-secret')
os.environ.setdefault('SESSION_DIR', tempfile.mkdtemp(prefix='ss-test-sessions-'))

from server.app import create_app  # noqa: E402


@pytest.fixture
def app():
    application = create_app()
    application.config.update(TESTING=True)
    return application


@pytest.fixture
def client(app):
    return app.test_client()
