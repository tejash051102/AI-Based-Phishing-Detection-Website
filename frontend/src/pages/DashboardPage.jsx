import { Activity, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/client";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ScanTable from "../components/ScanTable";
import StatCard from "../components/StatCard";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/scans/analytics").then((res) => setData(res.data));
  }, []);

  const counts = useMemo(() => {
    const base = { safe: 0, suspicious: 0, phishing: 0 };
    data?.summary?.forEach((item) => {
      base[item._id] = item.count;
    });
    return base;
  }, [data]);

  if (!data) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Safe Scans" value={counts.safe} icon={CheckCircle2} accent="text-signal-green" />
        <StatCard label="Suspicious" value={counts.suspicious} icon={AlertTriangle} accent="text-signal-amber" />
        <StatCard label="Phishing" value={counts.phishing} icon={ShieldAlert} accent="text-signal-red" />
        <StatCard label="Total Scans" value={counts.safe + counts.suspicious + counts.phishing} icon={Activity} />
      </div>
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Threat trend</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="avgScore" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Latest scans</h2>
        </div>
        <ScanTable scans={data.latest} />
      </section>
    </div>
  );
}

