import os
import logging

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

_model = None
_y_train = None

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

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f'ML model not found at {MODEL_PATH}. '
            'Place model.pkl in the server/ directory.'
        )
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f'Training data not found at {DATA_PATH}. '
            'Place tracks_features.csv in the server/ directory.'
        )

    logger.info('Loading ML model from %s', MODEL_PATH)
    _model = joblib.load(MODEL_PATH)
    train_data = pd.read_csv(DATA_PATH)
    _y_train = train_data['id']


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
