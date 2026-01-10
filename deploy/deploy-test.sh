#!/bin/bash
set -e

echo "=== Deploying LegalChatbot TEST environment ==="

# Determine the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Copy docker-compose-test.yml if it doesn't exist in the current directory
if [ ! -f "docker-compose-test.yml" ]; then
  echo "Copying docker-compose-test.yml from ${SCRIPT_DIR}..."
  cp "${SCRIPT_DIR}/docker-compose-test.yml" .
fi

echo "Pulling latest test images..."
docker compose -f docker-compose-test.yml pull

echo "Starting containers..."
docker compose -f docker-compose-test.yml up -d --remove-orphans

echo ""
echo "=== Deployment complete ==="
echo ""
docker compose -f docker-compose-test.yml ps
echo ""
echo "Test environment running at: http://legalchat-test.home.arpa"
echo ""
echo "To check health:"
echo "  curl http://localhost:8083"
echo "  docker compose -f docker-compose-test.yml logs -f"
