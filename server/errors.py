"""Centralized error handling.

Maps the exceptions raised by the Spotify / OpenAI integrations and the rest of
the app to consistent JSON responses so the frontend always receives a
``{"error": ...}`` body (the shape ``soundfrnt/src/services/api.js`` expects)
instead of an HTML stack trace.

Registering these here means individual route handlers can simply call
``get_spotify_client()`` — which raises ``PermissionError`` when there is no
usable session token — without repeating ``try/except`` blocks everywhere.
"""
import logging

from flask import jsonify
from werkzeug.exceptions import HTTPException
from spotipy.exceptions import SpotifyException
from spotipy.oauth2 import SpotifyOauthError

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    """Attach JSON error handlers to the Flask app."""

    @app.errorhandler(PermissionError)
    def _permission(exc):
        # Raised by the spotify service when there is no usable session token.
        return jsonify(error=str(exc) or 'Not authenticated with Spotify'), 401

    @app.errorhandler(FileNotFoundError)
    def _missing_artifact(exc):
        # Raised by the ML service when model.pkl / tracks_features.csv are absent.
        logger.error('Required model artifact missing: %s', exc)
        return jsonify(error='The recommendation model is not available'), 503

    @app.errorhandler(SpotifyException)
    def _spotify(exc):
        status = getattr(exc, 'http_status', None) or 502
        if status in (401, 403):
            return jsonify(error='Your Spotify session expired. Please reconnect.'), 401
        if status == 429:
            return jsonify(error='Spotify is rate limiting requests. Please try again shortly.'), 429
        logger.warning('Spotify API error (%s): %s', status, exc)
        return jsonify(error='Spotify request failed. Please try again.'), 502

    @app.errorhandler(SpotifyOauthError)
    def _spotify_oauth(exc):
        logger.warning('Spotify OAuth error: %s', exc)
        return jsonify(error='Spotify authorization failed. Please reconnect.'), 401

    @app.errorhandler(404)
    def _not_found(_exc):
        return jsonify(error='Not found'), 404

    @app.errorhandler(405)
    def _method_not_allowed(_exc):
        return jsonify(error='Method not allowed'), 405

    @app.errorhandler(Exception)
    def _unexpected(exc):
        # Let Flask format known HTTP errors (and surface the debugger in dev).
        if isinstance(exc, HTTPException):
            return exc
        if app.debug:
            raise exc
        logger.exception('Unhandled exception')
        return jsonify(error='Internal server error'), 500
