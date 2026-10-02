import logging
import os

from flask import Flask, jsonify
from flask_session import Session
from werkzeug.middleware.proxy_fix import ProxyFix

from server.config import Config
from server.errors import register_error_handlers


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(config or Config)

    _configure_logging()
    Config.validate(app)
    Session(app)

    # Trust reverse proxy headers (nginx) so url_for generates correct URLs.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    from server.blueprints.auth import auth_bp
    from server.blueprints.playlist import playlist_bp
    from server.blueprints.ai import ai_bp, limiter

    app.register_blueprint(auth_bp)
    app.register_blueprint(playlist_bp)
    app.register_blueprint(ai_bp)
    limiter.init_app(app)

    register_error_handlers(app)

    from server.services.ml import INDEX_PATH
    if not os.path.isfile(INDEX_PATH):
        logging.getLogger(__name__).warning(
            'KNN index not found at %s; /api/predict will return 503. '
            'Build it with: python scripts/build_index.py', INDEX_PATH)

    @app.route('/api/health')
    def health():
        return jsonify(status='ok')

    return app


def _configure_logging():
    """Route application loggers to stdout (gunicorn captures stdout)."""
    root = logging.getLogger()
    if not root.handlers:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(levelname)s %(name)s: %(message)s',
        )
