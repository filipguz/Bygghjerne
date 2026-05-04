"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import DocumentUpload from "@/components/DocumentUpload";
import SourceCard from "@/components/SourceCard";
import { apiFetch, apiErrorMessage } from "@/utils/api";
import { useBuilding } from "@/utils/building-context";

interface Source {
  filename: string;
  document_id: string;
  excerpt: string;
  similarity: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  tools_used?: string[];
  actions_taken?: Array<{ type: string; work_order?: { id: string; title: string; priority: string } }>;
  sources?: Source[];
}

const TOOL_LABELS: Record<string, string> = {
  get_building_summary: "Hentet statusoversikt",
  get_open_work_orders: "Hentet arbeidsordre",
  get_overdue_work_orders: "Sjekket forfalne ordrer",
  get_upcoming_maintenance: "Sjekket vedlikeholdsplan",
  get_asset_history: "Hentet eiendelhistorikk",
  get_inspection_history: "Hentet inspeksjonshistorikk",
  get_building_health_overview: "Hentet bygningshelse",
  detect_asset_patterns: "Analyserte mønstre",
  create_work_order: "Opprettet arbeidsordre",
  search_documents: "Søkte i dokumenter",
};

const QUICK_PROMPTS = [
  "Hva bør jeg prioritere i dag?",
  "Vis forfalne arbeidsordre",
  "Hva trenger vedlikehold de neste 30 dagene?",
  "Gi meg en helseoversikt over bygget",
  "Er det noen kritiske problemer?",
];

export default function Assistent() {
  const { buildingId } = useBuilding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "docs">("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(question: string) {
    if (!question.trim() || loading || !buildingId) return;
    setInput("");
    setMobileTab("chat");
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
          sources: data.sources ?? [],
        },
      ]);
    } catch (e: unknown) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : "Noe gikk galt. Prøv igjen." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const chatContent = (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-5 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 py-8">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">Hva kan jeg hjelpe deg med?</p>
              <p className="text-xs text-slate-400 text-center">Tilgang til eiendeler, arbeidsordre, rapporter og dokumenter</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-sm text-slate-700 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors rounded-xl px-4 py-3"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-brand-600 text-white rounded-br-sm"
                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
            }`}>
              {msg.content}
            </div>

            {msg.role === "assistant" && (msg.tools_used?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 max-w-[85%] md:max-w-[75%]">
                {msg.tools_used!.map((t, j) => (
                  <span key={j} className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                    {TOOL_LABELS[t] ?? t}
                  </span>
                ))}
              </div>
            )}

            {msg.role === "assistant" && (msg.actions_taken?.length ?? 0) > 0 && (
              <div className="max-w-[85%] md:max-w-[75%] flex flex-col gap-1">
                {msg.actions_taken!.map((a, j) =>
                  a.type === "work_order_created" && a.work_order ? (
                    <div key={j} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800">
                      ✓ Opprettet: <strong>{a.work_order.title}</strong>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {msg.role === "assistant" && (msg.sources?.length ?? 0) > 0 && (
              <div className="max-w-[85%] md:max-w-[75%] w-full flex flex-col gap-1.5">
                <p className="text-xs text-slate-400 px-1">Dokumentkilder</p>
                {msg.sources!.map((src, j) => (
                  <SourceCard key={j} source={src} />
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-3 md:py-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Spør om bygget…"
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
              disabled:opacity-50 max-h-28 overflow-y-auto"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="shrink-0 bg-brand-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold
              hover:bg-brand-700 disabled:opacity-40 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const docsContent = (
    <div className="flex-1 overflow-y-auto p-5">
      <DocumentUpload />
    </div>
  );

  return (
    <AppShell>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* ── Desktop layout: two columns ───────────────────────── */}
        <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
          <aside className="w-72 shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-sm font-semibold text-slate-800">Dokumenter</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last opp PDF-er for å gi AI tilgang til byggets dokumentasjon</p>
            </div>
            <div className="p-5 flex-1">
              <DocumentUpload />
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
              <div>
                <h1 className="text-lg font-bold text-slate-900">AI-assistent</h1>
                <p className="text-xs text-slate-400 mt-0.5">Spør om arbeidsordre, vedlikehold, eiendeler og dokumenter</p>
              </div>
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Tøm samtale
                </button>
              )}
            </div>
            {chatContent}
          </div>
        </div>

        {/* ── Mobile layout: tabs ───────────────────────────────── */}
        <div className="flex md:hidden flex-col flex-1 min-h-0 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 bg-white shrink-0">
            <button
              onClick={() => setMobileTab("chat")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                mobileTab === "chat"
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              Samtale
            </button>
            <button
              onClick={() => setMobileTab("docs")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                mobileTab === "docs"
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              Dokumenter
            </button>
          </div>

          {mobileTab === "chat" ? chatContent : docsContent}
        </div>

      </div>
    </AppShell>
  );
}
