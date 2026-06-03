chrome.storage.local.get("lastScan", ({ lastScan }) => {
  const result = document.getElementById("result");
  if (!lastScan) return;
  result.innerHTML = `
    <div class="score">${lastScan.threatScore}/100</div>
    <div class="verdict">${lastScan.verdict}</div>
    <p style="margin-top:8px;word-break:break-all">${lastScan.preview?.domain || lastScan.input}</p>
  `;
});

chrome.storage.local.get(["apiBase", "authToken"], ({ apiBase, authToken }) => {
  document.getElementById("apiBase").value = apiBase || "http://localhost:5000/api";
  document.getElementById("authToken").value = authToken || "";
});

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.local.set({
    apiBase: document.getElementById("apiBase").value.trim() || "http://localhost:5000/api",
    authToken: document.getElementById("authToken").value.trim()
  });
  window.close();
});
