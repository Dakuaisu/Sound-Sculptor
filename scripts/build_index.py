#!/usr/bin/env python
"""Build server/knn_index.pkl (scaler + nearest-neighbour index + track IDs) from tracks_features.csv.

Usage: python scripts/build_index.py [--csv server/tracks_features.csv] [--out server/knn_index.pkl]
"""
import argparse
import pathlib
import sys
import time

import joblib
import pandas as pd

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server.blueprints.playlist import FEATURE_RANGES  # noqa: E402
from server.services.ml import FEATURE_KEYS, build_index  # noqa: E402


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--csv', default=ROOT / 'server' / 'tracks_features.csv', type=pathlib.Path)
    parser.add_argument('--out', default=ROOT / 'server' / 'knn_index.pkl', type=pathlib.Path)
    args = parser.parse_args(argv)

    if not args.csv.is_file():
        sys.exit(f'{args.csv} not found. See "Recommendation data" in README.md for where to get it.')

    header = pd.read_csv(args.csv, nrows=0).columns
    missing = [c for c in ['id', *FEATURE_KEYS] if c not in header]
    if missing:
        sys.exit(f'{args.csv} is missing required columns: {missing}')

    started = time.time()
    tracks = pd.read_csv(args.csv, usecols=['id', *FEATURE_KEYS])
    before = len(tracks)
    tracks = tracks.dropna().drop_duplicates(subset='id')
    print(f'{len(tracks)} tracks ({before - len(tracks)} dropped: missing values or duplicate id)')

    for key, (lo, hi) in FEATURE_RANGES.items():
        actual = (round(float(tracks[key].min()), 3), round(float(tracks[key].max()), 3))
        if actual != (lo, hi):
            print(f'WARNING: {key} spans {actual} but the sliders assume {(lo, hi)}; '
                  'update FEATURE_RANGES and soundfrnt/src/lib/featureRanges.json')

    artifact = build_index(tracks.reset_index(drop=True))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, args.out)
    size_mb = args.out.stat().st_size / 1e6
    print(f'Wrote {args.out} ({size_mb:.0f} MB) in {time.time() - started:.0f}s')


if __name__ == '__main__':
    main()
