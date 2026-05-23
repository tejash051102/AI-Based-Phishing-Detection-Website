import { AlertTriangle, CheckCircle2, Globe2, HelpCircle, ShieldCheck } from "lucide-react";

const brandHosts = {
  amazon: ["amazon.com", "amazon.in"],
  apple: ["apple.com"],
  google: ["google.com"],
  microsoft: ["microsoft.com", "live.com", "office.com"],
  netflix: ["netflix.com"],
  paypal: ["paypal.com"]
};

const severityStyles = {
  high: "border-signal-red/40 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100",
  medium: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100",
  low: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-100",
  info: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
};

function parseHost(input) {
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `http://${input}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch (_error) {
    return "";
  }
}

function formatFeatureName(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function findBrandSignal(input) {
  const value = String(input || "").toLowerCase();
  const host = parseHost(value);
  const brand = Object.keys(brandHosts).find((name) => value.includes(name));
  if (!brand) return null;
  const official = brandHosts[brand].some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (official) return null;
  return {
    label: "Possible brand impersonation",
    detail: `Mentions ${brand} but does not use a known official ${brand} domain.`,
    severity: "high"
  };
}

function buildUrlExplanations(scan, features) {
  const items = [];
  const brandSignal = findBrandSignal(scan.input);
  if (brandSignal) items.push(brandSignal);

  if (features.has_https === 0) {
    items.push({ label: "Missing HTTPS", detail: "The link does not use encrypted HTTPS transport.", severity: "high" });
  }
  if (features.is_ip_host) {
    items.push({ label: "IP address host", detail: "The destination uses a raw IP address instead of a recognizable domain.", severity: "high" });
  }
  if (features.uses_shortener) {
    items.push({ label: "URL shortener", detail: "Short links hide the final destination until they are expanded.", severity: "medium" });
  }
  if (features.at_count > 0) {
    items.push({ label: "Hidden destination pattern", detail: "The @ symbol can make a URL display one host while navigating to another.", severity: "high" });
  }
  if (features.keyword_count >= 2) {
    items.push({ label: "Phishing keywords", detail: `${features.keyword_count} account, login, payment, or urgency-related terms were found.`, severity: "medium" });
  }
  if (features.subdomain_count >= 3) {
    items.push({ label: "Excessive subdomains", detail: `${features.subdomain_count} subdomain levels can be used to mimic trusted brands.`, severity: "medium" });
  }
  if (features.url_length > 90) {
    items.push({ label: "Unusually long URL", detail: `${features.url_length} characters makes the destination harder to inspect.`, severity: "medium" });
  }
  if (features.query_length > 80) {
    items.push({ label: "Long tracking/query string", detail: "Large query strings can carry deceptive redirects or encoded payloads.", severity: "medium" });
  }

  return items;
}

function buildTextExplanations(features) {
  const items = [];
  if (features.url_count > 0) {
    items.push({ label: "Links in message", detail: `${features.url_count} link(s) were found in the text.`, severity: "medium" });
  }
  if (features.urgency_terms > 0) {
    items.push({ label: "Urgency language", detail: "The message pressures the reader to act quickly.", severity: "medium" });
  }
  if (features.credential_terms > 0) {
    items.push({ label: "Credential request language", detail: "The message asks about login, account, password, OTP, or confirmation details.", severity: "high" });
  }
  if (features.money_terms > 0) {
    items.push({ label: "Financial lure", detail: "The message includes invoice, payment, refund, prize, crypto, or wallet language.", severity: "medium" });
  }
  if (features.uppercase_ratio > 0.25) {
    items.push({ label: "High uppercase ratio", detail: "Heavy capitalization can indicate pressure or spam-like formatting.", severity: "low" });
  }
  if (features.exclamation_count >= 3) {
    items.push({ label: "Repeated exclamation marks", detail: "Excessive punctuation is often used in social-engineering lures.", severity: "low" });
  }
  return items;
}

function buildExplanations(scan) {
  const features = scan?.aiDetails?.features || {};
  const items = scan?.type === "url" ? buildUrlExplanations(scan, features) : buildTextExplanations(features);

  if (scan?.reputation?.positives > 0) {
    items.unshift({
      label: "External reputation warning",
      detail: `${scan.reputation.positives} security vendor(s) flagged this item.`,
      severity: "high"
    });
  }

  if (!items.length) {
    items.push({
      label: "No strong risk drivers",
      detail: "The model did not find major structural or language-based phishing indicators.",
      severity: "low"
    });
  }

  return items;
}

export default function ExplainabilityPanel({ scan, compact = false }) {
  const features = scan?.aiDetails?.features || {};
  const explanations = buildExplanations(scan);
  const topFeatures = Object.entries(features).slice(0, compact ? 6 : 12);

  return (
    <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Why this result?</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Risk drivers from model features, URL structure, language cues, and reputation data.
          </p>
        </div>
        {scan?.verdict === "safe" ? <ShieldCheck className="text-emerald-500" /> : <AlertTriangle className="text-amber-500" />}
      </div>

      <div className="mt-4 space-y-2">
        {explanations.map((item) => (
          <div key={`${item.label}-${item.detail}`} className={`rounded border p-3 text-sm ${severityStyles[item.severity]}`}>
            <div className="flex items-start gap-2">
              {item.severity === "low" ? <CheckCircle2 size={17} /> : <HelpCircle size={17} />}
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 opacity-90">{item.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!compact && topFeatures.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Globe2 size={16} />
            Model feature values
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {topFeatures.map(([key, value]) => (
              <div key={key} className="rounded bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500">{formatFeatureName(key)}</p>
                <p className="font-bold">{typeof value === "number" ? Number(value).toFixed(value % 1 ? 2 : 0) : String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
