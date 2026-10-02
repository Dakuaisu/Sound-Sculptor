from unittest.mock import MagicMock

from server.services.spotify import create_playlist_with_tracks


def _fake_sp():
    sp = MagicMock(spec=['current_user_playlist_create', 'playlist_add_items'])
    sp.current_user_playlist_create.return_value = {'id': 'pl1', 'external_urls': {}}
    return sp


def test_create_playlist_uses_me_playlists_and_items_endpoints():
    # spec= makes calls to removed methods (user_playlist_create / user_playlist_add_tracks) raise.
    sp = _fake_sp()
    create_playlist_with_tracks(sp, 'Mix', ['a', 'b'], public=True)
    sp.current_user_playlist_create.assert_called_once_with('Mix', public=True)
    sp.playlist_add_items.assert_called_once_with('pl1', ['spotify:track:a', 'spotify:track:b'])


def test_create_playlist_chunks_items_by_100():
    sp = _fake_sp()
    create_playlist_with_tracks(sp, 'Mix', [f't{i}' for i in range(250)])
    sizes = [len(c.args[1]) for c in sp.playlist_add_items.call_args_list]
    assert sizes == [100, 100, 50]
