export default function StatCard({ label, value, accent = "text-cyber-500", icon: Icon }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {Icon && <Icon className={accent} size={20} />}
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

