import { Bell, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const unread = items.filter((item) => !item.read);

  useEffect(() => {
    api.get("/notifications").then((res) => setItems(res.data.items || [])).catch(() => setItems([]));
  }, []);

  const markRead = async () => {
    const ids = unread.map((item) => item._id);
    if (!ids.length) return;
    await api.patch("/notifications/read", { ids });
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative rounded border border-slate-200 p-2 dark:border-slate-800" title="Notifications">
        <Bell size={18} />
        {unread.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-signal-red px-1 text-[10px] font-bold text-white">{unread.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-24px))] rounded border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold">Notifications</h3>
            <button onClick={markRead} className="inline-flex items-center gap-1 text-xs font-semibold text-cyber-600 dark:text-cyber-400">
              <CheckCircle2 size={14} /> Mark read
            </button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="rounded bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-950">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <Link key={item._id} to={item.link || "/history"} onClick={() => setOpen(false)} className="block rounded bg-slate-50 p-3 text-sm hover:bg-cyber-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{item.title}</p>
                    {!item.read && <span className="mt-1 h-2 w-2 rounded-full bg-cyber-500" />}
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{item.message}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
