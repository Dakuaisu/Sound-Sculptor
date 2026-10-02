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


_VALID_FEATURES = {
    'danceability': 0.5, 'energy': 0.5, 'loudness': -8.0, 'acousticness': 0.2,
    'instrumentalness': 0.0, 'tempo': 120.0, 'liveness': 0.1,
}


def test_predict_rejects_non_finite_values(client):
    body = '{"danceability": Infinity, "energy": NaN, "loudness": -8, "acousticness": 0.2, ' \
           '"instrumentalness": 0, "tempo": 120, "liveness": 0.1}'
    resp = client.post('/api/predict', data=body, content_type='application/json')
    assert resp.status_code == 400


def test_predict_rejects_out_of_range_values(client):
    for key, bad in [('danceability', 1.5), ('loudness', 5.0), ('tempo', 1000.0)]:
        resp = client.post('/api/predict', json={**_VALID_FEATURES, key: bad})
        assert resp.status_code == 400, key
        assert key in resp.get_json()['error']


def test_predict_accepts_slider_extremes(client, monkeypatch):
    from server.blueprints import playlist
    monkeypatch.setattr(playlist, 'predict_songs', lambda f: ['t1'])
    lows = {'danceability': 0, 'energy': 0, 'loudness': -60, 'acousticness': 0,
            'instrumentalness': 0, 'tempo': 40, 'liveness': 0}
    highs = {'danceability': 1, 'energy': 1, 'loudness': 0, 'acousticness': 1,
             'instrumentalness': 1, 'tempo': 220, 'liveness': 1}
    assert client.post('/api/predict', json=lows).status_code == 200
    assert client.post('/api/predict', json=highs).status_code == 200


def test_logout_clears_spotify_token(client):
    with client.session_transaction() as sess:
        sess['token_info'] = {'access_token': 'x', 'refresh_token': 'y', 'expires_at': 9999999999}
    assert client.post('/api/logout').status_code == 200
    with client.session_transaction() as sess:
        assert 'token_info' not in sess
