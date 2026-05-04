"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import { apiFetch, apiErrorMessage } from "@/utils/api";
import { useBuilding } from "@/utils/building-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPIs {
  total_assets: number;
  open_work_orders: number;
  overdue_maintenance: number;
}

interface WorkOrderSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  assets: { name: string } | null;
}

interface MaintenanceItem {
  id: string;
  name: string;
  category: string;
  next_maintenance_date: string;
  days_until_due: number;
}

interface DashboardData {
  kpis: KPIs;
  recent_work_orders: WorkOrderSummary[];
  upcoming_maintenance: MaintenanceItem[];
}

interface AiMessage {
  role: "user" | "assistant";
  content: string;
  tools_used?: string[];
  actions_taken?: Array<{ type: string; work_order?: { id: string; title: string; priority: string } }>;
}

const TOOL_LABELS: Record<string, string> = {
  get_building_summary: "Hentet statusoversikt",
  get_open_work_orders: "Hentet arbeidsordre",
  get_overdue_work_orders: "Sjekket forfalne ordrer",
  get_upcoming_maintenance: "Sjekket vedlikeholdsplan",
  get_asset_history: "Hentet eiendelhistorikk",
  create_work_order: "Opprettet arbeidsordre",
  search_documents: "Søkte i dokumenter",
};

const QUICK_PROMPTS = [
  "Hva bør jeg prioritere i dag?",
  "Vis forfalne arbeidsordre",
  "Hva trenger vedlikehold de neste 30 dagene?",
];

// ─── Work order create modal ──────────────────────────────────────────────────

function CreateWOModal({
  assets,
  buildingId,
  onClose,
  onCreated,
}: {
  assets: Array<{ id: string; name: string }>;
  buildingId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetId, setAssetId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch("/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building_id: buildingId,
          title,
          description: description || null,
          asset_id: assetId || null,
          priority,
          due_date: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      onCreated();
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
          <h2 className="font-semibold text-slate-900">Ny arbeidsordre</h2>
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
              placeholder="f.eks. Bytte luftfilter VVS-anlegg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Beskrivelse</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Valgfri detaljer…" />
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
                <option value="">Ingen eiendel valgt</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
              {saving ? "Lagrer…" : "Opprett arbeidsordre"}
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

// ─── AI Panel ─────────────────────────────────────────────────────────────────

function AiPanel({ buildingId, onClose }: { buildingId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await apiFetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, building_id: buildingId, mode: "enhanced" }),
      });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          tools_used: data.tools_used ?? [],
          actions_taken: data.actions_taken ?? [],
        },
      ]);
    } catch (e: unknown) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : "Noe gikk galt." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed md:relative inset-0 md:inset-auto z-30 md:z-auto w-full md:w-80 md:shrink-0 flex flex-col bg-white md:border-l border-slate-200 md:h-full shadow-xl md:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800">AI-assistent</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs text-slate-400 text-center mb-2">Hurtigspørsmål</p>
            {QUICK_PROMPTS.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-left text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors rounded-lg px-3 py-2 border border-brand-100">
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-brand-600 text-white rounded-br-sm"
                : "bg-slate-100 text-slate-800 rounded-bl-sm"
            }`}>
              {msg.content}
            </div>

            {msg.role === "assistant" && (msg.tools_used?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1 max-w-[90%]">
                {msg.tools_used!.map((t, j) => (
                  <span key={j} className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                    {TOOL_LABELS[t] ?? t}
                  </span>
                ))}
              </div>
            )}

            {msg.role === "assistant" && (msg.actions_taken?.length ?? 0) > 0 && (
              <div className="max-w-[90%] flex flex-col gap-1">
                {msg.actions_taken!.map((a, j) =>
                  a.type === "work_order_created" && a.work_order ? (
                    <div key={j} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800">
                      ✓ Opprettet: <strong>{a.work_order.title}</strong>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="bg-slate-100 rounded-xl rounded-bl-sm px-3 py-2.5">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex gap-2 items-end">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Spør om bygget…"
            disabled={loading}
            className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 max-h-24"
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="shrink-0 bg-brand-600 text-white rounded-lg p-2 hover:bg-brand-700 disabled:opacity-40 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { buildingId } = useBuilding();
  const [data, setData] = useState<DashboardData | null>(null);
  const [assets, setAssets] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showWO, setShowWO] = useState(false);
  const [showAI, setShowAI] = useState(false);

  async function load() {
    if (!buildingId) return;
    setLoading(true);
    try {
      const [dashRes, assetsRes] = await Promise.all([
        apiFetch(`/dashboard/${buildingId}`),
        apiFetch(`/assets?building_id=${buildingId}`),
      ]);
      if (dashRes.ok) setData(await dashRes.json());
      if (assetsRes.ok) setAssets(await assetsRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [buildingId]);

  function isOverdue(due: string | null) {
    if (!due) return false;
    return new Date(due) < new Date(new Date().toDateString());
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("nb-NO", { day: "2-digit", month: "short" });
  }

  function urgencyColor(days: number) {
    if (days < 0) return "text-red-600 font-semibold";
    if (days <= 14) return "text-orange-600 font-semibold";
    if (days <= 30) return "text-yellow-600";
    return "text-slate-500";
  }

  return (
    <AppShell>
      <div className="flex flex-1 min-h-0">
        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {/* Page header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white border-b border-slate-200 shrink-0">
            <h1 className="text-base md:text-lg font-bold text-slate-900">Oversikt</h1>
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => setShowWO(true)}
                className="flex items-center gap-1 md:gap-1.5 bg-brand-600 text-white px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Arbeidsordre</span>
                <span className="sm:hidden">Ordre</span>
              </button>
              <Link href="/eiendeler"
                className="hidden sm:flex items-center gap-1.5 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                + Eiendel
              </Link>
              <button
                onClick={() => setShowAI((v) => !v)}
                className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  showAI ? "bg-brand-50 text-brand-700 border border-brand-200" : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                AI
              </button>
            </div>
          </div>

          <div className="flex-1 px-3 md:px-6 py-4 md:py-6 flex flex-col gap-4 md:gap-6">
            {/* KPI cards */}
            {loading ? (
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-5 h-20 md:h-24 animate-pulse" />
                ))}
              </div>
            ) : data && (
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 md:mb-2">Eiendeler</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{data.kpis.total_assets}</p>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1 hidden sm:block">registrerte enheter</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 md:mb-2">Åpne</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{data.kpis.open_work_orders}</p>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1 hidden sm:block">aktive arbeidsordre</p>
                </div>
                <div className={`border rounded-xl md:rounded-2xl p-3 md:p-5 ${data.kpis.overdue_maintenance > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
                  <p className={`text-[10px] md:text-xs font-medium uppercase tracking-wide mb-1 md:mb-2 ${data.kpis.overdue_maintenance > 0 ? "text-red-400" : "text-slate-400"}`}>Forfalt</p>
                  <p className={`text-2xl md:text-3xl font-bold ${data.kpis.overdue_maintenance > 0 ? "text-red-600" : "text-slate-900"}`}>{data.kpis.overdue_maintenance}</p>
                  <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block ${data.kpis.overdue_maintenance > 0 ? "text-red-400" : "text-slate-400"}`}>forfalt vedlikehold</p>
                </div>
              </div>
            )}

            {/* Main two-column area */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              {/* Recent work orders */}
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800 text-sm">Aktive arbeidsordre</h2>
                  <Link href="/arbeidsordre" className="text-xs text-brand-600 hover:text-brand-800 transition-colors font-medium">
                    Se alle →
                  </Link>
                </div>
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : !data || data.recent_work_orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">Ingen aktive arbeidsordre</p>
                    <button onClick={() => setShowWO(true)} className="text-xs text-brand-600 hover:text-brand-800 font-medium mt-1">
                      + Opprett første arbeidsordre
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.recent_work_orders.map((wo) => (
                      <Link key={wo.id} href={`/arbeidsordre?id=${wo.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                        <PriorityBadge priority={wo.priority} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                            {wo.title}
                          </p>
                          {wo.assets && (
                            <p className="text-xs text-slate-400 truncate">{wo.assets.name}</p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {wo.due_date && (
                            <span className={`text-xs ${isOverdue(wo.due_date) ? "text-red-600 font-semibold" : "text-slate-400"}`}>
                              {isOverdue(wo.due_date) ? "Forfalt" : formatDate(wo.due_date)}
                            </span>
                          )}
                          <StatusBadge status={wo.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming maintenance */}
              <div className="bg-white border border-slate-200 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800 text-sm">Kommende vedlikehold</h2>
                  <Link href="/eiendeler" className="text-xs text-brand-600 hover:text-brand-800 transition-colors font-medium">
                    Alle eiendeler →
                  </Link>
                </div>
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[0, 1, 2].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : !data || data.upcoming_maintenance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Ingen planlagt vedlikehold</p>
                    <Link href="/eiendeler" className="text-xs text-brand-600 hover:text-brand-800 font-medium mt-1">
                      + Legg til eiendeler
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.upcoming_maintenance.map((item) => (
                      <Link key={item.id} href={`/eiendeler?id=${item.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">{item.category.replace("_", " ")}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-xs ${urgencyColor(item.days_until_due)}`}>
                            {item.days_until_due < 0
                              ? `${Math.abs(item.days_until_due)} dager over`
                              : item.days_until_due === 0
                              ? "I dag"
                              : `${item.days_until_due} dager`}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(item.next_maintenance_date).toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI panel */}
        {showAI && buildingId && (
          <AiPanel buildingId={buildingId} onClose={() => setShowAI(false)} />
        )}
      </div>

      {/* Create work order modal */}
      {showWO && buildingId && (
        <CreateWOModal
          assets={assets}
          buildingId={buildingId}
          onClose={() => setShowWO(false)}
          onCreated={load}
        />
      )}
    </AppShell>
  );
}
