import axios from "axios";

const DEFAULT_API_URL = "http://localhost:5000/api";

export function normalizeApiBaseUrl(rawUrl = DEFAULT_API_URL) {
  const candidate = (rawUrl || "").trim() || DEFAULT_API_URL;

  try {
    const url = new URL(candidate);
    const pathname = url.pathname.replace(/\/+$/, "");

    if (!pathname || pathname === "/") {
      url.pathname = "/api";
    } else if (!pathname.endsWith("/api")) {
      url.pathname = `${pathname}/api`.replace(/\/{2,}/g, "/");
    } else {
      url.pathname = pathname;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    const cleaned = candidate.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
  }
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("phishguard_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("phishguard_token");
      localStorage.removeItem("phishguard_user");
    }
    return Promise.reject(error);
  }
);

export default api;
