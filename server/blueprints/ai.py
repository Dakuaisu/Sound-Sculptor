import json
import logging
import re

from flask import Blueprint, request, session
from openai import OpenAI
from server.config import Config
from server.services.spotify import get_spotify_client

logger = logging.getLogger(__name__)

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')


def _parse_songs_from_text(text: str) -> list[dict]:
    """Extract song entries from the AI response text.

    Handles common formats:
    - "Song Name" by Artist
    - 1. Song Name - Artist
    - Song Name — Artist
    """
    songs = []

    # Try JSON first (in case the model returns structured data)
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict) and 'songs' in parsed:
            return parsed['songs']
        if isinstance(parsed, list):
            return parsed
    except (json.JSONDecodeError, TypeError):
        pass

    # Regex patterns for common song listing formats
    patterns = [
        # "Song" by Artist  or  "Song" - Artist
        r'"([^"]+)"\s*(?:by|[-–—])\s*(.+)',
        # N. Song - Artist  or  N) Song - Artist
        r'^\d+[.)]\s*(.+?)\s*[-–—]\s*(.+)',
        # N. "Song" by Artist
        r'^\d+[.)]\s*"([^"]+)"\s*(?:by|[-–—])\s*(.+)',
    ]

    for line in text.strip().split('\n'):
        line = line.strip()
        if not line:
            continue
        for pattern in patterns:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                groups = match.groups()
                songs.append({
                    'title': groups[0].strip(),
                    'artist': groups[1].strip() if len(groups) > 1 else '',
                })
                break

    return songs


@ai_bp.route('/generate', methods=['POST'])
def generate():
    """Generate a playlist via OpenAI based on a text prompt."""
    data = request.get_json(silent=True)
    if not data or not data.get('prompt', '').strip():
        return {'error': 'A non-empty prompt is required'}, 400

    prompt = data['prompt'].strip()
    if len(prompt) > 500:
        return {'error': 'Prompt must be 500 characters or fewer'}, 400

    api_key = Config.OPENAI_API_KEY
    if not api_key:
        return {'error': 'OpenAI API key not configured'}, 503

    try:
        sp = get_spotify_client()
    except PermissionError:
        return {'error': 'Not authenticated with Spotify'}, 401

    # Ask OpenAI for song recommendations
    client = OpenAI(api_key=api_key)
    completion = client.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[
            {
                'role': 'system',
                'content': (
                    'You are MusicGPT, a world-class music recommendation AI. '
                    'Given a description, recommend 10-30 songs. '
                    'Format each song on its own line as: "Song Title" by Artist Name. '
                    'Also suggest a creative playlist name on the first line, '
                    'prefixed with "Playlist: ".'
                ),
            },
            {
                'role': 'user',
                'content': f'Create a playlist that fits: {prompt}',
            },
        ],
        temperature=0.8,
    )

    response_text = completion.choices[0].message.content or ''
    logger.info('AI response: %s', response_text[:200])

    # Extract playlist name from first line
    lines = response_text.strip().split('\n')
    playlist_name = 'AI Generated Playlist'
    if lines and lines[0].lower().startswith('playlist:'):
        playlist_name = lines[0].split(':', 1)[1].strip().strip('"')

    # Parse songs
    songs = _parse_songs_from_text(response_text)
    if not songs:
        return {
            'error': 'Could not parse song recommendations from AI',
            'raw_response': response_text,
        }, 502

    # Search Spotify for each song
    track_ids = []
    matched_tracks = []
    for song in songs:
        query = song.get('title', '')
        artist = song.get('artist', '')
        search_q = f'{query} {artist}'.strip()
        if not search_q:
            continue

        results = sp.search(q=search_q, type='track', limit=1)
        items = results.get('tracks', {}).get('items', [])
        if items:
            track = items[0]
            track_ids.append(track['id'])
            matched_tracks.append({
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join(a['name'] for a in track['artists']),
                'query': search_q,
            })

    if not track_ids:
        return {'error': 'No matching tracks found on Spotify'}, 404

    # Create playlist
    user_id = sp.current_user()['id']
    playlist = sp.user_playlist_create(user_id, playlist_name, public=True)
    uris = [f'spotify:track:{tid}' for tid in track_ids]
    sp.user_playlist_add_tracks(user_id, playlist['id'], uris)

    result = {
        'playlist_id': playlist['id'],
        'playlist_name': playlist_name,
        'external_url': playlist['external_urls'].get('spotify', ''),
        'tracks': matched_tracks,
        'total_matched': len(matched_tracks),
        'total_requested': len(songs),
    }

    session['playlist_id'] = playlist['id']
    return result


@ai_bp.route('/save', methods=['POST'])
def save():
    """Save a previously generated playlist to the user's library."""
    data = request.get_json(silent=True)
    playlist_id = (data or {}).get('playlist_id') or session.get('playlist_id')

    if not playlist_id:
        return {'error': 'No playlist_id provided'}, 400

    try:
        sp = get_spotify_client()
    except PermissionError:
        return {'error': 'Not authenticated'}, 401

    sp.current_user_follow_playlist(playlist_id)
    return {'message': 'Playlist saved to library'}
