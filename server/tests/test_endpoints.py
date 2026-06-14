"""Endpoint-level tests using the Flask test client.

These exercise validation, the central error handlers, and the token-refresh
guard WITHOUT any network access (no real Spotify/OpenAI calls are reached).
"""


def test_health_ok(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'ok'


def test_me_requires_auth_returns_json_401(client):
    resp = client.get('/api/me')
    assert resp.status_code == 401
    assert 'error' in resp.get_json()


def test_expired_token_without_refresh_returns_401(client):
    # Token present but expired and missing a refresh_token -> clean 401, no 500.
    with client.session_transaction() as sess:
        sess['token_info'] = {'access_token': 'x', 'expires_at': 0}
    resp = client.get('/api/me')
    assert resp.status_code == 401


def test_predict_requires_json(client):
    assert client.post('/api/predict', json={}).status_code == 400


def test_predict_missing_features(client):
    resp = client.post('/api/predict', json={'danceability': 0.5})
    assert resp.status_code == 400
    assert 'Missing features' in resp.get_json()['error']


def test_predict_invalid_feature_value(client):
    payload = {k: 'oops' for k in [
        'danceability', 'energy', 'loudness', 'acousticness',
        'instrumentalness', 'tempo', 'liveness',
    ]}
    assert client.post('/api/predict', json=payload).status_code == 400


def test_create_playlist_rejects_non_list(client):
    resp = client.post('/api/create-playlist', json={'track_ids': 'abc'})
    assert resp.status_code == 400


def test_create_playlist_rejects_empty(client):
    assert client.post('/api/create-playlist', json={'track_ids': []}).status_code == 400


def test_create_playlist_rejects_non_string_elements(client):
    resp = client.post('/api/create-playlist', json={'track_ids': [1, 2, 3]})
    assert resp.status_code == 400


def test_ai_generate_requires_prompt(client):
    assert client.post('/api/ai/generate', json={'prompt': '   '}).status_code == 400


def test_ai_save_requires_playlist_id(client):
    assert client.post('/api/ai/save', json={}).status_code == 400


def test_unknown_route_returns_json_404(client):
    resp = client.get('/api/does-not-exist')
    assert resp.status_code == 404
    assert resp.get_json()['error']


def test_dead_endpoints_removed(client):
    assert client.get('/api/user-data').status_code == 404
    assert client.post('/api/save-discover-weekly').status_code == 404
