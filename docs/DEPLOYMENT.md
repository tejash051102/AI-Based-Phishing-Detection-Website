# Deployment Guide

## Vercel Frontend

Use the root `vercel.json`.

Set this environment variable in Vercel:

```env
VITE_API_URL=https://your-render-api.onrender.com/api
```

Build command:

```bash
npm install --prefix frontend && npm run build --prefix frontend
```

Output directory:

```text
frontend/dist
```

## Render Backend and AI Service

Use the root `render.yaml` blueprint.

Required backend environment variables:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
CLIENT_URL=https://your-vercel-app.vercel.app
AI_SERVICE_URL=https://your-ai-service.onrender.com
VIRUSTOTAL_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

The AI service trains the sample model during build. Replace `ai-service/data/sample_phishing_urls.csv` with a larger labelled dataset before production.

## Docker Compose

Run the full stack locally:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- AI service: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017/phishguard`

