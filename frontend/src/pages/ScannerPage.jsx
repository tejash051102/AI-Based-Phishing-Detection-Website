import { FileUp, Link as LinkIcon, MailWarning, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import ThreatBadge from "../components/ThreatBadge";

export default function ScannerPage() {
  const [type, setType] = useState("url");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/scans", { type, content });
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
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/scans/upload", form);
      setResult(data.scan);
      toast.success("File scanned");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap gap-2">
          <button onClick={() => setType("url")} className={`flex items-center gap-2 rounded px-4 py-2 ${type === "url" ? "bg-cyber-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
            <LinkIcon size={17} /> URL
          </button>
          <button onClick={() => setType("text")} className={`flex items-center gap-2 rounded px-4 py-2 ${type === "text" ? "bg-cyber-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
            <MailWarning size={17} /> Email/Text
          </button>
        </div>
        <textarea
          rows={10}
          className="w-full rounded border border-slate-200 bg-slate-50 p-4 outline-none focus:border-cyber-500 dark:border-slate-800 dark:bg-slate-950"
          placeholder={type === "url" ? "https://example.com/login/verify" : "Paste suspicious email or SMS text..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={scan} disabled={loading || content.length < 3} className="mt-4 flex items-center gap-2 rounded bg-cyber-500 px-5 py-3 font-semibold text-white disabled:opacity-60">
          <Send size={18} /> {loading ? "Scanning..." : "Run AI scan"}
        </button>
        <div className="mt-6 rounded border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
            <FileUp className="text-cyber-500" />
            <span className="text-sm font-medium">{file ? file.name : "Upload .txt, .eml, .csv, or .json"}</span>
            <input type="file" className="hidden" accept=".txt,.eml,.csv,.json" onChange={(e) => setFile(e.target.files?.[0])} />
          </label>
          <button onClick={upload} disabled={loading} className="mt-4 w-full rounded border border-slate-200 px-4 py-2 font-semibold dark:border-slate-700">
            Scan uploaded file
          </button>
        </div>
      </section>
      <aside className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Real-time result</h2>
        {!result ? (
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">Run a scan to see probability, indicators, and reputation signals.</p>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="flex items-center justify-between">
              <ThreatBadge verdict={result.verdict} />
              <span className="text-3xl font-black">{result.threatScore}/100</span>
            </div>
            <div className="h-3 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-cyber-500" style={{ width: `${result.threatScore}%` }} />
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
  );
}

