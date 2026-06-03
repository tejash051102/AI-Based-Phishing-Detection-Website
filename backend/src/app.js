import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import scanRoutes from "./routes/scan.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import publicRoutes from "./routes/public.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();

const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedDevOrigin(origin) {
  if (!origin || process.env.NODE_ENV === "production") return false;
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):\d+$/.test(origin);
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 180,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests. Please slow down."
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "phishguard-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
