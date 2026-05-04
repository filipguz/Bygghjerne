const styles: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  low:      "bg-green-100 text-green-700 border-green-200",
};

const labels: Record<string, string> = {
  critical: "Kritisk",
  high:     "Høy",
  medium:   "Medium",
  low:      "Lav",
};

export default function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {labels[priority] ?? priority}
    </span>
  );
}
