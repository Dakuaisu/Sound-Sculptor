from urllib.parse import parse_qs, urlparse

from spotipy.oauth2 import SpotifyOAuth


def _authorize_query(resp):
    return parse_qs(urlparse(resp.headers['Location']).query)


def test_redirect_uri_comes_from_config_not_request_headers(app, client):
    app.config['SPOTIFY_REDIRECT_URI'] = 'http://127.0.0.1:5173/api/callback'
    resp = client.get('/api/connect', headers={'Host': 'evil.test', 'X-Forwarded-Host': 'evil.test'})
    assert _authorize_query(resp)['redirect_uri'] == ['http://127.0.0.1:5173/api/callback']


def test_callback_with_matching_state_stores_token(app, client, monkeypatch):
    fake_token = {'access_token': 'synthetic', 'refresh_token': 'synthetic', 'expires_at': 9999999999}
    monkeypatch.setattr(SpotifyOAuth, 'get_access_token', lambda self, code, check_cache=False: fake_token)
    state = _authorize_query(client.get('/api/connect'))['state'][0]

    resp = client.get(f'/api/callback?code=abc&state={state}')
    assert resp.headers['Location'] == f"{app.config['FRONTEND_URL']}/choice"
    with client.session_transaction() as sess:
        assert sess['token_info'] == fake_token


def test_callback_with_wrong_state_is_rejected(app, client):
    client.get('/api/connect')
    resp = client.get('/api/callback?code=abc&state=forged')
    assert resp.headers['Location'] == f"{app.config['FRONTEND_URL']}/connect"
    with client.session_transaction() as sess:
        assert 'token_info' not in sess
