# Sound Sculptor

AI-powered playlist generator that combines Spotify, machine learning, and an OpenAI model to create the perfect playlist from your mood, genre preferences, or a simple text prompt.

## Features

**Two ways to create playlists:**

1. **Sculpt It Yourself** — Pick your mood, choose genres, fine-tune audio sliders (danceability, energy, acousticness, instrumentalness, loudness, tempo, liveness), and get the closest matches from a nearest-neighbour index of 1.2M tracks. KNN doesn't learn anything: the seven audio features of every track are standardized (zero mean, unit variance, so no feature dominates the distance) and indexed. Your slider settings become a point in that space, and the nearest tracks by Euclidean distance form the playlist.

2. **AI Generated** — Describe what you want in plain text ("chill vibes for a rainy afternoon"). An OpenAI model (configurable via `OPENAI_MODEL`) suggests songs; each is looked up on Spotify and kept only if the artist matches, so invented songs are dropped.

Both flows create a private playlist in your Spotify account.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Zustand, Vite, Tailwind CSS, Framer Motion |
| Backend | Flask, Blueprints, SpotiPy, OpenAI SDK, Flask-Session, Flask-Limiter |
| ML | scikit-learn `StandardScaler` + `NearestNeighbors`, joblib, pandas |
| Infra | Docker, Nginx, Gunicorn |

## Quick Start

### Prerequisites

- Python 3.11 (the version the pinned constraints, Docker image and CI use)
- Node.js 18+
- [Spotify Developer App](https://developer.spotify.com/dashboard) (get Client ID & Secret)
- OpenAI API key (optional, for AI playlists)
- For slider playlists: `server/knn_index.pkl`, built from `tracks_features.csv` (see [Recommendation data](#recommendation-data))

### Setup

```bash
# Clone
git clone https://github.com/Dakuaisu/Sound-Sculptor.git
cd Sound-Sculptor

# Environment variables
cp .env.example .env
# Edit .env with your Spotify and OpenAI credentials

# Backend
pip install -r server/requirements.txt   # pinned via server/constraints.txt

# Frontend
cd soundfrnt && npm install && cd ..
```

### Development

```bash
# Terminal 1 — Flask backend
python -m server.run

# Terminal 2 — Vite dev server (proxies /api to Flask)
cd soundfrnt && npm run dev
```

Open http://127.0.0.1:5173 (not `localhost`: the session cookie must be on the same host as the OAuth callback).

### Docker (Production)

```bash
# Build and run
docker compose up -d

# Or step by step
docker build -t sound-sculptor .
docker run -p 80:80 --env-file .env sound-sculptor
```

Open http://127.0.0.1

> **Note:** docker-compose mounts `./server/knn_index.pkl` into the container. Without it the AI flow still works, and `/api/predict` returns 503 with a startup warning telling you to build the index.

### Recommendation data

The slider flow needs `server/knn_index.pkl`. It isn't committed (184 MB). Build it from
`tracks_features.csv`:

1. Download `tracks_features.csv` from the Kaggle dataset
   [Spotify 1.2M+ Songs](https://www.kaggle.com/datasets/rodolfofigueroa/spotify-12m-songs)
   (`rodolfofigueroa/spotify-12m-songs`, needs a Kaggle account). Check its licence
   on that page before redistributing anything derived from it.
   The copy used during development came from a public Hugging Face mirror
   (`TrishankV/Song-REcc`); its size matches Kaggle's listing and its SHA-256 is
   `39ee20762e4bbfe9aefbef7464c5500091eecfdbe0a45d33981898be2530a9e6`.
2. Put it at `server/tracks_features.csv`. It's gitignored.
3. `python scripts/build_index.py` takes about 5 s and about 600 MB of RAM for the
   1,204,025 rows.

The script warns if the CSV's feature ranges differ from the slider ranges in
`soundfrnt/src/lib/featureRanges.json`.

### Deploying beyond your machine

The image serves plain HTTP on port 80. Put it behind a TLS-terminating proxy, then:

- set `SESSION_COOKIE_SECURE=1` so the session cookie is only sent over HTTPS;
- set `FRONTEND_URL` and `SPOTIFY_REDIRECT_URI` to your `https://` origin.

### Spotify OAuth Setup

Add these redirect URIs in your [Spotify Dashboard](https://developer.spotify.com/dashboard) and set `SPOTIFY_REDIRECT_URI` to the one you use:

- Development (Vite): `http://127.0.0.1:5173/api/callback`
- Docker (local): `http://127.0.0.1/api/callback`
- Production: `https://your-domain/api/callback` (Spotify requires HTTPS for non-loopback hosts)

## Testing

```bash
pip install -r server/requirements-dev.txt
python -m pytest server/tests -q          # backend
cd soundfrnt && npm run lint && npm run build
./scripts/docker-smoke.sh                 # needs Docker
```

## Project Structure

```
Sound-Sculptor/
├── server/                  # Flask backend
│   ├── app.py               # Factory pattern (create_app)
│   ├── config.py            # Environment-based configuration
│   ├── run.py               # Development entry point
│   ├── requirements.txt
│   ├── blueprints/
│   │   ├── auth.py          # /api/connect, /api/callback, /api/me, /api/logout
│   │   ├── playlist.py      # /api/predict, /api/create-playlist
│   │   └── ai.py            # /api/ai/generate
│   └── services/
│       ├── spotify.py       # OAuth + token management
│       └── ml.py            # Build/load the KNN index, nearest-neighbour queries
│   └── tests/               # pytest suite (no network; synthetic fixtures)
├── soundfrnt/               # React SPA
│   ├── src/
│   │   ├── App.jsx          # Routes
│   │   ├── components/      # brand/, layout/, ui/ (component library)
│   │   ├── pages/           # Landing, Connect, Choice, wizard steps, Finished
│   │   ├── stores/          # Zustand state management
│   │   ├── services/        # API client
│   │   ├── hooks/, lib/     # auth bootstrap, motion presets, class helpers
│   │   └── styles/          # Tailwind entry CSS
│   └── vite.config.js       # Dev proxy + build config
├── scripts/build_index.py   # Builds server/knn_index.pkl from tracks_features.csv
├── scripts/docker-smoke.sh  # Builds the image and checks container behaviour
├── .github/workflows/ci.yml # pytest, lint, build, Docker smoke test
├── Dockerfile               # Multi-stage: Node build → Python + Nginx
├── docker-compose.yml       # Production stack (app + model volumes)
├── nginx.conf               # SPA routing + API proxy
└── .env.example             # Required environment variables
```

## Demo

![Demo Screenshot 1](https://github.com/user-attachments/assets/e98c11c1-1f13-404e-822a-576ea4db5c6b)

**Connect your Spotify account:**
![Demo Screenshot 2](https://github.com/user-attachments/assets/51676938-d7d7-4b81-93ea-ef69db7d535e)

**Choose how to create your playlist:**
![Playlist Creation Options](https://github.com/user-attachments/assets/1aa49f33-ea22-4800-aac8-0d2c82dadad0)

**AI-Generated Playlist:**
![AI-Generated Playlist](https://github.com/user-attachments/assets/d4700349-7219-472a-af4a-eb1d327d5efb)

**Sculpt It Yourself:**
![Sculpt-it Yourself Option 1](https://github.com/user-attachments/assets/65e388de-6655-4555-a997-2799f96e3fef)
![Sculpt-it Yourself Option 2](https://github.com/user-attachments/assets/48cb104b-162e-4995-a81c-1040b86af582)
![Sculpt-it Yourself Option 3](https://github.com/user-attachments/assets/6977533d-09b7-47ae-924a-0d0423675392)

