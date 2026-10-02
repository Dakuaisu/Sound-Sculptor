import json
import logging
import re
import unicodedata

from flask import Blueprint, request, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from openai import OpenAI, OpenAIError
from spotipy.exceptions import SpotifyException

from server.services.spotify import get_spotify_client, create_playlist_with_tracks

logger = logging.getLogger(__name__)

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')
limiter = Limiter(key_func=get_remote_address)

MAX_PROMPT_LEN = 500
SEARCH_LIMIT = 10  # Spotify's maximum for /search
_CREDIT_SEPARATORS = re.compile(r'\s*(?:,|&|\bfeat\.?|\bft\.?|\bfeaturing\b|\bwith\b|\sx\s)\s*', re.IGNORECASE)


def _norm(name: str) -> str:
    decomposed = unicodedata.normalize('NFKD', name)
    return ''.join(c for c in decomposed if c.isalnum()).lower()


def _artist_names(artist: str) -> set[str]:
    """Normalized forms of a credited artist string, whole and split on feat./&/, credits."""
    parts = [artist, *_CREDIT_SEPARATORS.split(artist)]
    return {n for n in (_norm(p) for p in parts) if n}


def _pick_matching_track(items: list[dict], artist: str) -> dict | None:
    """Return the first search hit credited to the LLM-named artist, or None.

    The model can name songs that don't exist; Spotify search still returns
    *something*, so an unverified hit would silently add an unrelated song.
    """
    wanted = _artist_names(artist or '')
    for track in items:
        if wanted & {_norm(a.get('name', '')) for a in track.get('artists', [])}:
            return track
    return None


def _match_songs(sp, songs: list[dict]) -> list[dict]:
    """Look each song up on Spotify; report every song as matched / not_found / search_failed."""
    results = []
    for song in songs:
        title, artist = song.get('title', '').strip(), song.get('artist', '').strip()
        entry = {'title': title, 'artist': artist, 'status': 'not_found', 'track': None}
        results.append(entry)
        if not title or not artist:
            continue
        try:
            found = sp.search(q=f'track:{title} artist:{artist}', type='track', limit=SEARCH_LIMIT)
        except SpotifyException as exc:
            logger.warning('Spotify search failed for %r by %r: %s', title, artist, exc)
            entry['status'] = 'search_failed'
            continue
        track = _pick_matching_track(found.get('tracks', {}).get('items', []), artist)
        if track:
            entry['status'] = 'matched'
            entry['track'] = {
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join(a['name'] for a in track['artists']),
            }
    return results


def _parse_songs_from_text(text: str) -> list[dict]:
    """Extract song entries from the AI response text.

    Handles common formats: ``"Song" by Artist``, ``1. Song - Artist``,
    ``- Song by Artist`` (bullets), ``**Song** by Artist`` (markdown), and a
    structured JSON ``{"songs": [...]}`` fast-path.
    """
    # Structured JSON fast-path (in case the model returns structured data).
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            parsed = parsed.get('songs')
        if isinstance(parsed, list):
            return [
                {'title': s['title'].strip(), 'artist': str(s.get('artist') or '').strip()}
                for s in parsed
                if isinstance(s, dict) and isinstance(s.get('title'), str) and s['title'].strip()
            ]
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
@limiter.limit(lambda: current_app.config['AI_RATE_LIMIT'])
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
            model=current_app.config['OPENAI_MODEL'],
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
            max_completion_tokens=current_app.config['OPENAI_MAX_COMPLETION_TOKENS'],
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

    statuses = _match_songs(sp, songs)
    matched_tracks = []
    for entry in statuses:
        if entry['status'] == 'matched' and entry['track']['id'] not in {t['id'] for t in matched_tracks}:
            matched_tracks.append(entry['track'])
    matched_songs = sum(e['status'] == 'matched' for e in statuses)
    match_summary = {'songs': statuses, 'match_rate': round(matched_songs / len(statuses), 3)}

    if not matched_tracks:
        return {'error': 'None of the suggested songs were found on Spotify', **match_summary}, 404
    track_ids = [t['id'] for t in matched_tracks]

    # --- Create the playlist (chunked) ---
    playlist = create_playlist_with_tracks(sp, playlist_name, track_ids)

    result = {
        'playlist_id': playlist['id'],
        'playlist_name': playlist_name,
        'external_url': playlist['external_urls'].get('spotify', ''),
        'tracks': matched_tracks,
        'total_matched': len(matched_tracks),
        'total_requested': len(songs),
        **match_summary,
    }

    return result
