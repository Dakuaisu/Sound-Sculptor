# =============================================================================
# Sound Sculptor — Multi-stage Dockerfile
# Stage 1: Build React frontend
# Stage 2: Python backend + Nginx serves static assets
# =============================================================================

# --- Stage 1: Build frontend ---
FROM node:20-slim AS frontend-build

WORKDIR /app/soundfrnt
COPY soundfrnt/package.json soundfrnt/package-lock.json ./
RUN npm ci --silent
COPY soundfrnt/ ./
RUN npm run build


# --- Stage 2: Production image ---
FROM python:3.11-slim AS production

# Install nginx and curl (for healthcheck)
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend source
COPY server/ ./server/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/soundfrnt/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config that conflicts
RUN rm -f /etc/nginx/sites-enabled/default

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80 (nginx) — gunicorn on internal :5000
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
