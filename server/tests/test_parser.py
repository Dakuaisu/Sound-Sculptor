from server.blueprints.ai import _parse_songs_from_text


def test_parses_quoted_by():
    assert _parse_songs_from_text('"Bohemian Rhapsody" by Queen') == [
        {'title': 'Bohemian Rhapsody', 'artist': 'Queen'}
    ]


def test_parses_numbered_dash():
    out = _parse_songs_from_text('1. Imagine - John Lennon')
    assert out == [{'title': 'Imagine', 'artist': 'John Lennon'}]


def test_parses_bullet():
    assert _parse_songs_from_text('- Clocks by Coldplay') == [
        {'title': 'Clocks', 'artist': 'Coldplay'}
    ]


def test_parses_markdown_bold():
    out = _parse_songs_from_text('**Yellow** by Coldplay')
    assert out == [{'title': 'Yellow', 'artist': 'Coldplay'}]


def test_skips_playlist_header_and_blanks():
    text = 'Playlist: My Mix\n\n"Song A" by Artist A\n'
    assert _parse_songs_from_text(text) == [{'title': 'Song A', 'artist': 'Artist A'}]


def test_parses_structured_json():
    out = _parse_songs_from_text('{"songs": [{"title": "X", "artist": "Y"}]}')
    assert out == [{'title': 'X', 'artist': 'Y'}]


def test_returns_empty_on_garbage():
    assert _parse_songs_from_text('this is not a song list at all!!!') == []
