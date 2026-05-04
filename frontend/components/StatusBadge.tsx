const styles: Record<string, string> = {
  open:        "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-indigo-100 text-indigo-700 border-indigo-200",
  waiting:     "bg-amber-100 text-amber-700 border-amber-200",
  completed:   "bg-green-100 text-green-700 border-green-200",
};

const labels: Record<string, string> = {
  open:        "Åpen",
  in_progress: "Pågår",
  waiting:     "Venter",
  completed:   "Fullført",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {labels[status] ?? status}
    </span>
  );
}
