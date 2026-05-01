"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Document {
  id: string;
  filename: string;
  created_at: string | null;
  chunks: number;
}

const API_BASE = "/api/backend";

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/documents`);
      if (res.ok) setDocuments(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
      await fetchDocuments();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ukjent feil.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/documents/${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("Kunne ikke slette dokumentet.");
    } finally {
      setDeleting(null);
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

  function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">Dokumenter</h2>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
          p-6 cursor-pointer transition-colors
          ${dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50"}
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={onInputChange} />

        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {documents.length > 0 && (
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-start justify-between rounded-lg bg-white px-4 py-3 shadow-sm border border-slate-100 gap-2">
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-medium text-slate-700">{doc.filename}</span>
                <span className="text-xs text-slate-400">
                  {doc.chunks} biter{doc.created_at ? ` · ${formatDate(doc.created_at)}` : ""}
                </span>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
                className="shrink-0 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                title="Slett dokument"
              >
                {deleting === doc.id ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {documents.length === 0 && !uploading && (
        <p className="text-xs text-slate-400 text-center">Ingen dokumenter lastet opp ennå</p>
      )}
    </div>
  );
}
