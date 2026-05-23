import crypto from "crypto";

export function createPlainToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

