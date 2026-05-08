import { Ban, ShieldAlert, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ScanTable from "../components/ScanTable";
import StatCard from "../components/StatCard";

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [scans, setScans] = useState([]);

  const load = async () => {
    const [overviewRes, usersRes, scansRes] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/users"),
      api.get("/admin/scans")
    ]);
    setOverview(overviewRes.data);
    setUsersList(usersRes.data.items);
    setScans(scansRes.data.items);
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={overview.users} icon={Users} />
        <StatCard label="All Scans" value={overview.scans} icon={ShieldAlert} />
        <StatCard label="Blocked Users" value={overview.blockedUsers} icon={Ban} accent="text-signal-red" />
      </div>
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

