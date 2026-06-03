import { Download, FileText, FileUp, Link as LinkIcon, MailWarning, Search, Send, ShieldCheck, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import ExplainabilityPanel from "../components/ExplainabilityPanel";
import ThreatBadge from "../components/ThreatBadge";

const modes = [
  { id: "url", label: "URL", icon: LinkIcon },
  { id: "text", label: "Email/Text", icon: MailWarning },
  { id: "file", label: "File Upload", icon: FileUp },
  { id: "bulk", label: "Bulk Scan", icon: FileText }
];

function splitBulkItems(value) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export default function ScannerPage() {
  const [mode, setMode] = useState("url");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [batch, setBatch] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [preview, setPreview] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [loading, setLoading] = useState(false);

  const bulkItems = useMemo(() => splitBulkItems(bulkText), [bulkText]);

  const resetOutputs = () => {
    setResult(null);
    setBatch([]);
    setPreview(null);
    setHeaders(null);
  };

  const scan = async () => {
    setLoading(true);
    resetOutputs();
    try {
      const { data } = await api.post("/scans", { type: mode === "text" ? "text" : "url", content });
      setResult(data.scan);
      toast.success("Scan completed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const upload = async () => {
    if (!file) return toast.error("Choose a file first");
    setLoading(true);
    resetOutputs();
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/scans/upload", form);
      setResult(data.scan);
      setBatch(data.scans || []);
      toast.success(`File scanned: ${data.extracted || 1} item(s) analyzed`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const bulkScan = async () => {
    if (!bulkItems.length) return toast.error("Paste URLs or messages first");
    setLoading(true);
    resetOutputs();
    try {
      const { data } = await api.post("/scans/bulk", { items: bulkItems });
      setBatch(data.scans || []);
      setResult(data.scans?.[0] || null);
      toast.success(`${data.total} item(s) scanned`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk scan failed");
    } finally {
      setLoading(false);
    }
  };

  const safePreview = async () => {
    try {
      const { data } = await api.post("/scans/preview", { url: content });
      setPreview(data.preview);
    } catch (error) {
      toast.error(error.response?.data?.message || "Preview failed");
    }
  };

  const analyzeHeaders = async () => {
    try {
      const { data } = await api.post("/scans/headers/analyze", { content });
      setHeaders(data.analysis);
    } catch (_error) {
      toast.error("Header analysis failed");
    }
  };

  const exportReport = async () => {
    if (!result?._id) return;
    try {
      const response = await api.get(`/scans/${result._id}/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `scan-${result._id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      toast.error("Could not export report");
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyber-600 dark:text-cyber-400">Threat Intake Workflow</p>
            <h2 className="mt-2 text-2xl font-black">Analyze suspicious URLs, emails, and files</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Use PhishGuard AI to triage submissions, capture indicators, generate evidence, and support analyst review.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded bg-slate-50 p-3 dark:bg-slate-950"><p className="font-black">AI</p><p className="text-slate-500">Scoring</p></div>
            <div className="rounded bg-slate-50 p-3 dark:bg-slate-950"><p className="font-black">PDF</p><p className="text-slate-500">Evidence</p></div>
            <div className="rounded bg-slate-50 p-3 dark:bg-slate-950"><p className="font-black">SOC</p><p className="text-slate-500">Ready</p></div>
          </div>
        </div>
      </section>
      <section className="rounded border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {modes.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setMode(id); resetOutputs(); }} className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-bold ${mode === id ? "bg-cyber-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          {mode !== "file" && mode !== "bulk" && (
            <>
              <textarea
                rows={10}
                className="w-full rounded border border-slate-200 bg-slate-50 p-4 outline-none focus:border-cyber-500 dark:border-slate-800 dark:bg-slate-950"
                placeholder={mode === "url" ? "https://example.com/login/verify" : "Paste suspicious email, SMS text, or .eml headers..."}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={scan} disabled={loading || content.length < 3} className="inline-flex items-center gap-2 rounded bg-cyber-500 px-5 py-3 font-semibold text-white disabled:opacity-60">
                  <Send size={18} /> {loading ? "Scanning..." : "Run AI scan"}
                </button>
                {mode === "url" && (
                  <button onClick={safePreview} disabled={content.length < 4} className="inline-flex items-center gap-2 rounded border border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">
                    <Search size={18} /> Safe preview
                  </button>
                )}
                {mode === "text" && (
                  <button onClick={analyzeHeaders} disabled={content.length < 10} className="inline-flex items-center gap-2 rounded border border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">
                    <MailWarning size={18} /> Analyze headers
                  </button>
                )}
              </div>
            </>
          )}

          {mode === "file" && (
            <div onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="rounded border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <UploadCloud className="mx-auto text-cyber-500" size={42} />
              <p className="mt-3 font-bold">{file ? file.name : "Drag and drop a file here"}</p>
              <p className="mt-1 text-sm text-slate-500">Supports .txt, .eml, .csv, and .json</p>
              <label className="mt-4 inline-flex cursor-pointer rounded border border-slate-200 px-4 py-2 font-semibold dark:border-slate-700">
                Choose file
                <input type="file" className="hidden" accept=".txt,.eml,.csv,.json" onChange={(event) => setFile(event.target.files?.[0])} />
              </label>
              <button onClick={upload} disabled={loading || !file} className="ml-2 mt-4 inline-flex rounded bg-cyber-500 px-4 py-2 font-semibold text-white disabled:opacity-60">
                Scan uploaded file
              </button>
            </div>
          )}

          {mode === "bulk" && (
            <>
              <textarea
                rows={12}
                className="w-full rounded border border-slate-200 bg-slate-50 p-4 outline-none focus:border-cyber-500 dark:border-slate-800 dark:bg-slate-950"
                placeholder={"Paste one URL or message per line...\nhttps://example.com/login\nUrgent: verify your account now"}
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={bulkScan} disabled={loading || !bulkItems.length} className="inline-flex items-center gap-2 rounded bg-cyber-500 px-5 py-3 font-semibold text-white disabled:opacity-60">
                  <ShieldCheck size={18} /> Scan {bulkItems.length || 0} item(s)
                </button>
                <span className="text-sm text-slate-500">Limit 30 items per batch</span>
              </div>
            </>
          )}

          {preview && (
            <div className="mt-5 rounded border border-slate-200 p-4 text-sm dark:border-slate-800">
              <h3 className="font-bold">Safe URL preview</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(preview).map(([key, value]) => (
                  <div key={key} className="rounded bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs uppercase text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="break-all font-semibold">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {headers && (
            <div className="mt-5 rounded border border-slate-200 p-4 text-sm dark:border-slate-800">
              <h3 className="font-bold">Email header analyzer</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded bg-slate-50 p-3 dark:bg-slate-950"><p className="text-xs text-slate-500">From</p><p className="font-semibold">{headers.from || "Unknown"}</p></div>
                <div className="rounded bg-slate-50 p-3 dark:bg-slate-950"><p className="text-xs text-slate-500">Relay hops</p><p className="font-semibold">{headers.relayHops}</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {headers.checks?.map((item) => <span key={item.label} className="rounded bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">{item.label}: {item.status}</span>)}
              </div>
              <ul className="mt-3 space-y-2">
                {(headers.findings?.length ? headers.findings : ["No major header issues detected"]).map((item) => <li key={item} className="rounded bg-slate-50 p-2 dark:bg-slate-950">{item}</li>)}
              </ul>
            </div>
          )}

          {batch.length > 1 && (
            <div className="mt-5 rounded border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-semibold">Batch results</h3>
              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                {batch.map((scan) => (
                  <div key={scan._id} className="flex items-center justify-between gap-3 rounded bg-slate-50 p-2 text-sm dark:bg-slate-950">
                    <span className="max-w-[70%] truncate">{scan.sourceLabel || scan.type}: {scan.input}</span>
                    <span className="font-bold">{scan.threatScore}/100</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Real-time result</h2>
            {result?._id && <button onClick={exportReport} className="rounded border border-slate-200 p-2 dark:border-slate-700" title="Export PDF"><Download size={17} /></button>}
          </div>
          {!result ? (
            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">Run a scan to see probability, indicators, recommendations, and reputation signals.</p>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="flex items-center justify-between">
                <ThreatBadge verdict={result.verdict} />
                <span className="text-3xl font-black">{result.threatScore}/100</span>
              </div>
              <div className="h-3 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                <div className={`h-full ${result.threatScore >= 75 ? "bg-signal-red" : result.threatScore >= 45 ? "bg-signal-amber" : "bg-signal-green"}`} style={{ width: `${result.threatScore}%` }} />
              </div>
              <div className="rounded bg-slate-50 p-3 text-sm dark:bg-slate-950">
                <p className="font-bold">{result.verdict === "safe" ? "Recommendation: likely safe" : "Recommendation: review before opening"}</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Use the indicators and explanation panel before trusting this item.</p>
              </div>
              <div>
                <h3 className="font-semibold">Indicators</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {(result.indicators?.length ? result.indicators : ["No strong suspicious indicators found"]).map((item) => (
                    <li key={item} className="rounded bg-slate-50 p-2 dark:bg-slate-950">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </aside>
      </div>

      {result && <ExplainabilityPanel scan={result} />}
    </div>
  );
}
