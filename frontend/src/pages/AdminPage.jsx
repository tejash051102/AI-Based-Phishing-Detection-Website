import { Ban, BrainCircuit, MessageSquareWarning, ShieldAlert, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ScanTable from "../components/ScanTable";
import StatCard from "../components/StatCard";
import ThreatMap from "../components/ThreatMap";

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [map, setMap] = useState({ points: [], recent: [] });
  const [usersList, setUsersList] = useState([]);
  const [scans, setScans] = useState([]);
  const [model, setModel] = useState(null);

  const load = async () => {
    const [overviewRes, mapRes, usersRes, scansRes, modelRes] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/threat-map"),
      api.get("/admin/users"),
      api.get("/admin/scans"),
      api.get("/admin/model-monitoring")
    ]);
    setOverview(overviewRes.data);
    setMap(mapRes.data);
    setUsersList(usersRes.data.items);
    setScans(scansRes.data.items);
    setModel(modelRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id) => {
    await api.patch(`/admin/users/${id}/block`);
    toast.success("User status updated");
    load();
  };

  if (!overview) return <LoadingSkeleton rows={5} />;

  const feedbackCounts = ["false_positive", "false_negative", "accurate"].map((label) => ({
    _id: label,
    count: overview.feedback?.find((item) => item._id === label)?.count || 0
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={overview.users} icon={Users} />
        <StatCard label="All Scans" value={overview.scans} icon={ShieldAlert} />
        <StatCard label="Blocked Users" value={overview.blockedUsers} icon={Ban} accent="text-signal-red" />
      </div>
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareWarning className="text-cyber-500" />
          <h2 className="text-lg font-bold">Model feedback queue</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {feedbackCounts.map((item) => (
            <div key={item._id} className="rounded bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm capitalize text-slate-500">{String(item._id).replace(/_/g, " ")}</p>
              <p className="text-2xl font-black">{item.count}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <BrainCircuit className="text-cyber-500" />
          <h2 className="text-lg font-bold">Model monitoring</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Model version</p>
            <p className="break-all text-lg font-black">{model?.modelVersion || "demo-random-forest"}</p>
          </div>
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Dataset size</p>
            <p className="text-2xl font-black">{model?.datasetSize || 0}</p>
          </div>
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Accuracy</p>
            <p className="text-2xl font-black">{model?.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : "N/A"}</p>
          </div>
          <div className="rounded bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Last trained</p>
            <p className="text-sm font-bold">{model?.lastTrainedAt ? new Date(model.lastTrainedAt).toLocaleString() : "Not available"}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["precision", "recall", "f1"].map((key) => (
            <div key={key} className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-sm capitalize text-slate-500">{key}</p>
              <p className="text-xl font-black">{model?.metrics?.[key] ? `${(model.metrics[key] * 100).toFixed(1)}%` : "N/A"}</p>
            </div>
          ))}
        </div>
      </section>
      <ThreatMap points={map.points} />
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-bold">User management</h2>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {usersList.map((user) => (
            <div key={user._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email} - {user.role}</p>
              </div>
              <button onClick={() => toggle(user._id)} className="rounded border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700">
                {user.blocked ? "Unblock" : "Block"}
              </button>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">All scan reports</h2>
        <ScanTable scans={scans} />
      </section>
    </div>
  );
}
