import os
from dotenv import load_dotenv
from flask import current_app

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-fallback-change-me')
    SESSION_COOKIE_NAME = 'sound_sculptor_cookie'
    
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
    # print(current_app.config['SPOTIFY_CLIENT_ID'])
    # print(current_app.config['SPOTIFY_CLIENT_SECRET'])
    # print("ID:", current_app.config['SPOTIFY_CLIENT_ID'])
    # print("SECRET:", current_app.config['SPOTIFY_CLIENT_SECRET'])
