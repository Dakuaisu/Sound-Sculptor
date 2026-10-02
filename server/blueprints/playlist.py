import math

from flask import Blueprint, request, jsonify

from server.services.spotify import get_spotify_client, create_playlist_with_tracks
from server.services.ml import predict_songs, FEATURE_KEYS

playlist_bp = Blueprint('playlist', __name__, url_prefix='/api')

MAX_TRACKS = 10000

# Must match the slider mapping in soundfrnt/src/pages/SliderStep.jsx.
FEATURE_RANGES = {
    'danceability': (0.0, 1.0),
    'energy': (0.0, 1.0),
    'loudness': (-60.0, 0.0),
    'acousticness': (0.0, 1.0),
    'instrumentalness': (0.0, 1.0),
    'tempo': (40.0, 220.0),
    'liveness': (0.0, 1.0),
}


@playlist_bp.route('/predict', methods=['POST'])
def predict():
    """Accept audio feature sliders and return recommended track IDs.

    A missing model artifact raises ``FileNotFoundError`` (→ 503) and any other
    failure surfaces as a 500 via the central error handlers.
    """
    data = request.get_json(silent=True)
    if not data:
        return {'error': 'Request body must be JSON'}, 400

    missing = [k for k in FEATURE_KEYS if k not in data]
    if missing:
        return {'error': f'Missing features: {missing}'}, 400

    try:
        features = {k: float(data[k]) for k in FEATURE_KEYS}
    except (ValueError, TypeError) as exc:
        return {'error': f'Invalid feature value: {exc}'}, 400

    for key, value in features.items():
        low, high = FEATURE_RANGES[key]
        if not math.isfinite(value) or not low <= value <= high:
            return {'error': f'{key} must be between {low} and {high}'}, 400

    song_ids = predict_songs(features)
    return jsonify({'recommended_song_ids': song_ids})


@playlist_bp.route('/create-playlist', methods=['POST'])
def create_playlist():
    """Create a Spotify playlist from a validated list of track IDs."""
    data = request.get_json(silent=True)
    if not data:
        return {'error': 'Request body must be JSON'}, 400

    track_ids = data.get('track_ids')
    name = data.get('name', 'Sound Sculptor Playlist')

    if not isinstance(track_ids, list) or not track_ids:
        return {'error': 'track_ids is required and must be a non-empty list'}, 400
    if not all(isinstance(t, str) and t for t in track_ids):
        return {'error': 'track_ids must contain only non-empty strings'}, 400
    if len(track_ids) > MAX_TRACKS:
        return {'error': f'track_ids exceeds the maximum of {MAX_TRACKS}'}, 400
    if not isinstance(name, str) or not name.strip():
        name = 'Sound Sculptor Playlist'

    sp = get_spotify_client()  # PermissionError -> 401 via the central handler
    playlist = create_playlist_with_tracks(sp, name, track_ids)

    return {
        'playlist_id': playlist['id'],
        'external_url': playlist['external_urls'].get('spotify', ''),
    }
