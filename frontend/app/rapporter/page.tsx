"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch, apiErrorMessage } from "@/utils/api";
import { useBuilding } from "@/utils/building-context";

interface Asset {
  id: string;
  name: string;
  category: string;
}

interface InspectionReport {
  id: string;
  asset_id: string | null;
  report_type: string;
  performed_by: string;
  report_date: string;
  condition_score: number;
  observed_issues: string | null;
  actions_taken: string | null;
  recommended_actions: string | null;
  next_inspection_date: string | null;
  created_at: string;
  assets: { name: string; category: string } | null;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  annual_inspection: "Årsinspeksjon",
  service: "Service",
  incident: "Hendelse",
  routine_check: "Rutinekontroll",
};

const REPORT_TYPES = [
  { value: "service", label: "Service" },
  { value: "annual_inspection", label: "Årsinspeksjon" },
  { value: "routine_check", label: "Rutinekontroll" },
  { value: "incident", label: "Hendelse" },
];

function scoreColor(score: number) {
  if (score >= 5) return "bg-green-100 text-green-700";
  if (score === 4) return "bg-emerald-100 text-emerald-700";
  if (score === 3) return "bg-yellow-100 text-yellow-700";
  if (score === 2) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

function scoreLabel(score: number) {
  if (score >= 5) return "Utmerket";
  if (score === 4) return "God";
  if (score === 3) return "Akseptabel";
  if (score === 2) return "Dårlig";
  return "Kritisk";
}

function ConditionDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i <= score
              ? score >= 4 ? "bg-green-500" : score === 3 ? "bg-yellow-500" : "bg-red-500"
              : "bg-slate-200"
          }`}
        />
      ))}
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

function ConditionSparkline({ trend }: { trend: TrendPoint[] }) {
  if (trend.length < 2) return null;
  const sorted = [...trend].reverse();
  const W = 180;
  const H = 48;
  const PAD = 6;
  const xStep = (W - PAD * 2) / (sorted.length - 1);

  function yOf(score: number) {
    return H - PAD - ((score - 1) / 4) * (H - PAD * 2);
  }

  const pts = sorted.map((p, i) => ({ x: PAD + i * xStep, y: yOf(p.condition_score), score: p.condition_score }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  function dotColor(s: number) {
    return s >= 4 ? "#22c55e" : s === 3 ? "#f59e0b" : "#ef4444";
  }

  return (
    <svg width={W} height={H} className="w-full">
      <path d={pathD} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={dotColor(p.score)} />
      ))}
    </svg>
  );
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

function AssetHealthPanel({
  asset,
  buildingId,
  onClose,
  onCreateReport,
}: {
  asset: Asset;
  buildingId: string;
  onClose: () => void;
  onCreateReport: (assetId: string) => void;
}) {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [trendRes, analysisRes] = await Promise.all([
          apiFetch(`/assets/${asset.id}/condition-trend?building_id=${buildingId}`),
          apiFetch(`/assets/${asset.id}/pattern-analysis?building_id=${buildingId}`),
        ]);
        if (trendRes.ok) {
          const d = await trendRes.json();
          setTrend(d.trend || []);
        }
        if (analysisRes.ok) {
          setAnalysis(await analysisRes.json());
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [asset.id, buildingId]);

  const severityStyle = (sev: string) => {
    if (sev === "critical") return "bg-red-50 border-red-200 text-red-700";
    if (sev === "warning") return "bg-amber-50 border-amber-200 text-amber-700";
    return "bg-blue-50 border-blue-200 text-blue-700";
  };

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
                  <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${severityStyle(p.severity)}`}>
                    {p.message}
                  </div>
                ))}
              </div>
            )}

            {analysis && analysis.patterns.length === 0 && analysis.report_count > 0 && (
              <div className="text-xs px-3 py-2 rounded-lg border bg-green-50 border-green-200 text-green-700">
                Ingen bekymringsfulle mønstre oppdaget
              </div>
            )}

            {trend.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Siste {Math.min(trend.length, 4)} rapporter</p>
                <div className="flex flex-col gap-1.5">
                  {trend.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-600 py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-slate-400">{new Date(r.report_date).toLocaleDateString("nb-NO")}</span>
                      <span className="text-slate-500">{REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}</span>
                      <ConditionDots score={r.condition_score} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis?.report_count === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Ingen inspeksjonsrapporter ennå</p>
            )}

            <button
              onClick={() => { onClose(); onCreateReport(asset.id); }}
              className="w-full bg-brand-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              + Ny rapport for dette utstyret
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CreateReportModal({
  buildingId,
  assets,
  preselectedAssetId,
  onClose,
  onSaved,
}: {
  buildingId: string;
  assets: Asset[];
  preselectedAssetId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [assetId, setAssetId] = useState(preselectedAssetId ?? "");
  const [reportType, setReportType] = useState("service");
  const [performedBy, setPerformedBy] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [conditionScore, setConditionScore] = useState<number>(4);
  const [observedIssues, setObservedIssues] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [recommendedActions, setRecommendedActions] = useState("");
  const [nextInspectionDate, setNextInspectionDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAiAssist() {
    if (!assetId) { setError("Velg et utstyr for å bruke AI-forslag."); return; }
    setError(null);
    setGenerating(true);
    try {
      const res = await apiFetch("/reports/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ building_id: buildingId, asset_id: assetId }),
      });
      if (!res.ok) throw new Error(await apiErrorMessage(res));
      const data = await res.json();
      const s = data.suggested;
      if (s.observed_issues) setObservedIssues(s.observed_issues);
      if (s.actions_taken) setActionsTaken(s.actions_taken);
      if (s.recommended_actions) setRecommendedActions(s.recommended_actions);
      if (s.condition_score) setConditionScore(s.condition_score);
      if (s.next_inspection_date) setNextInspectionDate(s.next_inspection_date);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "AI-forslag feilet.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        building_id: buildingId,
        report_type: reportType,
        performed_by: performedBy,
        report_date: reportDate,
        condition_score: conditionScore,
        observed_issues: observedIssues || null,
        actions_taken: actionsTaken || null,
        recommended_actions: recommendedActions || null,
        next_inspection_date: nextInspectionDate || null,
      };
      if (assetId) body.asset_id = assetId;
      const res = await apiFetch("/inspection-reports", {
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
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Ny inspeksjonsrapport</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Utstyr</label>
              <select value={assetId} onChange={(e) => setAssetId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option value="">Ikke tilknyttet</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rapporttype</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                {REPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Utført av *</label>
              <input required value={performedBy} onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Navn på tekniker" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dato</label>
              <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Tilstandsscore *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setConditionScore(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                    conditionScore === s
                      ? s >= 4 ? "bg-green-500 text-white border-green-500"
                        : s === 3 ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-red-500 text-white border-red-500"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {conditionScore >= 5 ? "5 — Utmerket" : conditionScore === 4 ? "4 — God" : conditionScore === 3 ? "3 — Akseptabel" : conditionScore === 2 ? "2 — Dårlig" : "1 — Kritisk"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAiAssist}
            disabled={generating}
            className="flex items-center justify-center gap-2 border border-brand-300 text-brand-700 rounded-lg py-2 text-sm font-medium hover:bg-brand-50 transition-colors disabled:opacity-60"
          >
            {generating ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Genererer AI-forslag…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Fyll ut med AI-forslag
              </>
            )}
          </button>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observerte problemer</label>
            <textarea value={observedIssues} onChange={(e) => setObservedIssues(e.target.value)} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Beskriv observerte feil eller avvik…" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Utførte tiltak</label>
            <textarea value={actionsTaken} onChange={(e) => setActionsTaken(e.target.value)} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Hva ble gjort under dette besøket…" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Anbefalte tiltak</label>
            <textarea value={recommendedActions} onChange={(e) => setRecommendedActions(e.target.value)} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              placeholder="Hva bør gjøres fremover…" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Neste inspeksjonsdato</label>
            <input type="date" value={nextInspectionDate} onChange={(e) => setNextInspectionDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
              {saving ? "Lagrer…" : "Lagre rapport"}
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

function ReportDetailModal({ report, onClose }: { report: InspectionReport; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{new Date(report.report_date).toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" })}</p>
            <h2 className="font-semibold text-slate-900 mt-0.5">
              {REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}
              {report.assets && <span className="text-slate-400 font-normal"> — {report.assets.name}</span>}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${scoreColor(report.condition_score)}`}>
            <span className="text-lg font-bold">{report.condition_score}</span>
            <span className="font-normal text-xs">/ 5 — {scoreLabel(report.condition_score)}</span>
          </div>
          <p className="text-sm text-slate-500">av {report.performed_by}</p>
        </div>

        {report.observed_issues && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Observerte problemer</p>
            <p className="text-sm text-slate-700 leading-relaxed">{report.observed_issues}</p>
          </div>
        )}

        {report.actions_taken && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Utførte tiltak</p>
            <p className="text-sm text-slate-700 leading-relaxed">{report.actions_taken}</p>
          </div>
        )}

        {report.recommended_actions && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-600 mb-1">Anbefalte tiltak</p>
            <p className="text-sm text-amber-800 leading-relaxed">{report.recommended_actions}</p>
          </div>
        )}

        {report.next_inspection_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Neste inspeksjon: {new Date(report.next_inspection_date).toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Rapporter() {
  const { buildingId } = useBuilding();
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [assetFilter, setAssetFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [preselectedAsset, setPreselectedAsset] = useState<string | undefined>();
  const [viewReport, setViewReport] = useState<InspectionReport | null>(null);
  const [healthAsset, setHealthAsset] = useState<Asset | null>(null);

  async function load() {
    if (!buildingId) return;
    setLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([
        apiFetch(`/inspection-reports?building_id=${buildingId}&limit=100`),
        apiFetch(`/assets?building_id=${buildingId}`),
      ]);
      if (rRes.ok) setReports(await rRes.json());
      if (aRes.ok) setAssets(await aRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [buildingId]);

  function openCreateForAsset(assetId: string) {
    setPreselectedAsset(assetId);
    setShowCreate(true);
  }

  const filtered = assetFilter ? reports.filter((r) => r.asset_id === assetFilter) : reports;

  return (
    <AppShell>
      <div className="flex flex-col flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-lg font-bold text-slate-900">Inspeksjonsrapporter</h1>
          <button
            onClick={() => { setPreselectedAsset(undefined); setShowCreate(true); }}
            className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ny rapport
          </button>
        </div>

        {/* Asset health pills */}
        {assets.length > 0 && (
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => setAssetFilter("")}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${!assetFilter ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Alle
            </button>
            {assets.map((a) => (
              <button
                key={a.id}
                onClick={() => setAssetFilter(assetFilter === a.id ? "" : a.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${assetFilter === a.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}

        {/* Asset health cards */}
        {!assetFilter && assets.length > 0 && (
          <div className="px-6 py-4 border-b border-slate-100 shrink-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Utstyrshelsetatus</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {assets.slice(0, 8).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setHealthAsset(a)}
                  className="flex-shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-3 text-left hover:border-brand-300 hover:shadow-sm transition-all min-w-[140px]"
                >
                  <p className="text-xs font-semibold text-slate-700 truncate">{a.name}</p>
                  <p className="text-xs text-brand-500 mt-1">Vis helse →</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reports list */}
        <div className="flex-1 px-6 py-6">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl h-16 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">{assetFilter ? "Ingen rapporter for dette utstyret" : "Ingen rapporter registrert ennå"}</p>
              <button
                onClick={() => { setPreselectedAsset(assetFilter || undefined); setShowCreate(true); }}
                className="text-sm text-brand-600 hover:text-brand-800 font-medium"
              >
                + Opprett første rapport
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setViewReport(report)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all text-left w-full"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${scoreColor(report.condition_score)}`}>
                    {report.condition_score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}
                      </p>
                      {report.assets && (
                        <span className="text-xs text-slate-400 truncate">— {report.assets.name}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">av {report.performed_by}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-slate-500">
                      {new Date(report.report_date).toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    {report.recommended_actions && (
                      <span className="text-xs text-amber-600 font-medium">Tiltak anbefalt</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && buildingId && (
        <CreateReportModal
          buildingId={buildingId}
          assets={assets}
          preselectedAssetId={preselectedAsset}
          onClose={() => { setShowCreate(false); setPreselectedAsset(undefined); }}
          onSaved={load}
        />
      )}

      {viewReport && (
        <ReportDetailModal report={viewReport} onClose={() => setViewReport(null)} />
      )}

      {healthAsset && buildingId && (
        <AssetHealthPanel
          asset={healthAsset}
          buildingId={buildingId}
          onClose={() => setHealthAsset(null)}
          onCreateReport={openCreateForAsset}
        />
      )}
    </AppShell>
  );
}
