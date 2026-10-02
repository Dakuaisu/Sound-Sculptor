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


PLAYLIST_SCHEMA = {
    'name': 'playlist',
    'strict': True,
    'schema': {
        'type': 'object',
        'properties': {
            'playlist_name': {'type': 'string'},
            'songs': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {'title': {'type': 'string'}, 'artist': {'type': 'string'}},
                    'required': ['title', 'artist'],
                    'additionalProperties': False,
                },
            },
        },
        'required': ['playlist_name', 'songs'],
        'additionalProperties': False,
    },
}


def _songs_from_payload(payload) -> list[dict]:
    """Keep only well-formed {title, artist} entries; the schema is enforced, but never trust it blindly."""
    songs = payload.get('songs') if isinstance(payload, dict) else None
    if not isinstance(songs, list):
        return []
    return [
        {'title': s['title'].strip(), 'artist': s['artist'].strip()}
        for s in songs
        if isinstance(s, dict) and isinstance(s.get('title'), str) and isinstance(s.get('artist'), str)
        and s['title'].strip() and s['artist'].strip()
    ]


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
    model = current_app.config.get('OPENAI_MODEL')
    if not api_key or not model:
        logger.error('AI generation needs OPENAI_API_KEY and OPENAI_MODEL to be set')
        return {'error': 'AI playlist generation is not configured'}, 503

    sp = get_spotify_client()  # PermissionError -> 401 via the central handler

    # --- Ask OpenAI for song recommendations ---
    try:
        client = OpenAI(api_key=api_key, timeout=30)
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are a music recommendation assistant. Given a description, '
                        'recommend 10-30 real, released songs that exist on Spotify, each with '
                        'its primary credited artist, and suggest a creative playlist name.'
                    ),
                },
                {
                    'role': 'user',
                    'content': f'Create a playlist that fits: {prompt}',
                },
            ],
            temperature=0.8,
            max_completion_tokens=current_app.config['OPENAI_MAX_COMPLETION_TOKENS'],
            response_format={'type': 'json_schema', 'json_schema': PLAYLIST_SCHEMA},
        )
    except OpenAIError as exc:
        logger.warning('OpenAI request failed: %s', exc)
        return {'error': 'The AI service is unavailable right now. Please try again.'}, 502

    message = completion.choices[0].message if completion.choices else None
    if message is None or message.refusal:
        logger.warning('AI declined the request: %s', getattr(message, 'refusal', None))
        return {'error': "The AI couldn't create a playlist for that prompt. Try a different one."}, 502
    try:
        payload = json.loads(message.content or '')
    except json.JSONDecodeError:
        # e.g. finish_reason == 'length' cuts the JSON off mid-way.
        logger.warning('AI returned invalid JSON (finish_reason=%s)', completion.choices[0].finish_reason)
        return {'error': 'Could not read the AI recommendations. Try a different prompt.'}, 502

    songs = _songs_from_payload(payload)
    if not songs:
        logger.warning('AI response contained no usable songs')
        return {'error': 'Could not read the AI recommendations. Try a different prompt.'}, 502
    playlist_name = str(payload.get('playlist_name') or '').strip() or 'AI Generated Playlist'

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
