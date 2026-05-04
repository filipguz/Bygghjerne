"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch, apiErrorMessage } from "@/utils/api";
import { useBuilding } from "@/utils/building-context";

interface Asset {
  id: string;
  name: string;
  category: string;
  location_floor: string | null;
  location_room: string | null;
  installation_date: string | null;
  maintenance_interval_days: number | null;
  last_maintenance_date: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "", label: "Alle" },
  { value: "hvac", label: "VVS / Ventilasjon" },
  { value: "fire_safety", label: "Brannsikring" },
  { value: "electrical", label: "Elektrisk" },
  { value: "plumbing", label: "Rørlegger" },
  { value: "elevator", label: "Heis" },
  { value: "other", label: "Annet" },
];

const CATEGORY_LABELS: Record<string, string> = {
  hvac: "VVS / Ventilasjon",
  fire_safety: "Brannsikring",
  electrical: "Elektrisk",
  plumbing: "Rørlegger",
  elevator: "Heis",
  other: "Annet",
};

const CATEGORY_COLORS: Record<string, string> = {
  hvac: "bg-blue-100 text-blue-700",
  fire_safety: "bg-red-100 text-red-700",
  electrical: "bg-yellow-100 text-yellow-700",
  plumbing: "bg-cyan-100 text-cyan-700",
  elevator: "bg-violet-100 text-violet-700",
  other: "bg-slate-100 text-slate-600",
};

function CategoryIcon({ category }: { category: string }) {
  const cls = "h-5 w-5";
  if (category === "hvac") return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
  if (category === "fire_safety") return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  );
  if (category === "electrical") return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
  if (category === "elevator") return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function nextMaintenanceDate(asset: Asset): { label: string; urgent: boolean; overdue: boolean } {
  if (!asset.maintenance_interval_days) return { label: "—", urgent: false, overdue: false };
  const base = asset.last_maintenance_date ?? asset.installation_date;
  if (!base) return { label: "—", urgent: false, overdue: false };
  const next = new Date(base);
  next.setDate(next.getDate() + asset.maintenance_interval_days);
  const today = new Date();
  const diff = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const label = next.toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" });
  return { label, urgent: diff <= 30, overdue: diff < 0 };
}

function AssetFormModal({
  buildingId,
  existing,
  onClose,
  onSaved,
}: {
  buildingId: string;
  existing: Asset | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [category, setCategory] = useState(existing?.category ?? "other");
  const [floor, setFloor] = useState(existing?.location_floor ?? "");
  const [room, setRoom] = useState(existing?.location_room ?? "");
  const [installDate, setInstallDate] = useState(existing?.installation_date ?? "");
  const [interval, setInterval] = useState(existing?.maintenance_interval_days?.toString() ?? "");
  const [lastMaint, setLastMaint] = useState(existing?.last_maintenance_date ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        name,
        category,
        location_floor: floor || null,
        location_room: room || null,
        installation_date: installDate || null,
        maintenance_interval_days: interval ? parseInt(interval) : null,
        last_maintenance_date: lastMaint || null,
        ...(!existing ? { building_id: buildingId } : {}),
      };
      const res = existing
        ? await apiFetch(`/assets/${existing.id}?building_id=${buildingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await apiFetch("/assets", {
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
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{existing ? "Rediger eiendel" : "Ny eiendel"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Navn *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="f.eks. Ventilasjonsanlegg 3. etg." />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              {CATEGORIES.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Etasje</label>
              <input value={floor} onChange={(e) => setFloor(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="f.eks. 2. etg." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rom</label>
              <input value={room} onChange={(e) => setRoom(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="f.eks. Teknisk rom" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Installasjonsdato</label>
              <input type="date" value={installDate} onChange={(e) => setInstallDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vedlikeholdsintervall (dager)</label>
              <input type="number" min={1} value={interval} onChange={(e) => setInterval(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="f.eks. 365" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Siste vedlikehold</label>
            <input type="date" value={lastMaint} onChange={(e) => setLastMaint(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
              {saving ? "Lagrer…" : existing ? "Lagre endringer" : "Legg til eiendel"}
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

interface TrendPoint {
  report_date: string;
  condition_score: number;
  report_type: string;
  performed_by: string;
  observed_issues: string | null;
  recommended_actions: string | null;
}

interface Pattern {
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
}

interface PatternAnalysis {
  patterns: Pattern[];
  risk_level: string;
  report_count: number;
  latest_score?: number;
  average_score?: number;
}

function ConditionDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`h-1.5 w-1.5 rounded-full ${
          i <= score
            ? score >= 4 ? "bg-green-500" : score === 3 ? "bg-yellow-500" : "bg-red-500"
            : "bg-slate-200"
        }`} />
      ))}
    </div>
  );
}

function ConditionSparkline({ trend }: { trend: TrendPoint[] }) {
  if (trend.length < 2) return null;
  const sorted = [...trend].reverse();
  const W = 180, H = 48, PAD = 6;
  const xStep = (W - PAD * 2) / (sorted.length - 1);
  const yOf = (s: number) => H - PAD - ((s - 1) / 4) * (H - PAD * 2);
  const pts = sorted.map((p, i) => ({ x: PAD + i * xStep, y: yOf(p.condition_score), score: p.condition_score }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const dotColor = (s: number) => s >= 4 ? "#22c55e" : s === 3 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={W} height={H} className="w-full">
      <path d={pathD} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={dotColor(p.score)} />)}
    </svg>
  );
}

function AssetHealthPanel({
  asset, buildingId, onClose,
}: { asset: Asset; buildingId: string; onClose: () => void }) {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tRes, aRes] = await Promise.all([
          apiFetch(`/assets/${asset.id}/condition-trend?building_id=${buildingId}`),
          apiFetch(`/assets/${asset.id}/pattern-analysis?building_id=${buildingId}`),
        ]);
        if (tRes.ok) { const d = await tRes.json(); setTrend(d.trend || []); }
        if (aRes.ok) setAnalysis(await aRes.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [asset.id, buildingId]);

  const severityStyle = (sev: string) =>
    sev === "critical" ? "bg-red-50 border-red-200 text-red-700"
    : sev === "warning" ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col gap-4 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">{asset.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tilstandsanalyse</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-6 w-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : (
          <>
            {analysis && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Siste score</p>
                  <p className={`text-xl font-bold ${analysis.latest_score != null && analysis.latest_score <= 2 ? "text-red-600" : analysis.latest_score === 3 ? "text-yellow-600" : "text-green-600"}`}>
                    {analysis.latest_score ?? "—"}<span className="text-sm font-normal text-slate-400">/5</span>
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Snitt</p>
                  <p className="text-xl font-bold text-slate-700">
                    {analysis.average_score ?? "—"}<span className="text-sm font-normal text-slate-400">/5</span>
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Rapporter</p>
                  <p className="text-xl font-bold text-slate-700">{analysis.report_count}</p>
                </div>
              </div>
            )}
            {trend.length >= 2 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Tilstandstrend</p>
                <ConditionSparkline trend={trend} />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">{trend[trend.length - 1]?.report_date}</p>
                  <p className="text-xs text-slate-400">{trend[0]?.report_date}</p>
                </div>
              </div>
            )}
            {analysis && analysis.patterns.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-slate-500">Mønstre oppdaget</p>
                {analysis.patterns.map((p, i) => (
                  <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${severityStyle(p.severity)}`}>{p.message}</div>
                ))}
              </div>
            )}
            {analysis && analysis.patterns.length === 0 && analysis.report_count > 0 && (
              <div className="text-xs px-3 py-2 rounded-lg border bg-green-50 border-green-200 text-green-700">
                Ingen bekymringsfulle mønstre oppdaget
              </div>
            )}
            {(!analysis || analysis.report_count === 0) && (
              <p className="text-sm text-slate-400 text-center py-4">Ingen inspeksjonsrapporter ennå</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Eiendeler() {
  const { buildingId } = useBuilding();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [healthAsset, setHealthAsset] = useState<Asset | null>(null);

  async function load() {
    if (!buildingId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/assets?building_id=${buildingId}`);
      if (res.ok) setAssets(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [buildingId]);

  async function handleDelete(id: string) {
    if (!buildingId) return;
    setDeletingId(id);
    try {
      await apiFetch(`/assets/${id}?building_id=${buildingId}`, { method: "DELETE" });
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setConfirmDelete(null);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = categoryFilter ? assets.filter((a) => a.category === categoryFilter) : assets;

  return (
    <AppShell>
      <div className="flex flex-col flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-lg font-bold text-slate-900">Eiendeler</h1>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ny eiendel
          </button>
        </div>

        {/* Category filter */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                categoryFilter === c.value
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Asset grid */}
        <div className="flex-1 px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-36 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <p className="text-sm">{categoryFilter ? "Ingen eiendeler i denne kategorien" : "Ingen eiendeler registrert"}</p>
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                className="text-sm text-brand-600 hover:text-brand-800 font-medium">
                + Legg til første eiendel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((asset) => {
                const maint = nextMaintenanceDate(asset);
                return (
                  <div key={asset.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${CATEGORY_COLORS[asset.category] ?? "bg-slate-100 text-slate-600"}`}>
                        <CategoryIcon category={asset.category} />
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setHealthAsset(asset)}
                          className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Tilstandsanalyse">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setEditing(asset); setShowForm(true); }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Rediger">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.93l-3 1 1-3a4 4 0 01.93-1.414z" />
                          </svg>
                        </button>
                        {confirmDelete === asset.id ? (
                          <>
                            <button onClick={() => handleDelete(asset.id)} disabled={deletingId === asset.id}
                              className="text-xs text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-60">
                              {deletingId === asset.id ? "…" : "Slett"}
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-xs text-slate-500 px-2 py-1 rounded hover:bg-slate-100 transition-colors">
                              Nei
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(asset.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Slett">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800 text-sm leading-tight">{asset.name}</p>
                      {(asset.location_floor || asset.location_room) && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {[asset.location_floor, asset.location_room].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[asset.category] ?? "bg-slate-100 text-slate-500"}`}>
                        {CATEGORY_LABELS[asset.category] ?? asset.category}
                      </span>
                      {asset.maintenance_interval_days && (
                        <p className={`text-xs font-medium ${maint.overdue ? "text-red-600" : maint.urgent ? "text-orange-500" : "text-slate-400"}`}>
                          {maint.overdue ? "Forfalt" : maint.label}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && buildingId && (
        <AssetFormModal
          buildingId={buildingId}
          existing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={load}
        />
      )}

      {healthAsset && buildingId && (
        <AssetHealthPanel
          asset={healthAsset}
          buildingId={buildingId}
          onClose={() => setHealthAsset(null)}
        />
      )}
    </AppShell>
  );
}
