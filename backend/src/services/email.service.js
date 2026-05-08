import nodemailer from "nodemailer";

export async function sendThreatAlert({ to, subject, text }) {
  if (!process.env.SMTP_HOST || !to) return { sent: false };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  });

  await transporter.sendMail({
    from: process.env.ALERT_FROM || "PhishGuard <alerts@phishguard.local>",
    to,
    subject,
    text
  });

  return { sent: true };
}

