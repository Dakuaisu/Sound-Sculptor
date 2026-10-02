import os
import logging

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

_model = None
_y_train = None


class ModelArtifactError(Exception):
    pass

FEATURE_KEYS = [
    'danceability',
    'energy',
    'loudness',
    'acousticness',
    'instrumentalness',
    'tempo',
    'liveness',
]

MODEL_DIR = os.path.dirname(os.path.dirname(__file__))  # server/
MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')
DATA_PATH = os.path.join(MODEL_DIR, 'tracks_features.csv')


def _load_model():
    """Lazy-load the KNN model and training labels."""
    global _model, _y_train

    if _model is not None:
        return

    # Use isfile (not exists): a missing bind-mounted volume is created by Docker
    # as an empty *directory*, which would pass exists() and then crash joblib.load
    # with an opaque 500 instead of the intended 503.
    if not os.path.isfile(MODEL_PATH):
        raise FileNotFoundError(
            f'ML model not found at {MODEL_PATH}. '
            'Place model.pkl in the server/ directory.'
        )
    if not os.path.isfile(DATA_PATH):
        raise FileNotFoundError(
            f'Training data not found at {DATA_PATH}. '
            'Place tracks_features.csv in the server/ directory.'
        )

    logger.info('Loading ML model from %s', MODEL_PATH)
    model = joblib.load(MODEL_PATH)
    # Only the `id` column is needed (mapped positionally from KNN neighbor
    # indices); loading the full feature table wastes memory per worker.
    ids = pd.read_csv(DATA_PATH, usecols=['id'])['id']
    _check_artifacts_match(model, ids)
    _model, _y_train = model, ids


def _check_artifacts_match(model, ids):
    estimator = model.steps[-1][1] if hasattr(model, 'steps') else model
    n_fit = getattr(estimator, 'n_samples_fit_', None)
    if n_fit is not None and n_fit != len(ids):
        raise ModelArtifactError(
            f'model.pkl was fit on {n_fit} rows but tracks_features.csv has {len(ids)}'
        )
    names = getattr(model, 'feature_names_in_', None)
    if names is not None and list(names) != FEATURE_KEYS:
        raise ModelArtifactError(
            f'model.pkl expects features {list(names)}, the API sends {FEATURE_KEYS}'
        )


def predict_songs(features: dict) -> list[str]:
    """Predict recommended song IDs from audio features.

    Parameters
    ----------
    features : dict
        Must contain keys matching ``FEATURE_KEYS``.

    Returns
    -------
    list[str]
        Spotify track IDs of recommended songs.
    """
    _load_model()

    missing = [k for k in FEATURE_KEYS if k not in features]
    if missing:
        raise ValueError(f'Missing features: {missing}')

    values = [float(features[k]) for k in FEATURE_KEYS]
    input_arr = np.array(values).reshape(1, -1)
    distances, indices = _model.kneighbors(input_arr)
    return _y_train.iloc[indices[0]].tolist()
