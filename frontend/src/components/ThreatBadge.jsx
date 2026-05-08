const styles = {
  safe: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  suspicious: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  phishing: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
};

export default function ThreatBadge({ verdict }) {
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${styles[verdict] || styles.safe}`}>{verdict}</span>;
}

