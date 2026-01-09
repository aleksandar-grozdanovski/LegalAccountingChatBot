#!/usr/bin/env bash
# deploy.sh - Run on dellbox to deploy latest images from GHCR or via docker-compose
# Usage: ./deploy.sh [compose-dir]

set -euo pipefail

REPO_OWNER="${REPO_OWNER:-aledx}" # replace or export REPO_OWNER env var
IMAGE_NAME="legalchatbot"
COMPOSE_DIR="${1:-/srv/docker/apps/legalchatbot}"

echo "Deploying LegalChatbot from GHCR..."

if [ -f "$COMPOSE_DIR/docker-compose.yml" ]; then
  echo "Found docker-compose.yml in $COMPOSE_DIR. Pulling and restarting compose stack..."
  cd "$COMPOSE_DIR"
  docker compose pull || true
  docker compose up -d --build --remove-orphans
  echo "Docker compose deployment finished."
else
  echo "No docker-compose.yml found in $COMPOSE_DIR. Pulling single image and restarting containers."
  docker pull ghcr.io/${REPO_OWNER}/${IMAGE_NAME}:latest

  # stop existing container if running
  if docker ps --format '{{.Names}}' | grep -q "^${IMAGE_NAME}$"; then
    docker stop ${IMAGE_NAME} || true
    docker rm ${IMAGE_NAME} || true
  fi

  # run container (adjust ports and env as needed)
  docker run -d \
    --name ${IMAGE_NAME} \
    --restart unless-stopped \
    -e ASPNETCORE_URLS="http://+:8080" \
    -p 8080:8080 \
    ghcr.io/${REPO_OWNER}/${IMAGE_NAME}:latest

  echo "Single-container deployment finished."
fi

# Optional: reload Caddy if needed (assumes caddy managed configs)
# sudo systemctl reload caddy || true

echo "Deployment complete."
