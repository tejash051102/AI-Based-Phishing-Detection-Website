import { Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ScanTable from "../components/ScanTable";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ search: "", verdict: "", type: "", from: "", to: "", page: 1 });

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ""));
    api
      .get("/scans", { params })
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  }, [query]);

  const exportLatest = async () => {
    if (!items[0]) return;
    try {
      const response = await api.get(`/scans/${items[0]._id}/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `scan-${items[0]._id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      toast.error("Could not export report");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input className="w-full rounded border border-slate-200 bg-transparent py-2 pl-10 pr-3 dark:border-slate-800" placeholder="Search scans" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} />
        </div>
        <select className="rounded border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-800" value={query.verdict} onChange={(e) => setQuery({ ...query, verdict: e.target.value, page: 1 })}>
          <option value="">All verdicts</option>
          <option value="safe">Safe</option>
          <option value="suspicious">Suspicious</option>
          <option value="phishing">Phishing</option>
        </select>
        <select className="rounded border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-800" value={query.type} onChange={(e) => setQuery({ ...query, type: e.target.value, page: 1 })}>
          <option value="">All types</option>
          <option value="url">URL</option>
          <option value="text">Text</option>
          <option value="file">File</option>
        </select>
        <input type="date" className="rounded border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-800" value={query.from} onChange={(e) => setQuery({ ...query, from: e.target.value, page: 1 })} />
        <input type="date" className="rounded border border-slate-200 bg-transparent px-3 py-2 dark:border-slate-800" value={query.to} onChange={(e) => setQuery({ ...query, to: e.target.value, page: 1 })} />
      </div>
      {loading ? <LoadingSkeleton rows={5} /> : <ScanTable scans={items} />}
      {items[0] && (
        <button onClick={exportLatest} className="inline-flex items-center gap-2 rounded bg-cyber-500 px-4 py-2 font-semibold text-white">
          <Download size={17} /> Export latest report
        </button>
      )}
    </div>
  );
}
