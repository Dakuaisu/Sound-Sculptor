#!/usr/bin/env bash
# Builds the production image and checks container-level behaviour.
set -euo pipefail

IMAGE=sound-sculptor-smoke
PORT=${PORT:-18080}
NAME=ss-smoke-$$
fail() { echo "FAIL: $*"; docker rm -f "$NAME" >/dev/null 2>&1 || true; exit 1; }

docker build -q -t "$IMAGE" . >/dev/null

docker run -d --name "$NAME" -p "$PORT:80" \
  -e SECRET_KEY="$(openssl rand -hex 16)" -e CLIENT_ID=x -e CLIENT_SECRET=x "$IMAGE" >/dev/null
for _ in $(seq 1 20); do curl -fs "localhost:$PORT/api/health" >/dev/null && break; sleep 1; done

asset=$(curl -fs "localhost:$PORT/" | grep -o '/assets/[^"]*\.js' | head -1)
for path in / "$asset" /api/health; do
  headers=$(curl -s -D - -o /dev/null "localhost:$PORT$path")
  for h in X-Content-Type-Options Referrer-Policy X-Frame-Options Content-Security-Policy; do
    grep -qi "^$h:" <<<"$headers" || fail "$path is missing $h"
  done
done
echo "ok: security headers on /, $asset, /api/health"

docker rm -f "$NAME" >/dev/null
echo "PASS"
