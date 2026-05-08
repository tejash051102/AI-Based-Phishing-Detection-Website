const tips = [
  "Verify sender domains before opening links or attachments.",
  "Treat urgent account warnings as suspicious until confirmed from the official site.",
  "Use a password manager so fake login forms stand out quickly.",
  "Report repeated phishing attempts so administrators can block campaigns.",
  "Never enter OTPs, recovery codes, or seed phrases after following an email link."
];

const feed = [
  { title: "Credential harvesting campaign", severity: "critical", source: "Live Threat Feed" },
  { title: "Cloud invoice impersonation", severity: "high", source: "URL Reputation Checker" },
  { title: "Short-link SMS lure", severity: "medium", source: "Community telemetry" }
];

export default function TipsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Cybersecurity tips</h2>
        <div className="mt-4 space-y-3">
          {tips.map((tip) => (
            <div key={tip} className="rounded bg-slate-50 p-3 text-sm dark:bg-slate-950">{tip}</div>
          ))}
        </div>
      </section>
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Live threat feed</h2>
        <div className="mt-4 space-y-3">
          {feed.map((item) => (
            <div key={item.title} className="flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-950">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-500">{item.source}</p>
              </div>
              <span className="rounded bg-cyber-500 px-2 py-1 text-xs font-semibold uppercase text-white">{item.severity}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

