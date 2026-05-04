"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch, apiErrorMessage } from "@/utils/api";
import { useBuilding } from "@/utils/building-context";

interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  asset_id: string | null;
  assets: { name: string; category: string } | null;
}

const STATUS_OPTIONS = [
  { value: "", label: "Alle" },
  { value: "open", label: "Åpen" },
  { value: "in_progress", label: "Pågår" },
  { value: "waiting", label: "Venter" },
  { value: "completed", label: "Fullført" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "Alle prioriteter" },
  { value: "critical", label: "Kritisk" },
  { value: "high", label: "Høy" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Lav" },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  open:        ["in_progress", "waiting", "completed"],
  in_progress: ["waiting", "completed", "open"],
  waiting:     ["in_progress", "completed"],
  completed:   ["open"],
};

const STATUS_NEXT_LABEL: Record<string, string> = {
  in_progress: "Start",
  waiting:     "Sett på vent",
  completed:   "Fullfør",
  open:        "Gjenåpne",
};

function WorkOrderFormModal({
  buildingId,
  assets,
  existing,
  onClose,
  onSaved,
}: {
  buildingId: string;
  assets: Array<{ id: string; name: string }>;
  existing: WorkOrder | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [assetId, setAssetId] = useState(existing?.asset_id ?? "");
  const [priority, setPriority] = useState(existing?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(existing?.due_date ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        title,
        description: description || null,
        asset_id: assetId || null,
        priority,
        due_date: dueDate || null,
        ...(!existing ? { building_id: buildingId } : {}),
      };
      const res = existing
        ? await apiFetch(`/work-orders/${existing.id}?building_id=${buildingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await apiFetch("/work-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{existing ? "Rediger arbeidsordre" : "Ny arbeidsordre"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tittel *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="f.eks. Inspeksjon av sprinkleranlegg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Beskrivelse</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Detaljer, instrukser…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prioritet</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option value="low">Lav</option>
                <option value="medium">Medium</option>
                <option value="high">Høy</option>
                <option value="critical">Kritisk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Forfallsdato</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
            </div>
          </div>
          {assets.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Eiendel</label>
              <select value={assetId} onChange={(e) => setAssetId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option value="">Ingen eiendel</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
              {saving ? "Lagrer…" : existing ? "Lagre endringer" : "Opprett arbeidsordre"}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Avbryt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Arbeidsordre() {
  const { buildingId } = useBuilding();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function load() {
    if (!buildingId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ building_id: buildingId });
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      const [ordersRes, assetsRes] = await Promise.all([
        apiFetch(`/work-orders?${params}`),
        apiFetch(`/assets?building_id=${buildingId}`),
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (assetsRes.ok) setAssets(await assetsRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [buildingId, statusFilter, priorityFilter]);

  async function updateStatus(wo: WorkOrder, newStatus: string) {
    if (!buildingId) return;
    setUpdatingId(wo.id);
    try {
      const res = await apiFetch(`/work-orders/${wo.id}?building_id=${buildingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated: WorkOrder = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
        if (statusFilter && updated.status !== statusFilter) {
          setOrders((prev) => prev.filter((o) => o.id !== updated.id));
        }
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!buildingId) return;
    setDeletingId(id);
    try {
      await apiFetch(`/work-orders/${id}?building_id=${buildingId}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setConfirmDelete(null);
    } finally {
      setDeletingId(null);
    }
  }

  function isOverdue(due: string | null, status: string) {
    if (!due || status === "completed") return false;
    return new Date(due) < new Date(new Date().toDateString());
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <AppShell>
      <div className="flex flex-col flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-lg font-bold text-slate-900">Arbeidsordre</h1>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ny arbeidsordre
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-3 flex-wrap shrink-0">
          <div className="flex gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  statusFilter === s.value
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500">
            {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        {/* Work orders list */}
        <div className="flex-1 px-6 py-6">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">Ingen arbeidsordre funnet</p>
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                className="text-sm text-brand-600 hover:text-brand-800 font-medium">
                + Opprett ny arbeidsordre
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                {orders.map((wo) => {
                  const overdue = isOverdue(wo.due_date, wo.status);
                  const transitions = STATUS_TRANSITIONS[wo.status] ?? [];
                  const primaryNext = transitions[0];
                  return (
                    <div key={wo.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${overdue ? "bg-red-50/50 hover:bg-red-50" : ""}`}>
                      {/* Priority */}
                      <div className="shrink-0 pt-0.5">
                        <PriorityBadge priority={wo.priority} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{wo.title}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          {wo.assets && (
                            <span className="text-xs text-slate-400">{wo.assets.name}</span>
                          )}
                          {wo.due_date && (
                            <span className={`text-xs ${overdue ? "text-red-600 font-medium" : "text-slate-400"}`}>
                              {overdue ? "Forfalt " : ""}{formatDate(wo.due_date)}
                            </span>
                          )}
                          <span className="text-xs text-slate-300">Opprettet {formatDate(wo.created_at)}</span>
                        </div>
                        {wo.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{wo.description}</p>
                        )}
                      </div>

                      {/* Status + actions */}
                      <div className="shrink-0 flex items-center gap-2">
                        <StatusBadge status={wo.status} />

                        {primaryNext && (
                          <button
                            onClick={() => updateStatus(wo, primaryNext)}
                            disabled={updatingId === wo.id}
                            className="text-xs text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {updatingId === wo.id ? "…" : STATUS_NEXT_LABEL[primaryNext] ?? primaryNext}
                          </button>
                        )}

                        <button onClick={() => { setEditing(wo); setShowForm(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Rediger">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.93l-3 1 1-3a4 4 0 01.93-1.414z" />
                          </svg>
                        </button>

                        {confirmDelete === wo.id ? (
                          <>
                            <button onClick={() => handleDelete(wo.id)} disabled={deletingId === wo.id}
                              className="text-xs text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-60">
                              {deletingId === wo.id ? "…" : "Slett"}
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-xs text-slate-500 px-2 py-1 rounded hover:bg-slate-100 transition-colors">
                              Nei
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(wo.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Slett">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && buildingId && (
        <WorkOrderFormModal
          buildingId={buildingId}
          assets={assets}
          existing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={load}
        />
      )}
    </AppShell>
  );
}
