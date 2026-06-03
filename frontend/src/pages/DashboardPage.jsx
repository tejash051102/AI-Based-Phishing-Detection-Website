import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

  const total = counts.safe + counts.suspicious + counts.phishing;
  const riskLabel = data.riskScore >= 70 ? "High" : data.riskScore >= 40 ? "Elevated" : "Low";
  const verdictChart = [
    { name: "Safe", value: counts.safe, color: "#22c55e" },
    { name: "Suspicious", value: counts.suspicious, color: "#f59e0b" },
    { name: "Phishing", value: counts.phishing, color: "#ef4444" }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyber-600 dark:text-cyber-400">Executive Security Overview</p>
            <h2 className="mt-2 text-2xl font-black">Organization phishing exposure dashboard</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Monitor scan activity, high-risk detections, model confidence, and user exposure trends from a single operational view.
            </p>
          </div>
          <div className="rounded bg-slate-50 p-4 text-sm dark:bg-slate-950">
            <p className="font-bold">Operational status</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">AI scanning service, audit history, notifications, and reports are enabled.</p>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Safe Scans" value={counts.safe} icon={CheckCircle2} accent="text-signal-green" />
        <StatCard label="Suspicious" value={counts.suspicious} icon={AlertTriangle} accent="text-signal-amber" />
        <StatCard label="Phishing" value={counts.phishing} icon={ShieldAlert} accent="text-signal-red" />
        <StatCard label="Total Scans" value={counts.safe + counts.suspicious + counts.phishing} icon={Activity} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Threat trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Animated scan volume and average risk over time.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded bg-cyber-50 px-3 py-2 text-sm font-bold text-cyber-600 dark:bg-slate-950 dark:text-cyber-400">
              <TrendingUp size={16} /> {riskLabel} risk
            </span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="avgScore" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.22} animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">User risk score</h2>
          <div className="mt-4 grid place-items-center">
            <div className="relative grid h-40 w-40 place-items-center rounded-full border-[12px] border-cyber-500 bg-cyber-50 dark:bg-slate-950">
              <div className="text-center">
                <p className="text-4xl font-black">{data.riskScore || 0}</p>
                <p className="text-xs font-bold uppercase text-slate-500">out of 100</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">Based on safe, suspicious, and phishing scan distribution across {total} scan(s).</p>
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Verdict mix</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={verdictChart} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={4}>
                  {verdictChart.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Scan activity</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="#2563eb" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Latest scans</h2>
        </div>
        <ScanTable scans={data.latest} />
      </section>
    </div>
  );
}
