import logging
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

FEATURE_KEYS = [
    'danceability',
    'energy',
    'loudness',
    'acousticness',
    'instrumentalness',
    'tempo',
    'liveness',
]
ARTIFACT_VERSION = 1

SERVER_DIR = os.path.dirname(os.path.dirname(__file__))
INDEX_PATH = os.environ.get('KNN_INDEX_PATH', os.path.join(SERVER_DIR, 'knn_index.pkl'))

_artifact = None


class ModelArtifactError(Exception):
    pass


def build_index(tracks: pd.DataFrame) -> dict:
    """Standardize the audio features and index them for nearest-neighbour search.

    The scaler, the index and the row-aligned track IDs are returned together so
    queries are always transformed exactly as the indexed data was.
    """
    features = tracks[FEATURE_KEYS].to_numpy(dtype=float)
    scaler = StandardScaler().fit(features)
    index = NearestNeighbors().fit(scaler.transform(features))
    return {
        'version': ARTIFACT_VERSION,
        'feature_keys': list(FEATURE_KEYS),
        'scaler': scaler,
        'index': index,
        'ids': tracks['id'].to_numpy(dtype=object),
    }


def _validate(artifact) -> None:
    if not isinstance(artifact, dict) or artifact.get('version') != ARTIFACT_VERSION:
        raise ModelArtifactError(f'{INDEX_PATH} is not a version-{ARTIFACT_VERSION} index artifact')
    if artifact['feature_keys'] != FEATURE_KEYS:
        raise ModelArtifactError(
            f"index was built on {artifact['feature_keys']}, the API sends {FEATURE_KEYS}"
        )
    if artifact['index'].n_samples_fit_ != len(artifact['ids']):
        raise ModelArtifactError('index row count does not match the stored track IDs')


def _load():
    global _artifact
    if _artifact is not None:
        return _artifact
    # isfile, not exists: a missing Docker bind mount appears as an empty directory.
    if not os.path.isfile(INDEX_PATH):
        raise FileNotFoundError(f'KNN index not found at {INDEX_PATH}')
    logger.info('Loading KNN index from %s', INDEX_PATH)
    artifact = joblib.load(INDEX_PATH)
    _validate(artifact)
    _artifact = artifact
    return _artifact


def predict_songs(features: dict, n: int) -> list[str]:
    """Return the IDs of the ``n`` indexed tracks closest to ``features``."""
    artifact = _load()
    query = np.array([[float(features[k]) for k in FEATURE_KEYS]])
    _, indices = artifact['index'].kneighbors(artifact['scaler'].transform(query), n_neighbors=n)
    return artifact['ids'][indices[0]].tolist()
