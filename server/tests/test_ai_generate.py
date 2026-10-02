"""/api/ai/generate with OpenAI and Spotify replaced by fakes.

All model output and search results below are synthetic fixtures.
"""
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from server.blueprints import ai


def _track(tid, name, *artists):
    return {'id': tid, 'name': name, 'artists': [{'name': a} for a in artists]}


@pytest.fixture
def fakes(app, monkeypatch):
    app.config['OPENAI_API_KEY'] = 'test-key'
    state = SimpleNamespace(llm_text='', search_results={}, create_calls=[])

    class FakeOpenAI:
        def __init__(self, **_kwargs):
            self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))

        def _create(self, **kwargs):
            state.openai_kwargs = kwargs
            msg = SimpleNamespace(content=state.llm_text)
            return SimpleNamespace(choices=[SimpleNamespace(message=msg)])

    sp = MagicMock()
    sp.search.side_effect = lambda q, **_kw: {'tracks': {'items': state.search_results.get(q, [])}}

    def fake_create(_sp, name, track_ids, public=True):
        state.create_calls.append(track_ids)
        return {'id': 'pl1', 'external_urls': {'spotify': 'https://example.test/pl1'}}

    monkeypatch.setattr(ai, 'OpenAI', FakeOpenAI)
    monkeypatch.setattr(ai, 'get_spotify_client', lambda: sp)
    monkeypatch.setattr(ai, 'create_playlist_with_tracks', fake_create)
    state.sp = sp
    return state


def test_rejects_top_hit_by_a_different_artist(client, fakes):
    fakes.llm_text = 'Playlist: Test\n"Made Up Song" by Real Artist\n"Yellow" by Coldplay'
    fakes.search_results = {
        'Made Up Song Real Artist': [_track('wrong', 'Made Up', 'Someone Else')],
        'Yellow Coldplay': [_track('cover', 'Yellow', 'Karaoke Band'), _track('real', 'Yellow', 'Coldplay')],
    }
    resp = client.post('/api/ai/generate', json={'prompt': 'x'})
    assert resp.status_code == 200
    assert fakes.create_calls == [['real']]
    assert resp.get_json()['total_matched'] == 1


def test_artist_match_ignores_case_and_accents(client, fakes):
    fakes.llm_text = '"Halo" by beyonce'
    fakes.search_results = {'Halo beyonce': [_track('h', 'Halo', 'Beyoncé')]}
    assert client.post('/api/ai/generate', json={'prompt': 'x'}).status_code == 200
    assert fakes.create_calls == [['h']]


def test_prose_lines_do_not_become_tracks(client, fakes):
    fakes.llm_text = 'Here are some tracks curated by me for you:\n"Clocks" by Coldplay'
    fakes.search_results = {
        'Here are some tracks curated me for you:': [_track('junk', 'Curated', 'Some Band')],
        'Clocks Coldplay': [_track('c', 'Clocks', 'Coldplay')],
    }
    assert client.post('/api/ai/generate', json={'prompt': 'x'}).status_code == 200
    assert fakes.create_calls == [['c']]


def test_no_verified_matches_returns_404_without_creating_playlist(client, fakes):
    fakes.llm_text = '"Ghost Song" by Nobody Real'
    fakes.search_results = {'Ghost Song Nobody Real': [_track('x', 'Ghost', 'Other')]}
    assert client.post('/api/ai/generate', json={'prompt': 'x'}).status_code == 404
    assert fakes.create_calls == []


def test_malformed_json_from_model_is_not_a_500(client, fakes):
    fakes.llm_text = '["Yellow by Coldplay"]'
    resp = client.post('/api/ai/generate', json={'prompt': 'x'})
    assert resp.status_code == 502
    assert 'error' in resp.get_json()


def test_model_and_token_cap_come_from_config(app, client, fakes):
    app.config.update(OPENAI_MODEL='configured-model', OPENAI_MAX_COMPLETION_TOKENS=123)
    fakes.llm_text = '"Clocks" by Coldplay'
    fakes.search_results = {'Clocks Coldplay': [_track('c', 'Clocks', 'Coldplay')]}
    client.post('/api/ai/generate', json={'prompt': 'x'})
    assert fakes.openai_kwargs['model'] == 'configured-model'
    assert fakes.openai_kwargs['max_completion_tokens'] == 123


def test_same_track_suggested_twice_is_listed_once(client, fakes):
    fakes.llm_text = '"Clocks" by Coldplay\n1. Clocks - Coldplay'
    fakes.search_results = {'Clocks Coldplay': [_track('c', 'Clocks', 'Coldplay')]}
    body = client.post('/api/ai/generate', json={'prompt': 'x'}).get_json()
    assert fakes.create_calls == [['c']]
    assert body['total_matched'] == 1
