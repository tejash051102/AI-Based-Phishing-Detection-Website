import ThreatBadge from "./ThreatBadge";
import { Link } from "react-router-dom";

export default function ScanTable({ scans = [] }) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Input</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Verdict</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {scans.map((scan) => (
              <tr key={scan._id}>
                <td className="max-w-md truncate px-4 py-3">
                  <Link to={`/history/${scan._id}`} className="font-medium hover:text-cyber-500">
                    {scan.input}
                  </Link>
                  {scan.sourceLabel && <p className="text-xs text-slate-500">{scan.sourceLabel}</p>}
                </td>
                <td className="px-4 py-3 uppercase">{scan.type}</td>
                <td className="px-4 py-3"><ThreatBadge verdict={scan.verdict} /></td>
                <td className="px-4 py-3 font-semibold">{scan.threatScore}/100</td>
                <td className="px-4 py-3 text-slate-500">{new Date(scan.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
