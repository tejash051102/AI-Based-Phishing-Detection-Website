import { Download, MessageSquareWarning, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";
import ExplainabilityPanel from "../components/ExplainabilityPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ThreatBadge from "../components/ThreatBadge";

export default function ScanDetailPage() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

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

  const submitFeedback = async (label) => {
    setSavingFeedback(true);
    try {
      const { data } = await api.patch(`/scans/${id}/feedback`, { label, note: feedbackNote });
      setScan(data.scan);
      toast.success("Feedback saved for model review");
      setFeedbackNote("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save feedback");
    } finally {
      setSavingFeedback(false);
    }
  };

  if (!scan) return <LoadingSkeleton rows={5} />;

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
          <div className="flex items-start gap-3">
            <MessageSquareWarning className="mt-1 text-cyber-500" />
            <div>
              <h3 className="text-lg font-bold">Report model feedback</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Mark incorrect verdicts so admins can review false positives and false negatives.
              </p>
            </div>
          </div>
          {scan.userFeedback?.label && (
            <div className="mt-4 rounded bg-slate-50 p-3 text-sm dark:bg-slate-950">
              Current feedback: <span className="font-semibold">{scan.userFeedback.label.replace(/_/g, " ")}</span>
            </div>
          )}
          <textarea
            rows={3}
            className="mt-4 w-full rounded border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-cyber-500 dark:border-slate-800 dark:bg-slate-950"
            placeholder="Optional note for review..."
            value={feedbackNote}
            onChange={(event) => setFeedbackNote(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={savingFeedback} onClick={() => submitFeedback("accurate")} className="rounded border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700">
              Verdict is accurate
            </button>
            <button disabled={savingFeedback} onClick={() => submitFeedback("false_positive")} className="rounded border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700">
              False positive
            </button>
            <button disabled={savingFeedback} onClick={() => submitFeedback("false_negative")} className="rounded bg-cyber-500 px-3 py-2 text-sm font-semibold text-white">
              False negative
            </button>
          </div>
        </section>
      </div>
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold">Reputation and model data</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">External reputation</p>
            <p className="text-xl font-black">{scan.reputation?.positives ?? 0} flag(s)</p>
          </div>
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Model features</p>
            <p className="text-xl font-black">{Object.keys(scan.aiDetails?.features || {}).length}</p>
          </div>
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Review status</p>
            <p className="text-xl font-black capitalize">{scan.status}</p>
          </div>
        </div>
      </section>
      <ExplainabilityPanel scan={scan} />
    </div>
  );
}
