"""KNN index build/load/query, using a small synthetic dataset (not real tracks)."""
import json
import pathlib

import joblib
import numpy as np
import pandas as pd
import pytest

from server.services import ml

RANGES = json.loads(
    (pathlib.Path(__file__).parents[2] / 'soundfrnt/src/lib/featureRanges.json').read_text()
)


def _synthetic_tracks(n=3000, seed=0):
    rng = np.random.default_rng(seed)
    data = {k: lo + rng.random(n) * (hi - lo) for k, (lo, hi) in RANGES.items()}
    return pd.DataFrame({'id': [f'synthetic{i}' for i in range(n)], **data})


def _slider_features(sliders):
    """Same mapping as SliderStep.jsx: slider 0-100 -> [min, max] of the dataset."""
    return {k: lo + (sliders[k] / 100) * (hi - lo) for k, (lo, hi) in RANGES.items()}


@pytest.fixture
def write_index(tmp_path, monkeypatch):
    monkeypatch.setattr(ml, '_artifact', None)
    monkeypatch.setattr(ml, 'INDEX_PATH', str(tmp_path / 'knn_index.pkl'))

    def write(artifact):
        joblib.dump(artifact, ml.INDEX_PATH)
        return artifact

    return write


def test_every_slider_changes_the_neighbours(write_index):
    write_index(ml.build_index(_synthetic_tracks()))
    mid = {k: 50 for k in RANGES}
    for key in RANGES:
        low = ml.predict_songs(_slider_features({**mid, key: 0}), n=20)
        high = ml.predict_songs(_slider_features({**mid, key: 100}), n=20)
        assert set(low) != set(high), f'moving {key} alone did not change the result'


def test_query_uses_the_scaler_stored_with_the_index(write_index):
    tracks = _synthetic_tracks()
    write_index(ml.build_index(tracks))
    row = tracks.iloc[123]
    assert ml.predict_songs(row[ml.FEATURE_KEYS].to_dict(), n=1) == ['synthetic123']


def test_returns_requested_number_of_ids(write_index):
    write_index(ml.build_index(_synthetic_tracks(n=50)))
    assert len(ml.predict_songs(_slider_features({k: 50 for k in RANGES}), n=7)) == 7


def test_old_style_model_file_is_rejected(write_index):
    from sklearn.neighbors import NearestNeighbors
    write_index(NearestNeighbors().fit(np.zeros((3, 7))))
    with pytest.raises(ml.ModelArtifactError, match='not a version-1'):
        ml.predict_songs({k: 0 for k in ml.FEATURE_KEYS}, n=1)


def test_feature_order_mismatch_is_rejected(write_index):
    artifact = ml.build_index(_synthetic_tracks(n=20))
    write_index({**artifact, 'feature_keys': list(reversed(ml.FEATURE_KEYS))})
    with pytest.raises(ml.ModelArtifactError, match='was built on'):
        ml.predict_songs({k: 0 for k in ml.FEATURE_KEYS}, n=1)


def test_id_count_mismatch_is_rejected(write_index):
    artifact = ml.build_index(_synthetic_tracks(n=20))
    write_index({**artifact, 'ids': artifact['ids'][:-1]})
    with pytest.raises(ml.ModelArtifactError, match='row count'):
        ml.predict_songs({k: 0 for k in ml.FEATURE_KEYS}, n=1)


def test_invalid_artifact_returns_503(client, write_index):
    write_index({'version': 0})
    payload = _slider_features({k: 50 for k in RANGES})
    assert client.post('/api/predict', json=payload).status_code == 503


def test_missing_index_gives_clear_503(client, tmp_path, monkeypatch):
    monkeypatch.setattr(ml, '_artifact', None)
    monkeypatch.setattr(ml, 'INDEX_PATH', str(tmp_path / 'absent.pkl'))
    resp = client.post('/api/predict', json=_slider_features({k: 50 for k in RANGES}))
    assert resp.status_code == 503
    assert "track index hasn't been built" in resp.get_json()['error']


def test_startup_warns_when_index_missing(tmp_path, monkeypatch, caplog):
    from server.app import create_app
    monkeypatch.setattr(ml, 'INDEX_PATH', str(tmp_path / 'absent.pkl'))
    create_app()
    assert 'scripts/build_index.py' in caplog.text


def test_build_script_writes_a_loadable_index(tmp_path, monkeypatch):
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        'build_index', pathlib.Path(__file__).parents[2] / 'scripts/build_index.py')
    script = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(script)

    csv, out = tmp_path / 'tracks.csv', tmp_path / 'index.pkl'
    tracks = _synthetic_tracks(n=40)
    pd.concat([tracks, tracks.iloc[:3]]).to_csv(csv, index=False)
    script.main(['--csv', str(csv), '--out', str(out)])

    monkeypatch.setattr(ml, '_artifact', None)
    monkeypatch.setattr(ml, 'INDEX_PATH', str(out))
    assert len(ml.predict_songs(tracks.iloc[0][ml.FEATURE_KEYS].to_dict(), n=40)) == 40


def test_build_script_rejects_csv_without_feature_columns(tmp_path):
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        'build_index', pathlib.Path(__file__).parents[2] / 'scripts/build_index.py')
    script = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(script)
    csv = tmp_path / 'bad.csv'
    pd.DataFrame({'id': ['a'], 'danceability': [0.1]}).to_csv(csv, index=False)
    with pytest.raises(SystemExit, match='missing required columns'):
        script.main(['--csv', str(csv), '--out', str(tmp_path / 'x.pkl')])
