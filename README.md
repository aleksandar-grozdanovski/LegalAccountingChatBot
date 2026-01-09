# Legal and Accounting Chatbot

A bilingual (English/Macedonian) chatbot that provides information about legal and accounting matters in North Macedonia.

## Project Structure

- `LegalChatbot.API/` - .NET backend service
- `legal-chatbot-frontend/` - React frontend application

## Features

- Bilingual support (English/Macedonian)
- Legal document search and retrieval
- Context-aware responses using Groq's llama-3.3-70b-versatile model
- Conversation history management
- Source document citations

## Prerequisites

- .NET 9.0 SDK
- Node.js 18+
- Groq API key

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd LegalAccountingChatBot
```

2. Backend Setup:
```bash
cd LegalChatbot.API
dotnet restore
```

3. Frontend Setup:
```bash
cd legal-chatbot-frontend
npm install
```

4. Configure your Groq API key in `appsettings.Development.json`

## Running the Application (Development)

1. Start the backend:
```bash
cd LegalChatbot.API
dotnet run
```

2. Start the frontend:
```bash
cd legal-chatbot-frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: https://localhost:7263 or http://localhost:5135

## Deployment (Homelab / dellbox)

### Architecture

The application runs as a multi-container stack:
- **Backend API** (`legalchatbot-api`) - .NET 9 REST API
- **Frontend** (`legalchatbot-frontend`) - React SPA served by nginx

Both containers communicate via an internal Docker network. The frontend's nginx proxies `/api/*` requests to the backend.

### CI/CD Pipeline

1. **Push code** to GitHub `main` branch
2. **GitHub Actions** builds and publishes images to GHCR:
   - `ghcr.io/aleksandar-grozdanovski/legalchatbot-api:latest`
   - `ghcr.io/aleksandar-grozdanovski/legalchatbot-frontend:latest`
3. **Manual deploy** on `dellbox` pulls images and restarts containers

### Deploy Steps

```bash
# 1. Copy deploy scripts to dellbox (first time only)
scp deploy/* acedxl@192.168.50.67:/srv/docker/apps/legalchatbot/deploy/

# 2. SSH to dellbox and run deploy
ssh acedxl@192.168.50.67
cd /srv/docker/apps/legalchatbot/deploy
./deploy.sh

# 3. Verify deployment
docker ps | grep legalchatbot
curl -X POST http://localhost:8082/api/chat -H 'Content-Type: application/json' -d '{"message":"test"}'
```

### Access URLs

- **Frontend**: http://legalchat.home.arpa
- **API** (internal): Proxied via frontend at `/api/*`

### Backup & Restore

**Schedule daily backups:**
```bash
# Add to crontab (runs daily at 03:00)
0 3 * * * /srv/docker/apps/legalchatbot/deploy/backup.sh /srv/backups/legalchatbot >> /srv/backups/legalchatbot/backup.log 2>&1
```

**Manual backup:**
```bash
/srv/docker/apps/legalchatbot/deploy/backup.sh /srv/backups/legalchatbot
```

**Restore from backup:**
```bash
# Stop containers
cd /srv/docker/apps/legalchatbot && docker compose down

# Extract backup
cd /srv/backups/legalchatbot
tar -xzf legalchatbot-backup-YYYY-MM-DD-HHMMSS.tar.gz -C /srv/docker/apps/legalchatbot

# Restart
cd /srv/docker/apps/legalchatbot && docker compose up -d
```

### Rollback to Previous Version

```bash
# Use specific image tag (SHA from GitHub Actions)
cd /srv/docker/apps/legalchatbot
docker compose pull  # pulls :latest by default

# OR manually set image tag in docker-compose.yml:
# image: ghcr.io/aleksandar-grozdanovski/legalchatbot-api:abc123sha

docker compose up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request