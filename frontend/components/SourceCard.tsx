interface Source {
  filename: string;
  document_id: string;
  excerpt: string;
  similarity: number;
}

export default function SourceCard({ source }: { source: Source }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-medium text-brand-700 truncate">{source.filename}</span>
        <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-brand-700 font-mono">
          {Math.round(source.similarity * 100)}%
        </span>
      </div>
      <p className="text-slate-600 line-clamp-3">{source.excerpt}</p>
    </div>
  );
}
