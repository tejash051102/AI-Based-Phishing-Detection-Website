# API Reference

Base URL: `http://localhost:5000/api`

Send protected requests with:

```http
Authorization: Bearer <jwt>
```

## Authentication

### Register

`POST /auth/register`

```json
{
  "name": "Jane Analyst",
  "email": "jane@example.com",
  "password": "StrongPass123"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "jane@example.com",
  "password": "StrongPass123"
}
```

### Forgot Password

`POST /auth/forgot-password`

```json
{
  "email": "jane@example.com"
}
```

### Reset Password

`POST /auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "password": "NewStrongPass123"
}
```

### Verify Email

`GET /auth/verify-email/:token`

## Scans

### Create URL or Text Scan

`POST /scans`

```json
{
  "type": "url",
  "content": "http://secure-login.example.ru/verify"
}
```

### Upload File Scan

`POST /scans/upload`

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

`GET /scans?page=1&limit=10&verdict=phishing&search=login`

### Analytics

`GET /scans/analytics`

### Export PDF

`GET /scans/:id/export`

## Admin

Admin role required.

```text
GET /admin/overview
GET /admin/threat-map
GET /admin/scans
GET /admin/users
PATCH /admin/users/:id/block
```

## Chatbot

`POST /chatbot`

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
