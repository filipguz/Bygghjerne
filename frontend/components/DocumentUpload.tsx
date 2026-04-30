"use client";

import { useRef, useState } from "react";

interface UploadResult {
  filename: string;
  chunks: number;
}

const API_BASE = "/api/backend";

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Kun PDF-filer støttes.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Opplasting feilet.");
      }
      const data: UploadResult & { document_id: string } = await res.json();
      setUploads((prev) => [{ filename: data.filename, chunks: data.chunks }, ...prev]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukjent feil.");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">Last opp dokument</h2>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
          p-8 cursor-pointer transition-colors
          ${dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50"}
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={onInputChange} />

        <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>

        {uploading ? (
          <p className="text-sm text-brand-600 font-medium">Laster opp og indekserer…</p>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-700">Dra og slipp PDF her</p>
            <p className="text-xs text-slate-500">eller klikk for å velge fil</p>
          </>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-200">
          {error}
        </p>
      )}

      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploads.map((u, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate text-sm text-slate-700">{u.filename}</span>
              </div>
              <span className="ml-2 shrink-0 text-xs text-slate-400">{u.chunks} biter</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
