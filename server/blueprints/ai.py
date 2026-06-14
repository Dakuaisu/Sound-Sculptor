import json
import logging
import re

from flask import Blueprint, request, session, current_app
from openai import OpenAI, OpenAIError
from spotipy.exceptions import SpotifyException

from server.services.spotify import get_spotify_client, create_playlist_with_tracks

logger = logging.getLogger(__name__)

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

MAX_PROMPT_LEN = 500


def _parse_songs_from_text(text: str) -> list[dict]:
    """Extract song entries from the AI response text.

    Handles common formats: ``"Song" by Artist``, ``1. Song - Artist``,
    ``- Song by Artist`` (bullets), ``**Song** by Artist`` (markdown), and a
    structured JSON ``{"songs": [...]}`` fast-path.
    """
    # Structured JSON fast-path (in case the model returns structured data).
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict) and 'songs' in parsed:
            return parsed['songs']
        if isinstance(parsed, list):
            return parsed
    except (json.JSONDecodeError, TypeError):
        pass

    patterns = [
        r'^\d+[.)]\s*"([^"]+)"\s*(?:by|[-–—])\s*(.+)',   # 1. "Song" by Artist
        r'"([^"]+)"\s*(?:by|[-–—])\s*(.+)',              # "Song" by Artist
        r'^\s*[-*•]\s*(.+?)\s*(?:by|[-–—])\s*(.+)',       # - Song by/— Artist (bullets)
        r'^\d+[.)]\s*(.+?)\s*(?:by|[-–—])\s*(.+)',        # 1. Song - Artist
        r'^(.+?)\s+(?:by|[-–—])\s+(.+)$',                 # Song by/— Artist (loose)
    ]

    songs = []
    for raw in text.strip().split('\n'):
        line = raw.strip()
        if not line or line.lower().startswith('playlist:'):
            continue
        for pattern in patterns:
            match = re.match(pattern, line, re.IGNORECASE)
            if match:
                title = match.group(1).strip().strip('*').strip('"').strip()
                artist = match.group(2).strip().strip('*').strip() if match.lastindex and match.lastindex >= 2 else ''
                if title:
                    songs.append({'title': title, 'artist': artist})
                break
    return songs


@ai_bp.route('/generate', methods=['POST'])
def generate():
    """Generate a playlist via OpenAI based on a text prompt."""
    data = request.get_json(silent=True)
    if not data or not data.get('prompt', '').strip():
        return {'error': 'A non-empty prompt is required'}, 400

    prompt = data['prompt'].strip()
    if len(prompt) > MAX_PROMPT_LEN:
        return {'error': f'Prompt must be {MAX_PROMPT_LEN} characters or fewer'}, 400

    api_key = current_app.config.get('OPENAI_API_KEY')
    if not api_key:
        return {'error': 'AI playlist generation is not configured'}, 503

    sp = get_spotify_client()  # PermissionError -> 401 via the central handler

    # --- Ask OpenAI for song recommendations ---
    try:
        client = OpenAI(api_key=api_key, timeout=30)
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
    except OpenAIError as exc:
        logger.warning('OpenAI request failed: %s', exc)
        return {'error': 'The AI service is unavailable right now. Please try again.'}, 502

    response_text = ''
    if completion.choices:
        response_text = completion.choices[0].message.content or ''
    logger.info('AI response (first 200 chars): %s', response_text[:200])

    # Extract playlist name from the first line.
    lines = response_text.strip().split('\n')
    playlist_name = 'AI Generated Playlist'
    if lines and lines[0].lower().startswith('playlist:'):
        playlist_name = lines[0].split(':', 1)[1].strip().strip('"') or playlist_name

    songs = _parse_songs_from_text(response_text)
    if not songs:
        # Do NOT echo raw model output back to the client (avoids leaking prompt
        # internals / unexpected content); log it server-side instead.
        logger.warning('Could not parse songs from AI response')
        return {'error': 'Could not read the AI recommendations. Try a different prompt.'}, 502

    # --- Search Spotify for each song (a single failed lookup is skipped, not fatal) ---
    track_ids = []
    matched_tracks = []
    for song in songs:
        search_q = f"{song.get('title', '')} {song.get('artist', '')}".strip()
        if not search_q:
            continue
        try:
            results = sp.search(q=search_q, type='track', limit=1)
        except SpotifyException as exc:
            logger.warning('Spotify search failed for %r: %s', search_q, exc)
            continue
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

    # --- Create the playlist (chunked) ---
    user_id = sp.current_user()['id']
    playlist = create_playlist_with_tracks(sp, user_id, playlist_name, track_ids, public=True)

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
    """Save (follow) a previously generated playlist into the user's library."""
    data = request.get_json(silent=True)
    playlist_id = (data or {}).get('playlist_id') or session.get('playlist_id')

    if not playlist_id:
        return {'error': 'No playlist_id provided'}, 400
    if not isinstance(playlist_id, str):
        return {'error': 'playlist_id must be a string'}, 400

    sp = get_spotify_client()  # PermissionError -> 401 via the central handler
    sp.current_user_follow_playlist(playlist_id)  # SpotifyException -> central handler
    return {'message': 'Playlist saved to library'}
