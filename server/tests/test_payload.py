from server.blueprints.ai import _songs_from_payload


def test_keeps_well_formed_songs_and_strips_whitespace():
    payload = {'playlist_name': 'x', 'songs': [{'title': ' Clocks ', 'artist': 'Coldplay '}]}
    assert _songs_from_payload(payload) == [{'title': 'Clocks', 'artist': 'Coldplay'}]


def test_drops_entries_that_are_not_title_artist_objects():
    payload = {'songs': [
        {'title': 'X', 'artist': 'Y'}, 'a string', 3, {'title': 'no artist'},
        {'title': '', 'artist': 'blank title'}, {'title': 'T', 'artist': 5},
    ]}
    assert _songs_from_payload(payload) == [{'title': 'X', 'artist': 'Y'}]


def test_non_object_or_missing_songs_gives_empty_list():
    assert _songs_from_payload(['Yellow by Coldplay']) == []
    assert _songs_from_payload({'songs': 'nope'}) == []
    assert _songs_from_payload({}) == []
