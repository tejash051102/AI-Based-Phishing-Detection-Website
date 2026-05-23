# PhishGuard AI

Modern full-stack AI-based phishing detection platform built with React, Tailwind CSS, Node.js, Express, FastAPI, scikit-learn, and MongoDB.

## Features

- JWT login/register with bcrypt password hashing
- Role-based user and admin dashboards
- URL, email/text, and file-based phishing scans
- FastAPI AI prediction service with threat probability scoring
- Scan history with search, filters, pagination-ready API, and PDF export
- MongoDB collections for users, scan reports, threat logs, and notifications
- Multer uploads, Helmet security headers, rate limiting, and request validation
- Optional VirusTotal reputation checks and SMTP email alerts
- Dark/light responsive cybersecurity UI with charts, cards, toasts, and skeleton loading
- Admin controls for all scans, analytics, activity logs, and blocking users
- Versioned ML training pipeline with metrics and confusion matrix output
- AI chatbot assistant for scan explanations and security guidance
- Scan detail pages with model features, indicators, and PDF export
- Password reset and email verification flows
- Multi-item file scanning for extracted URLs and message blocks
- Live admin threat map for suspicious and phishing activity

## Folder Structure

```text
phishguard-ai-platform/
  backend/
    src/
      config/              MongoDB connection
      controllers/         REST handlers
      middleware/          auth, validation, upload, errors
      models/              Users, ScanReports, ThreatLogs, Notifications
      routes/              auth, scans, admin, notifications
      services/            AI bridge, VirusTotal, email, PDF, chatbot, file parsing
      utils/               JWT helpers and seed script
    uploads/
    .env.example
    package.json
  frontend/
    src/
      api/                 Axios client
      components/          cards, tables, badges, skeletons
      context/             auth and theme state
      layouts/             protected app shell
      pages/               auth, dashboard, scanner, history, admin, tips
    .env.example
    package.json
  ai-service/
    app/
      features.py          URL and text feature extraction
      main.py              FastAPI routes
      model.py             demo RandomForest model
      schemas.py           request/response models
    train_model.py          dataset training entrypoint
    data/                   sample labelled URL dataset
    requirements.txt
  docs/
    DATABASE.md
    API.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB local or MongoDB Atlas

## Local Setup

1. Install Node dependencies.

```bash
npm install --prefix backend
npm install --prefix frontend
```

2. Create environment files.

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
copy ai-service\.env.example ai-service\.env
```

3. Configure `backend/.env`.

```env
MONGO_URI=mongodb://127.0.0.1:27017/phishguard
JWT_SECRET=replace-with-a-long-random-secret
AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
VIRUSTOTAL_API_KEY=
```

4. Start the AI service.

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
uvicorn app.main:app --reload --port 8000
```

5. Start the backend.

```bash
cd backend
npm run dev
```

6. Seed an admin user.

```bash
cd backend
npm run seed
```

Admin credentials:

```text
admin@phishguard.dev
AdminPass123
```

7. Start the frontend.

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Production Notes

- Frontend deploys cleanly to Vercel. Set `VITE_API_URL` to the Render backend URL plus `/api`.
- Backend deploys to Render. Set `MONGO_URI`, `JWT_SECRET`, `AI_SERVICE_URL`, `CLIENT_URL`, and optional SMTP/VirusTotal values.
- MongoDB Atlas should use a dedicated database user and network access restricted to deployed services.
- Replace the demo model with a trained model from a larger labelled phishing dataset before production use.
- Store uploaded files in object storage for production rather than local disk.
- Deployment templates are included in `vercel.json`, `render.yaml`, service Dockerfiles, and `docker-compose.yml`.

## Testing

```bash
npm test --prefix backend
npm test --prefix frontend
cd ai-service && pytest
```

The backend tests cover API health, request validation, and file parsing. The AI tests cover feature extraction and predictions. The frontend tests cover reusable UI components and assistant interaction.

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/verify-email/:token`
- `POST /api/auth/resend-verification`
- `POST /api/scans`
- `POST /api/scans/upload`
- `GET /api/scans`
- `GET /api/scans/analytics`
- `GET /api/scans/:id/export`
- `POST /api/chatbot`
- `GET /api/admin/overview`
- `GET /api/admin/threat-map`
- `GET /api/admin/scans`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/block`

## AI Service Summary

- `GET /health`
- `POST /predict/url` with `{ "url": "https://example.com" }`
- `POST /predict/text` with `{ "text": "Paste suspicious message" }`
- `POST /train`
- `GET /model/metrics`

Training reads `ai-service/data/sample_phishing_urls.csv` by default. For a real dataset, provide a CSV with `url` and `label` columns and call:

```bash
python train_model.py
```

The training pipeline writes:

```text
ai-service/app/models/phishing_url_model.joblib
ai-service/app/models/metrics.json
ai-service/app/models/versions/phishing_url_model_<timestamp>.joblib
```
