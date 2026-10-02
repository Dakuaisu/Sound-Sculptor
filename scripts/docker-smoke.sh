#!/usr/bin/env bash
# Builds the production image and checks container-level behaviour.
set -euo pipefail

IMAGE=sound-sculptor-smoke
PORT=${PORT:-18080}
NAME=ss-smoke-$$
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT
fail() { echo "FAIL: $*"; exit 1; }

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

root_gunicorn=$(docker exec "$NAME" sh -c 'for p in /proc/[0-9]*; do
  argv0=$(tr "\0" "\n" < "$p/cmdline" 2>/dev/null | head -1)
  case "$argv0" in *python*) ;; *) continue ;; esac
  grep -q gunicorn "$p/cmdline" && grep -q "^Uid:[[:space:]]*0[[:space:]]" "$p/status" && echo "${p#/proc/}"
done' || true)
[ -z "$root_gunicorn" ] || fail "gunicorn running as root (pids: $root_gunicorn)"
echo "ok: gunicorn does not run as root"

! docker logs "$NAME" 2>&1 | grep -q "Permission denied" || fail "permission errors in container logs"
echo "ok: no permission errors in logs"

docker exec "$NAME" sh -c 'kill -TERM $(for p in /proc/[0-9]*; do
  grep -q gunicorn "$p/cmdline" 2>/dev/null && echo "${p#/proc/}"; done | sort -n | head -1)'
for _ in $(seq 1 15); do [ "$(docker inspect -f '{{.State.Running}}' "$NAME")" = false ] && break; sleep 1; done
[ "$(docker inspect -f '{{.State.Running}}' "$NAME")" = false ] || fail "container kept running after gunicorn exited"
echo "ok: container exits when gunicorn exits"
docker rm -f "$NAME" >/dev/null

docker run -d --name "$NAME" -e SECRET_KEY=change-me-to-a-random-string -e FLASK_ENV=development \
  -e CLIENT_ID=x -e CLIENT_SECRET=x "$IMAGE" >/dev/null
for _ in $(seq 1 20); do [ "$(docker inspect -f '{{.State.Running}}' "$NAME")" = false ] && break; sleep 1; done
[ "$(docker inspect -f '{{.State.Running}}' "$NAME")" = false ] || fail "container started with the placeholder SECRET_KEY"
echo "ok: container refuses the placeholder SECRET_KEY"
docker rm -f "$NAME" >/dev/null

echo "PASS"
