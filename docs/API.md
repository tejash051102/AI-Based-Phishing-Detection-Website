# API Reference

Base URL: `http://localhost:5000/api`

Send protected requests with:

```http
Authorization: Bearer <jwt>
```

## Authentication

### Register

`POST /api/auth/register`

```json
{
  "name": "Jane Analyst",
  "email": "jane@example.com",
  "password": "StrongPass123"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "jane@example.com",
  "password": "StrongPass123"
}
```

### Forgot Password

`POST /api/auth/forgot-password`

```json
{
  "email": "jane@example.com"
}
```

### Reset Password

`POST /api/auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "password": "NewStrongPass123"
}
```

### Verify Email

`GET /api/auth/verify-email/:token`

## Scans

### Create URL or Text Scan

`POST /api/scans`

```json
{
  "type": "url",
  "content": "http://secure-login.example.ru/verify"
}
```

### Upload File Scan

`POST /api/scans/upload`

Form-data field: `file`

Allowed extensions: `.txt`, `.eml`, `.csv`, `.json`

The API extracts URLs and text/message blocks and returns all generated scans:

```json
{
  "scan": {},
  "scans": [],
  "extracted": 3,
  "fileBatchId": "batch-id"
}
```

### List Scan History

`GET /api/scans?page=1&limit=10&verdict=phishing&search=login`

### Analytics

`GET /api/scans/analytics`

### Export PDF

`GET /api/scans/:id/export`

## Admin

Admin role required.

```text
GET /api/admin/overview
GET /api/admin/threat-map
GET /api/admin/scans
GET /api/admin/users
PATCH /api/admin/users/:id/block
```

## Chatbot

`POST /api/chatbot`

```json
{
  "message": "Explain this phishing result",
  "scanId": "optional-scan-id"
}
```

## AI Model

```text
POST /train
GET /model/metrics
```
