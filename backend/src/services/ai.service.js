import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  timeout: 8000
});

export async function predictThreat({ type, content }) {
  const endpoint = type === "url" ? "/predict/url" : "/predict/text";
  const payload = type === "url" ? { url: content } : { text: content };
  const { data } = await aiClient.post(endpoint, payload);
  return data;
}

export async function getModelMetrics() {
  const { data } = await aiClient.get("/model/metrics");
  return data;
}
