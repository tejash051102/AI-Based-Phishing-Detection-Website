# Database Schema

## Users

```js
{
  name: String,
  email: String,
  password: String,
  role: "user" | "admin",
  blocked: Boolean,
  emailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  avatar: String,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## ScanReports

```js
{
  user: ObjectId,
  type: "url" | "text" | "file",
  input: String,
  normalizedInput: String,
  verdict: "safe" | "suspicious" | "phishing",
  threatScore: Number,
  probability: Number,
  indicators: [String],
  aiDetails: Object,
  reputation: Object,
  fileName: String,
  fileBatchId: String,
  extractedFromFile: Boolean,
  sourceLabel: String,
  sourceIp: String,
  status: "completed" | "reviewed" | "dismissed",
  createdAt: Date,
  updatedAt: Date
}
```

## ThreatLogs

```js
{
  scan: ObjectId,
  user: ObjectId,
  event: String,
  severity: "low" | "medium" | "high" | "critical",
  metadata: Object,
  ip: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Notifications

```js
{
  user: ObjectId,
  title: String,
  message: String,
  type: "info" | "warning" | "danger" | "success",
  read: Boolean,
  link: String,
  createdAt: Date,
  updatedAt: Date
}
```
