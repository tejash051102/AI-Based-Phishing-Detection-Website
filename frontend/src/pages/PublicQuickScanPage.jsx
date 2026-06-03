import { Link } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import ExplainabilityPanel from "../components/ExplainabilityPanel";
import ThreatBadge from "../components/ThreatBadge";

export default function PublicQuickScanPage() {
  const [url, setUrl] = useState("");
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setScan(null);
    try {
      const { data } = await api.post("/public/quick-scan", { url });
      setScan(data.scan);
    } catch (error) {
      toast.error(error.response?.data?.message || "Quick scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-panel text-ink dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PhishGuard AI" className="h-12 w-12 rounded bg-white object-contain p-1" />
            <div>
              <p className="font-black">PhishGuard AI</p>
              <p className="text-xs text-slate-500">Public quick scan</p>
            </div>
          </div>
          <Link to="/login" className="rounded bg-cyber-500 px-4 py-2 text-sm font-bold text-white">Login</Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_420px]">
        <section className="rounded border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck className="text-cyber-500" size={34} />
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">Scan a suspicious link before you open it.</h1>
          <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
            This public page checks one URL without login. Create an account to save history, export reports, and use admin tools.
          </p>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input value={url} onChange={(event) => setUrl(event.target.value)} className="min-h-12 flex-1 rounded border border-slate-200 bg-slate-50 px-4 outline-none focus:border-cyber-500 dark:border-slate-800 dark:bg-slate-950" placeholder="https://example.com/login" />
            <button disabled={loading || url.length < 4} className="inline-flex items-center justify-center gap-2 rounded bg-cyber-500 px-5 py-3 font-bold text-white disabled:opacity-60">
              <Search size={18} /> {loading ? "Scanning..." : "Quick scan"}
            </button>
          </form>
        </section>
        <aside className="rounded border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Result</h2>
          {!scan ? (
            <p className="mt-8 text-sm text-slate-500">Enter a URL to see a threat score, verdict, safe preview metadata, and indicators.</p>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <ThreatBadge verdict={scan.verdict} />
                <span className="text-3xl font-black">{scan.threatScore}/100</span>
              </div>
              <div className="rounded bg-slate-50 p-3 text-sm dark:bg-slate-950">
                <p className="font-semibold">{scan.preview?.domain}</p>
                <p className="text-slate-500">{scan.preview?.protocol?.toUpperCase()} · path depth {scan.preview?.pathDepth} · query {scan.preview?.queryLength}</p>
              </div>
            </div>
          )}
        </aside>
        {scan && <div className="lg:col-span-2"><ExplainabilityPanel scan={scan} /></div>}
      </main>
    </div>
  );
}
