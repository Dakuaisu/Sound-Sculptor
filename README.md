# Sound Sculptor

AI-powered playlist generator that combines Spotify, machine learning, and an OpenAI model to create the perfect playlist from your mood, genre preferences, or a simple text prompt.

## Features

**Two ways to create playlists:**

1. **Sculpt It Yourself** — Pick your mood, choose genres, fine-tune audio sliders (danceability, energy, acousticness, instrumentalness, loudness, tempo, liveness), and get ML-powered recommendations from a KNN model trained on 1M+ songs.

2. **AI Generated** — Describe what you want in plain text ("chill vibes for a rainy afternoon"). An OpenAI model (configurable via `OPENAI_MODEL`) suggests songs; each is looked up on Spotify and kept only if the artist matches, so invented songs are dropped.

Both flows create a private playlist in your Spotify account.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Zustand, Vite, Tailwind CSS, Framer Motion |
| Backend | Flask, Blueprints, SpotiPy, OpenAI SDK, Flask-Session, Flask-Limiter |
| ML | scikit-learn KNN, joblib, pandas |
| Infra | Docker, Nginx, Gunicorn |

## Quick Start

### Prerequisites

- Python 3.11 (the version the pinned constraints, Docker image and CI use)
- Node.js 18+
- [Spotify Developer App](https://developer.spotify.com/dashboard) (get Client ID & Secret)
- OpenAI API key (optional, for AI playlists)
- ML model files `model.pkl` and `tracks_features.csv` (not in this repo): in `server/` for local dev, in the project root for docker-compose

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

> **Note:** docker-compose mounts `./model.pkl` and `./tracks_features.csv` from the project root into `server/`. Without them the AI flow still works and `/api/predict` returns 503.

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
│       └── ml.py            # KNN model loading + prediction
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

