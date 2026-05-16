'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, FileText, Sun, Volume2, Droplets, Eye,
  Upload, Send, Loader2, ChevronDown, ChevronUp, Settings2, Check,
  Trash2, Bot,
} from 'lucide-react'
import ProsjekterShell from '@/components/ProsjekterShell'
import ProjectStatusBadge from '@/components/ProjectStatusBadge'
import ScoreCard from '@/components/ScoreCard'
import RadarChart from '@/components/RadarChart'
import FinancialCalculator from '@/components/FinancialCalculator'
import { Project } from '@/types/projects'
import { apiFetch } from '@/utils/api'
import { MOCK_PROJECTS } from '@/utils/mock-projects'

const ThreeViewer = dynamic(() => import('@/components/ThreeViewer'), { ssr: false })
const PixelStreamingViewer = dynamic(() => import('@/components/PixelStreamingViewer'), { ssr: false })

const ANALYSIS_ICONS: Record<string, React.ReactNode> = {
  sol:           <Sun size={14} />,
  støy:          <Volume2 size={14} />,
  flom:          <Droplets size={14} />,
  fjernvirkning: <Eye size={14} />,
}

const ZONING_STEPS = ['Reguleringsplan', 'Offentlig ettersyn', 'Sluttbehandling', 'Vedtatt']

const QUICK_PROMPTS = [
  'Hva sier dokumentene om reguleringsplanen?',
  'Hva er de viktigste risikoene i dette prosjektet?',
  'Oppsummer prosjektets status og fremdrift.',
  'Hva er planlagt ferdigstillelse og nøkkeltall?',
]

interface ChatSource {
  filename: string
  document_id: string
  excerpt: string
  similarity: number
}

interface ActionTaken {
  type: string
  new_status?: string
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  tools_used?: string[]
  actions_taken?: ActionTaken[]
}

interface DocItem {
  id: string
  filename: string
  created_at: string | null
  chunks: number
}

export default function ProjectDetailPage() {
  const { id }                        = useParams<{ id: string }>()
  const [project, setProject]         = useState<Project | null>(null)
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState<'oversikt' | 'analyse' | '3d' | 'chat' | 'dokumenter'>('oversikt')
  const [showCalc, setShowCalc]       = useState(false)

  // Chat state
  const [messages, setMessages]       = useState<ChatMsg[]>([])
  const [input, setInput]             = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef                    = useRef<HTMLDivElement>(null)

  // Document state
  const [docs, setDocs]               = useState<DocItem[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [uploadMsg, setUploadMsg]     = useState<{ text: string; ok: boolean } | null>(null)
  const [dragging, setDragging]       = useState(false)
  const [deleting, setDeleting]       = useState<string | null>(null)
  const fileRef                       = useRef<HTMLInputElement>(null)

  // Unreal config state
  const [showUnrealConfig, setShowUnrealConfig] = useState(false)
  const [unrealModelId, setUnrealModelId]       = useState('')
  const [bimFileUrl, setBimFileUrl]             = useState('')
  const [savingConfig, setSavingConfig]         = useState(false)
  const [configSaved, setConfigSaved]           = useState(false)
  const [streamUrlInput, setStreamUrlInput]     = useState('https://connector.eagle3dstreaming.com/v5/demo/E3DSFeaturesTemplate/E3DS-Iframe-Demo')
  const [savingStream, setSavingStream]         = useState(false)

  useEffect(() => {
    apiFetch(`/projects/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => {
        setProject(data)
        setLoading(false)
        setUnrealModelId(data.unreal_model_id ?? '')
        setBimFileUrl(data.bim_file_url ?? '')
      })
      .catch(() => {
        const mock = MOCK_PROJECTS.find((p) => p.id === id) ?? null
        setProject(mock)
        setLoading(false)
      })
  }, [id])

  const fetchDocs = useCallback(async () => {
    setDocsLoading(true)
    try {
      const res = await apiFetch(`/documents?project_id=${id}`)
      if (res.ok) setDocs(await res.json())
    } catch {}
    finally { setDocsLoading(false) }
  }, [id])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for stream URL changes when on 3D tab
  useEffect(() => {
    if (activeTab !== '3d') return
    const interval = setInterval(async () => {
      try {
        const data = await apiFetch(`/projects/${id}`).then((r) => r.json())
        setProject((prev) => {
          if (!prev) return prev
          if (prev.unreal_stream_url !== data.unreal_stream_url) return { ...prev, unreal_stream_url: data.unreal_stream_url }
          return prev
        })
      } catch { /* ignore */ }
    }, 10_000)
    return () => clearInterval(interval)
  }, [activeTab, id])

  async function saveUnrealConfig() {
    if (!project) return
    setSavingConfig(true)
    try {
      await apiFetch(`/projects/${project.id}/unreal/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unreal_model_id: unrealModelId || null, bim_file_url: bimFileUrl || null }),
      })
      setProject((p) => p ? { ...p, unreal_model_id: unrealModelId || null, bim_file_url: bimFileUrl || null } : p)
      setConfigSaved(true)
      setTimeout(() => setConfigSaved(false), 2000)
    } finally {
      setSavingConfig(false)
    }
  }

  async function setStreamStatus(status: 'ready' | 'offline') {
    if (!project) return
    setSavingStream(true)
    try {
      const body: Record<string, string> = { status }
      if (status === 'ready') body.stream_url = streamUrlInput.trim()
      const res = await apiFetch(`/projects/${project.id}/unreal/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const newUrl = status === 'ready' ? streamUrlInput.trim() : null
        setProject((p) => p ? { ...p, unreal_stream_url: newUrl } : p)
      }
    } finally {
      setSavingStream(false)
    }
  }

  async function sendChat(question?: string) {
    const q = (question ?? input).trim()
    if (!q || chatLoading || !project) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: q }])
    setChatLoading(true)
    try {
      const res = await apiFetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, project_id: project.id, mode: 'enhanced' }),
      })
      const data = await res.json()
      setMessages((m) => [...m, {
        role: 'assistant',
        content: data.answer ?? data.response ?? data.message ?? 'Ingen svar.',
        sources: data.sources ?? [],
        tools_used: data.tools_used ?? [],
        actions_taken: data.actions_taken ?? [],
      }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Noe gikk galt. Prøv igjen.' }])
    } finally {
      setChatLoading(false)
    }
  }

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadMsg({ text: 'Kun PDF-filer støttes.', ok: false })
      return
    }
    setUploading(true)
    setUploadMsg(null)
    const form = new FormData()
    form.append('file', file)
    form.append('project_id', id)
    try {
      const res = await apiFetch('/upload', { method: 'POST', body: form })
      if (res.ok) {
        setUploadMsg({ text: 'Dokument lastet opp og indeksert.', ok: true })
        await fetchDocs()
      } else {
        setUploadMsg({ text: 'Opplasting feilet.', ok: false })
      }
    } catch {
      setUploadMsg({ text: 'Opplasting feilet.', ok: false })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(docId: string) {
    setDeleting(docId)
    try {
      await apiFetch(`/documents/${docId}?project_id=${id}`, { method: 'DELETE' })
      setDocs((prev) => prev.filter((d) => d.id !== docId))
    } catch {}
    finally { setDeleting(null) }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  if (loading) {
    return (
      <ProsjekterShell>
        <div className="flex items-center justify-center h-full text-slate-400 dark:text-gray-600 text-sm">
          Laster prosjekt…
        </div>
      </ProsjekterShell>
    )
  }

  if (!project) {
    return (
      <ProsjekterShell>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <p className="text-slate-500 dark:text-gray-500 text-sm">Prosjekt ikke funnet.</p>
          <Link href="/prosjekter" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">← Tilbake til oversikt</Link>
        </div>
      </ProsjekterShell>
    )
  }

  const analysisEntries = project.analysis
    ? (Object.entries(project.analysis) as Array<[string, { score: number; label: string; description: string }]>)
    : []

  const zoningIdx = ZONING_STEPS.findIndex((s) =>
    project.zoning_status?.toLowerCase().includes(s.toLowerCase())
  )
  const activeZoning = zoningIdx >= 0 ? zoningIdx : 0

  const TABS = [
    { id: 'oversikt',   label: 'Oversikt' },
    { id: 'analyse',    label: 'Analyse' },
    { id: '3d',         label: '3D-modell' },
    { id: 'chat',       label: 'Spør AI' },
    { id: 'dokumenter', label: `Dokumenter${docs.length > 0 ? ` (${docs.length})` : ''}` },
  ] as const

  return (
    <ProsjekterShell>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-none px-8 pt-6 pb-4 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Link href="/prosjekter" className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 mb-3 transition-colors">
            <ArrowLeft size={13} />
            Prosjektoversikt
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
              <p className="text-sm text-slate-500 dark:text-gray-500 mt-0.5">{project.address ?? project.location}</p>
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>

          {/* BIM stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[
              { label: 'BRA',       value: `${(project.bra_m2 ?? 0).toLocaleString('no')} m²` },
              { label: 'Enheter',   value: project.units ?? '—' },
              { label: 'Etasjer',   value: project.floors ?? '—' },
              { label: 'Ferdigår',  value: project.completion_year ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">{String(value)}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 mt-4 flex-wrap">
            {TABS.map(({ id: tabId, label }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  activeTab === tabId
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              className="p-8"
            >

              {/* OVERSIKT */}
              {activeTab === 'oversikt' && (
                <div className="max-w-3xl space-y-6">
                  {project.description && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-2">Beskrivelse</h3>
                      <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{project.description}</p>
                    </div>
                  )}

                  {/* Zoning progress */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-3">Reguleringsstatus</h3>
                    <div className="flex items-center gap-0">
                      {ZONING_STEPS.map((step, i) => (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                              i <= activeZoning
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 dark:border-gray-700 text-slate-400 dark:text-gray-600'
                            }`}>
                              {i < activeZoning ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] whitespace-nowrap ${
                              i <= activeZoning ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-gray-600'
                            }`}>{step}</span>
                          </div>
                          {i < ZONING_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 mx-1 ${
                              i < activeZoning ? 'bg-blue-600' : 'bg-slate-200 dark:bg-gray-800'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    {project.zoning_code && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                        Reguleringsplan: <span className="font-mono">{project.zoning_code}</span>
                      </p>
                    )}
                  </div>

                  {/* Investment summary */}
                  {project.investment_mnok && (
                    <div className="rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 p-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-2">Investering</h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {project.investment_mnok.toLocaleString('no', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MNOK
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        {project.bra_m2 ? `≈ ${Math.round((project.investment_mnok * 1_000_000) / project.bra_m2).toLocaleString('no')} kr / m²` : ''}
                      </p>
                    </div>
                  )}

                  {/* Financial calculator */}
                  <div>
                    <button
                      onClick={() => setShowCalc((v) => !v)}
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {showCalc ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      Finansiell kalkulator
                    </button>
                    <AnimatePresence>
                      {showCalc && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden mt-3"
                        >
                          <FinancialCalculator project={project} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Unreal / 3D config */}
                  <div>
                    <button
                      onClick={() => setShowUnrealConfig((v) => !v)}
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                    >
                      {showUnrealConfig ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      <Settings2 size={14} />
                      3D-konfigurasjon
                    </button>
                    <AnimatePresence>
                      {showUnrealConfig && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 p-4 space-y-4">

                            {/* Pixel Streaming */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">Pixel Streaming URL</label>
                                {project.unreal_stream_url && (
                                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Aktiv
                                  </span>
                                )}
                              </div>
                              <input
                                value={streamUrlInput}
                                onChange={(e) => setStreamUrlInput(e.target.value)}
                                placeholder="https://…"
                                disabled={!!project.unreal_stream_url}
                                className="w-full rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex gap-2">
                                {!project.unreal_stream_url ? (
                                  <button
                                    onClick={() => setStreamStatus('ready')}
                                    disabled={savingStream || !streamUrlInput.trim()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
                                  >
                                    {savingStream ? <><Loader2 size={13} className="animate-spin" /> Aktiverer…</> : 'Aktiver stream'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setStreamStatus('offline')}
                                    disabled={savingStream}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 disabled:opacity-40 text-slate-700 dark:text-gray-300 text-sm font-medium transition-colors"
                                  >
                                    {savingStream ? <><Loader2 size={13} className="animate-spin" /> …</> : 'Deaktiver stream'}
                                  </button>
                                )}
                                {project.unreal_stream_url && (
                                  <button
                                    onClick={() => setActiveTab('3d')}
                                    className="px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    Gå til 3D-fanen →
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-gray-700 pt-4 space-y-3">
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-gray-600">Avansert</p>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Unreal modell-ID</label>
                                <input
                                  value={unrealModelId}
                                  onChange={(e) => setUnrealModelId(e.target.value)}
                                  placeholder="f.eks. projekt-oslo-sentrum-v2"
                                  className="w-full rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">BIM-fil URL</label>
                                <input
                                  value={bimFileUrl}
                                  onChange={(e) => setBimFileUrl(e.target.value)}
                                  placeholder="https://…"
                                  className="w-full rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40"
                                />
                              </div>
                              <button
                                onClick={saveUnrealConfig}
                                disabled={savingConfig}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-medium transition-colors"
                              >
                                {configSaved ? <><Check size={14} /> Lagret</> : savingConfig ? <><Loader2 size={14} className="animate-spin" /> Lagrer…</> : 'Lagre konfig'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ANALYSE */}
              {activeTab === 'analyse' && (
                <div className="max-w-3xl">
                  {analysisEntries.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-gray-600">Ingen analysedata tilgjengelig.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      {analysisEntries.map(([key, item], i) => (
                        <ScoreCard
                          key={key}
                          label={item.label || key}
                          description={item.description}
                          icon={ANALYSIS_ICONS[key]}
                          score={item.score}
                          delay={i * 0.08}
                        />
                      ))}
                    </div>
                  )}
                  {analysisEntries.length > 0 && (
                    <div className="mt-6 h-72">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-4">Radarkart</h3>
                      <RadarChart projects={[project]} />
                    </div>
                  )}
                </div>
              )}

              {/* 3D */}
              {activeTab === '3d' && (
                <div className="h-[560px] rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden">
                  {project.unreal_stream_url ? (
                    <PixelStreamingViewer
                      streamUrl={project.unreal_stream_url}
                      project={project}
                      fallback={<ThreeViewer project={project} />}
                    />
                  ) : (
                    <ThreeViewer project={project} />
                  )}
                </div>
              )}

              {/* CHAT */}
              {activeTab === 'chat' && (
                <div className="max-w-2xl flex flex-col h-[560px]">

                  {/* Quick prompts */}
                  {messages.length === 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-500 mb-3">
                        <Bot size={16} className="text-blue-500" />
                        <span>Still spørsmål om <span className="font-medium text-slate-700 dark:text-gray-300">{project.name}</span></span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {QUICK_PROMPTS.map((p) => (
                          <button
                            key={p}
                            onClick={() => sendChat(p)}
                            className="text-left text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      {docs.length === 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          Last opp dokumenter i "Dokumenter"-fanen for bedre svar.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          m.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200'
                        }`}>
                          {m.content}
                        </div>

                        {/* Actions taken */}
                        {m.role === 'assistant' && m.actions_taken && m.actions_taken.length > 0 && (
                          <div className="mt-2 max-w-[85%] space-y-1">
                            {m.actions_taken.map((a, ai) => (
                              <div key={ai} className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5">
                                <Check size={11} className="flex-none" />
                                {a.type === 'status_updated' && <span>Status oppdatert til <strong>{a.new_status}</strong></span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tools used */}
                        {m.role === 'assistant' && m.tools_used && m.tools_used.length > 0 && (
                          <div className="mt-1.5 max-w-[85%] flex flex-wrap gap-1">
                            {m.tools_used.map((t, ti) => (
                              <span key={ti} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 border border-slate-200 dark:border-gray-700">
                                {t.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Sources */}
                        {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                          <div className="mt-2 max-w-[85%] space-y-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 px-1">Kilder</p>
                            {m.sources.map((s, si) => (
                              <div key={si} className="rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <FileText size={11} className="text-blue-500 flex-none" />
                                  <span className="text-xs font-medium text-slate-700 dark:text-gray-300 truncate">{s.filename}</span>
                                  <span className="ml-auto text-[10px] text-slate-400 dark:text-gray-600 shrink-0">{Math.round(s.similarity * 100)}%</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed line-clamp-2">{s.excerpt}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                          <Loader2 size={14} className="text-slate-400 dark:text-gray-600 animate-spin" />
                          <span className="text-xs text-slate-400 dark:text-gray-600">Tenker…</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex-none flex gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                      placeholder="Spør om prosjektet…"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <button
                      onClick={() => sendChat()}
                      disabled={!input.trim() || chatLoading}
                      className="flex-none w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* DOKUMENTER */}
              {activeTab === 'dokumenter' && (
                <div className="max-w-2xl space-y-5">

                  {/* Upload area */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-3">Last opp dokument</h3>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                        dragging
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : uploading
                            ? 'border-slate-200 dark:border-gray-700 opacity-60 pointer-events-none'
                            : 'border-slate-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
                      />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={28} className="text-blue-500 animate-spin" />
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Laster opp og indekserer…</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={28} className="text-slate-400 dark:text-gray-600" />
                          <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Dra og slipp PDF her</p>
                          <p className="text-xs text-slate-400 dark:text-gray-600">eller klikk for å velge fil</p>
                        </div>
                      )}
                    </div>

                    {uploadMsg && (
                      <p className={`text-sm mt-2 px-3 py-2 rounded-lg ${
                        uploadMsg.ok
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                          : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}>
                        {uploadMsg.text}
                      </p>
                    )}
                  </div>

                  {/* Document list */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-3">
                      Opplastede dokumenter {docs.length > 0 && `(${docs.length})`}
                    </h3>
                    {docsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-gray-600">
                        <Loader2 size={14} className="animate-spin" /> Laster…
                      </div>
                    ) : docs.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 dark:border-gray-800 p-6 text-center">
                        <FileText size={20} className="mx-auto mb-2 text-slate-300 dark:text-gray-700" />
                        <p className="text-sm text-slate-400 dark:text-gray-600">Ingen dokumenter lastet opp ennå.</p>
                        <p className="text-xs text-slate-400 dark:text-gray-700 mt-1">Last opp reguleringsplaner, rapporter og analyser for AI-søk.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {docs.map((doc) => (
                          <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 group">
                            <FileText size={16} className="flex-none text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 dark:text-gray-200 truncate">{doc.filename}</p>
                              <p className="text-xs text-slate-400 dark:text-gray-600">
                                {doc.chunks} chunks
                                {doc.created_at ? ` · ${new Date(doc.created_at).toLocaleDateString('no')}` : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={deleting === doc.id}
                              className="flex-none p-1.5 rounded-lg text-slate-300 dark:text-gray-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40"
                              title="Slett dokument"
                            >
                              {deleting === doc.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} />
                              }
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {docs.length > 0 && (
                    <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex items-start gap-3">
                      <Bot size={16} className="text-blue-500 flex-none mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        {docs.length} dokument{docs.length > 1 ? 'er' : ''} er indeksert og klart for AI-søk.
                        Gå til <button onClick={() => setActiveTab('chat')} className="font-semibold underline">Spør AI</button>-fanen for å stille spørsmål.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ProsjekterShell>
  )
}
