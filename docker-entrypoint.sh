#!/bin/bash
set -e

echo "Starting Sound Sculptor..."

# Start Gunicorn (Flask backend) in background
cd /app
export FLASK_ENV=production
gunicorn "server.app:create_app()" \
    --bind 127.0.0.1:5000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - &

echo "Starting Nginx..."
nginx -g "daemon off;" &

# Exit when either process dies so the container's restart policy applies.
trap 'kill -TERM $(jobs -p) 2>/dev/null' TERM INT
set +e
wait -n
status=$?
kill -TERM $(jobs -p) 2>/dev/null
wait
exit "$status"
