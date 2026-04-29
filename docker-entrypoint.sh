#!/bin/bash
set -e

echo "Starting Sound Sculptor..."

# Start Gunicorn (Flask backend) in background
cd /app
gunicorn "server.app:create_app()" \
    --bind 127.0.0.1:5000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - &

# Start Nginx in foreground
echo "Starting Nginx..."
nginx -g "daemon off;"
