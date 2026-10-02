"""ML artifact loading, using small synthetic artifacts written to tmp_path."""
import joblib
import numpy as np
import pandas as pd
import pytest
from sklearn.neighbors import NearestNeighbors

from server.services import ml


@pytest.fixture
def artifacts(tmp_path, monkeypatch):
    monkeypatch.setattr(ml, '_model', None)
    monkeypatch.setattr(ml, '_y_train', None)
    monkeypatch.setattr(ml, 'MODEL_PATH', str(tmp_path / 'model.pkl'))
    monkeypatch.setattr(ml, 'DATA_PATH', str(tmp_path / 'tracks_features.csv'))

    def write(model, n_ids):
        joblib.dump(model, ml.MODEL_PATH)
        pd.DataFrame({'id': [f'id{i}' for i in range(n_ids)]}).to_csv(ml.DATA_PATH, index=False)

    return write


_FEATURES = {k: 0.5 for k in ml.FEATURE_KEYS}
_RNG = np.random.default_rng(0)


def test_matching_artifacts_load_and_predict(artifacts):
    artifacts(NearestNeighbors(n_neighbors=2).fit(_RNG.random((4, 7))), n_ids=4)
    assert len(ml.predict_songs(_FEATURES)) == 2


def test_row_count_mismatch_is_rejected(artifacts):
    artifacts(NearestNeighbors(n_neighbors=2).fit(_RNG.random((4, 7))), n_ids=5)
    with pytest.raises(ml.ModelArtifactError, match='4 rows'):
        ml.predict_songs(_FEATURES)
    assert ml._model is None


def test_feature_order_mismatch_is_rejected(artifacts):
    wrong_order = list(reversed(ml.FEATURE_KEYS))
    frame = pd.DataFrame(_RNG.random((4, 7)), columns=wrong_order)
    artifacts(NearestNeighbors(n_neighbors=2).fit(frame), n_ids=4)
    with pytest.raises(ml.ModelArtifactError, match='expects features'):
        ml.predict_songs(_FEATURES)


def test_mismatch_returns_503(client, artifacts):
    artifacts(NearestNeighbors(n_neighbors=2).fit(_RNG.random((4, 7))), n_ids=9)
    payload = {'danceability': 0.5, 'energy': 0.5, 'loudness': -8, 'acousticness': 0.2,
               'instrumentalness': 0, 'tempo': 120, 'liveness': 0.1}
    assert client.post('/api/predict', json=payload).status_code == 503
