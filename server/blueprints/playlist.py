import logging
from flask import Blueprint, request, jsonify, redirect
from server.services.spotify import get_spotify_client
from server.services.ml import predict_songs, FEATURE_KEYS

logger = logging.getLogger(__name__)

playlist_bp = Blueprint('playlist', __name__, url_prefix='/api')


@playlist_bp.route('/predict', methods=['POST'])
def predict():
    """Accept audio feature sliders and return recommended track IDs."""
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

    try:
        song_ids = predict_songs(features)
    except FileNotFoundError as exc:
        logger.error('ML model unavailable: %s', exc)
        return {'error': 'ML model not available'}, 503
    except Exception as exc:
        logger.exception('Prediction failed')
        return {'error': 'Prediction failed'}, 500

    return jsonify({'recommended_song_ids': song_ids})


@playlist_bp.route('/save-discover-weekly', methods=['POST'])
def save_discover_weekly():
    """Clone the user's Discover Weekly into a persistent playlist."""
    try:
        sp = get_spotify_client()
    except PermissionError:
        return {'error': 'Not authenticated'}, 401

    user_id = sp.current_user()['id']

    # Paginate through all playlists
    discover_weekly_id = None
    saved_weekly_id = None
    results = sp.current_user_playlists()

    while True:
        for pl in results['items']:
            if pl['name'] == 'Discover Weekly':
                discover_weekly_id = pl['id']
            if pl['name'] == 'Saved Weekly':
                saved_weekly_id = pl['id']
        if not results['next']:
            break
        results = sp.next(results)

    if not discover_weekly_id:
        return {'error': 'Discover Weekly playlist not found'}, 404

    if not saved_weekly_id:
        new_pl = sp.user_playlist_create(user_id, 'Saved Weekly', True)
        saved_weekly_id = new_pl['id']

    tracks = sp.playlist_items(discover_weekly_id)
    uris = [item['track']['uri'] for item in tracks['items'] if item.get('track')]
    if uris:
        sp.user_playlist_add_tracks(user_id, saved_weekly_id, uris)

    return {'message': 'Discover Weekly saved', 'playlist_id': saved_weekly_id}


@playlist_bp.route('/user-data')
def user_data():
    """Return the authenticated user's playlists."""
    try:
        sp = get_spotify_client()
    except PermissionError:
        return {'error': 'Not authenticated'}, 401

    return jsonify(sp.current_user_playlists())


@playlist_bp.route('/create-playlist', methods=['POST'])
def create_playlist():
    """Create a Spotify playlist from a list of track IDs."""
    data = request.get_json(silent=True)
    if not data:
        return {'error': 'Request body must be JSON'}, 400

    track_ids = data.get('track_ids', [])
    name = data.get('name', 'Sound Sculptor Playlist')

    if not track_ids:
        return {'error': 'track_ids is required and must be non-empty'}, 400

    try:
        sp = get_spotify_client()
    except PermissionError:
        return {'error': 'Not authenticated'}, 401

    user_id = sp.current_user()['id']
    playlist = sp.user_playlist_create(user_id, name, public=True)
    uris = [f'spotify:track:{tid}' for tid in track_ids]

    # Spotify allows max 100 tracks per request
    for i in range(0, len(uris), 100):
        sp.user_playlist_add_tracks(user_id, playlist['id'], uris[i:i + 100])

    return {
        'playlist_id': playlist['id'],
        'external_url': playlist['external_urls'].get('spotify', ''),
    }
