from flask import Blueprint, request, jsonify

from server.services.spotify import get_spotify_client, create_playlist_with_tracks
from server.services.ml import predict_songs, FEATURE_KEYS

playlist_bp = Blueprint('playlist', __name__, url_prefix='/api')

MAX_TRACKS = 10000


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
    user_id = sp.current_user()['id']
    playlist = create_playlist_with_tracks(sp, user_id, name, track_ids, public=True)

    return {
        'playlist_id': playlist['id'],
        'external_url': playlist['external_urls'].get('spotify', ''),
    }
