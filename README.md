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

## Docker Deployment

### Architecture

The application runs as a multi-container Docker stack:
- **Backend API** - .NET 9 REST API (internal port 8080)
- **Frontend** - React SPA served by nginx (exposed via reverse proxy)

Both containers communicate via an internal Docker network. The frontend's nginx proxies `/api/*` requests to the backend.

### CI/CD Pipeline

GitHub Actions automatically builds and publishes Docker images to GHCR on push to main or test branches:
- `main` branch → `:latest` tag (production)
- `test` branch → `:test` tag (test environment)

Images are available at:
- `ghcr.io/aleksandar-grozdanovski/legalchatbot-api`
- `ghcr.io/aleksandar-grozdanovski/legalchatbot-frontend`

### Deployment

The `deploy/` directory contains Docker Compose configurations and deployment scripts:

**Production deployment:**
```bash
cd deploy
./deploy.sh
```

**Test environment deployment:**
```bash
cd deploy
./deploy-test.sh
```

Both environments can run simultaneously on different ports for testing before production deployment.

### Automated Updates

Use [Watchtower](https://containrrr.dev/watchtower/) to automatically pull and deploy new images:

```bash
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e WATCHTOWER_POLL_INTERVAL=300 \
  -e WATCHTOWER_CLEANUP=true \
  containrrr/watchtower \
  legalchatbot-api \
  legalchatbot-frontend
```

### Backup & Restore

**Create backup:**
```bash
./deploy/backup.sh /path/to/backup/dir
```

**Restore from backup:**
```bash
docker compose down
tar -xzf backup-file.tar.gz -C ./
docker compose up -d
```

**Schedule automated backups with cron:**
```bash
0 3 * * * /path/to/backup.sh /backup/destination
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request