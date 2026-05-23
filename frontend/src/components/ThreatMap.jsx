import { MapPin } from "lucide-react";

export default function ThreatMap({ points = [] }) {
  const max = Math.max(...points.map((point) => point.count), 1);
  return (
    <div className="rounded border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">Live threat map</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="relative min-h-80 overflow-hidden rounded bg-slate-950 cyber-grid">
          {points.map((point) => {
            const left = ((point.lng + 180) / 360) * 100;
            const top = ((90 - point.lat) / 180) * 100;
            const size = 18 + (point.count / max) * 26;
            return (
              <div
                key={`${point.country}-${point.verdict}-${point.type}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-red-500/70 shadow-glow"
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                title={`${point.city}, ${point.country}: ${point.count} ${point.verdict} ${point.type} scans`}
              />
            );
          })}
        </div>
        <div className="space-y-2">
          {points.slice(0, 8).map((point) => (
            <div key={`${point.country}-${point.verdict}-${point.type}-row`} className="flex items-center justify-between rounded bg-slate-50 p-3 text-sm dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <MapPin className="text-cyber-500" size={16} />
                <div>
                  <p className="font-semibold">{point.city}</p>
                  <p className="text-xs text-slate-500">{point.country} - {point.type}</p>
                </div>
              </div>
              <span className="font-bold">{point.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

