const DEFAULT_API_BASE = "http://localhost:5000/api";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "phishguard-scan-link",
    title: "Scan link with PhishGuard AI",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "phishguard-scan-link" || !info.linkUrl) return;
  try {
    const { apiBase = DEFAULT_API_BASE, authToken = "" } = await chrome.storage.local.get(["apiBase", "authToken"]);
    const syncToHistory = Boolean(authToken);
    const response = await fetch(`${apiBase}${syncToHistory ? "/scans" : "/public/quick-scan"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify(syncToHistory ? { type: "url", content: info.linkUrl } : { url: info.linkUrl })
    });
    const data = await response.json();
    await chrome.storage.local.set({ lastScan: data.scan });
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon.svg",
      title: `PhishGuard: ${data.scan.verdict}`,
      message: `Threat score ${data.scan.threatScore}/100${syncToHistory ? " saved to history" : ""}.`
    });
  } catch (_error) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon.svg",
      title: "PhishGuard scan failed",
      message: "Make sure the backend is running on localhost:5000."
    });
  }
});
