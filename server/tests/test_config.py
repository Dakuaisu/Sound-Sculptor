import pytest
from flask import Flask

from server.config import Config


def _app(secret):
    app = Flask(__name__)
    app.config.update(SECRET_KEY=secret, SPOTIFY_CLIENT_ID='id', SPOTIFY_CLIENT_SECRET='s')
    return app


@pytest.mark.parametrize('secret', ['dev-fallback-change-me', 'change-me-to-a-random-string', ''])
def test_production_rejects_placeholder_secret_keys(monkeypatch, secret):
    monkeypatch.setenv('FLASK_ENV', 'production')
    with pytest.raises(RuntimeError, match='SECRET_KEY'):
        Config.validate(_app(secret))


def test_production_accepts_real_secret_key(monkeypatch):
    monkeypatch.setenv('FLASK_ENV', 'production')
    Config.validate(_app('a-real-randomly-generated-value'))
