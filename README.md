# Sound Sculptor

AI-powered playlist generator that combines Spotify, machine learning, and ChatGPT to create the perfect playlist from your mood, genre preferences, or a simple text prompt.

## Features

**Two ways to create playlists:**

1. **Sculpt It Yourself** — Pick your mood, choose genres, fine-tune audio sliders (danceability, energy, acousticness, instrumentalness, loudness, tempo, liveness), and get ML-powered recommendations from a KNN model trained on 1M+ songs.

2. **AI Generated** — Describe what you want in plain text ("chill vibes for a rainy afternoon") and ChatGPT finds the tracks on Spotify.

Both flows create a real Spotify playlist you can save to your library.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Zustand, Vite |
| Backend | Flask, Blueprints, SpotiPy, OpenAI SDK |
| ML | scikit-learn KNN, joblib, pandas |
| Infra | Docker, Nginx, Gunicorn |

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Spotify Developer App](https://developer.spotify.com/dashboard) (get Client ID & Secret)
- OpenAI API key (optional, for AI playlists)
- ML model files: `model.pkl` and `tracks_features.csv` in `server/`

### Setup

```bash
# Clone
git clone https://github.com/Dakuaisu/Sound-Sculptor.git
cd Sound-Sculptor

# Environment variables
cp .env.example .env
# Edit .env with your Spotify and OpenAI credentials

# Backend
pip install -r server/requirements.txt
# or: pipenv install

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

Open http://localhost:5173

### Docker (Production)

```bash
# Build and run
docker compose up -d

# Or step by step
docker build -t sound-sculptor .
docker run -p 80:80 --env-file .env sound-sculptor
```

Open http://localhost

> **Note:** `model.pkl` and `tracks_features.csv` are mounted as volumes in docker-compose. Place them in the project root.

### Spotify OAuth Setup

Add these redirect URIs in your [Spotify Dashboard](https://developer.spotify.com/dashboard):

- Development: `http://127.0.0.1:5000/api/callback`
- Production: `http://your-domain/api/callback`

## Project Structure

```
Sound-Sculptor/
├── server/                  # Flask backend
│   ├── app.py               # Factory pattern (create_app)
│   ├── config.py            # Environment-based configuration
│   ├── run.py               # Development entry point
│   ├── requirements.txt
│   ├── blueprints/
│   │   ├── auth.py          # /api/connect, /api/callback, /api/me
│   │   ├── playlist.py      # /api/predict, /api/create-playlist
│   │   └── ai.py            # /api/ai/generate, /api/ai/save
│   └── services/
│       ├── spotify.py       # OAuth + token management
│       └── ml.py            # KNN model loading + prediction
├── soundfrnt/               # React SPA
│   ├── src/
│   │   ├── App.jsx          # Routes
│   │   ├── components/      # Header, Footer, Logo, Spinner
│   │   ├── pages/           # Landing, Connect, Choice, wizard steps, Finished
│   │   ├── stores/          # Zustand state management
│   │   ├── services/        # API client
│   │   └── styles/          # Consolidated CSS
│   └── vite.config.js       # Dev proxy + build config
├── Dockerfile               # Multi-stage: Node build → Python + Nginx
├── docker-compose.yml       # Production + dev profiles
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

## Contributors

- **[Anushikha Singh](https://github.com/anushikha29)** — Backend, ML Model
- **[Adnan Rashid](https://github.com/Dakuaisu)** — Frontend, Architecture
