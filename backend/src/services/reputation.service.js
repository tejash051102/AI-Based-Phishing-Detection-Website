import axios from "axios";

export async function checkVirusTotal(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey || !url) {
    return { provider: "virustotal", enabled: false };
  }

  try {
    const encoded = Buffer.from(url).toString("base64url");
    const { data } = await axios.get(`https://www.virustotal.com/api/v3/urls/${encoded}`, {
      headers: { "x-apikey": apiKey },
      timeout: 10000
    });
    const stats = data?.data?.attributes?.last_analysis_stats || {};
    return {
      provider: "virustotal",
      enabled: true,
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0
    };
  } catch (error) {
    return {
      provider: "virustotal",
      enabled: true,
      error: error.response?.data?.error?.message || "Reputation lookup failed"
    };
  }
}

