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

Recommended approach: CI builds images and pushes them to GitHub Container Registry (GHCR). On `dellbox`, use `deploy/deploy.sh` to pull the latest image and restart the service, or place a `docker-compose.yml` in `/srv/docker/apps/legalchatbot` and let `deploy.sh` use it.

Quick steps to deploy on `dellbox`:

1. Copy repo or pull scripts to `dellbox`:
```bash
ssh acedxl@192.168.50.67
mkdir -p /srv/docker/apps/legalchatbot
cd /srv/docker/apps/legalchatbot
# copy docker-compose.yml here (or create one) and copy deploy/*.sh scripts
```

2. Make deploy scripts executable and run:
```bash
chmod +x /srv/docker/apps/legalchatbot/deploy/deploy.sh
chmod +x /srv/docker/apps/legalchatbot/deploy/backup.sh
REPO_OWNER=aleksandar-grozdanovski /srv/docker/apps/legalchatbot/deploy/deploy.sh
```

3. Schedule daily backups (example cron):
```bash
# run daily at 03:00 and keep backups in /srv/backups/legalchatbot
0 3 * * * /srv/docker/apps/legalchatbot/deploy/backup.sh /srv/backups/legalchatbot pgdata
```

Adjust `REPO_OWNER` and other settings in `deploy/deploy.sh` as needed.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request