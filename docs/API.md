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
GET /admin/scans
GET /admin/users
PATCH /admin/users/:id/block
```

