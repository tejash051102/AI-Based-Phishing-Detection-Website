import { Download, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ThreatBadge from "../components/ThreatBadge";

export default function ScanDetailPage() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);

  useEffect(() => {
    api.get(`/scans/${id}`).then((res) => setScan(res.data.scan));
  }, [id]);

  const exportReport = async () => {
    try {
      const response = await api.get(`/scans/${id}/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `scan-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      toast.error("Could not export report");
    }
  };

  if (!scan) return <LoadingSkeleton rows={5} />;

  const features = scan.aiDetails?.features || {};

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <ShieldAlert className="text-cyber-500" />
              <ThreatBadge verdict={scan.verdict} />
            </div>
            <h2 className="break-all text-2xl font-bold">{scan.input}</h2>
            <p className="mt-2 text-sm text-slate-500">{new Date(scan.createdAt).toLocaleString()} - {scan.type.toUpperCase()}</p>
          </div>
          <button onClick={exportReport} className="inline-flex items-center gap-2 rounded bg-cyber-500 px-4 py-2 font-semibold text-white">
            <Download size={17} /> Export PDF
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Threat score</p>
            <p className="text-3xl font-black">{scan.threatScore}/100</p>
          </div>
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Probability</p>
            <p className="text-3xl font-black">{(scan.probability * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Source</p>
            <p className="text-lg font-bold">{scan.fileName || "Manual scan"}</p>
          </div>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold">Indicators</h3>
          <div className="mt-4 space-y-2">
            {(scan.indicators?.length ? scan.indicators : ["No strong suspicious indicators reported"]).map((item) => (
              <div key={item} className="rounded bg-slate-50 p-3 text-sm dark:bg-slate-950">{item}</div>
            ))}
          </div>
        </section>
        <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold">Model features</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(features).map(([key, value]) => (
              <div key={key} className="rounded bg-slate-50 p-3 dark:bg-slate-950">
                <p className="text-xs text-slate-500">{key}</p>
                <p className="font-bold">{String(value)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

