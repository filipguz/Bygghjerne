'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Building2, FileText, Sun, Volume2, Droplets, Eye,
  Upload, Send, Loader2, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import ProsjekterShell from '@/components/ProsjekterShell'
import ProjectStatusBadge from '@/components/ProjectStatusBadge'
import ScoreCard from '@/components/ScoreCard'
import RadarChart from '@/components/RadarChart'
import FinancialCalculator from '@/components/FinancialCalculator'
import { Project } from '@/types/projects'
import { apiFetch } from '@/utils/api'

const ThreeViewer = dynamic(() => import('@/components/ThreeViewer'), { ssr: false })

const ANALYSIS_ICONS: Record<string, React.ReactNode> = {
  sol:           <Sun size={14} />,
  støy:          <Volume2 size={14} />,
  flom:          <Droplets size={14} />,
  fjernvirkning: <Eye size={14} />,
}

const ZONING_STEPS = ['Reguleringsplan', 'Offentlig ettersyn', 'Sluttbehandling', 'Vedtatt']

interface ChatMsg { role: 'user' | 'assistant'; content: string }

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

  // Upload state
  const [uploading, setUploading]     = useState(false)
  const [uploadMsg, setUploadMsg]     = useState('')
  const fileRef                       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/backend/projects/${id}`)
      .then((r) => r.json())
      .then((data) => { setProject(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendChat() {
    if (!input.trim() || chatLoading || !project) return
    const userMsg = input.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: userMsg }])
    setChatLoading(true)
    try {
      const res = await apiFetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, project_id: project.id }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.response ?? data.message ?? 'Ingen svar.' }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Noe gikk galt. Prøv igjen.' }])
    } finally {
      setChatLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !project) return
    setUploading(true)
    setUploadMsg('')
    const form = new FormData()
    form.append('file', file)
    form.append('project_id', project.id)
    try {
      const res = await apiFetch('/upload', { method: 'POST', body: form })
      if (res.ok) {
        setUploadMsg('Dokument lastet opp.')
        const updated = await fetch(`/api/backend/projects/${id}`).then((r) => r.json())
        setProject(updated)
      } else {
        setUploadMsg('Opplasting feilet.')
      }
    } catch {
      setUploadMsg('Opplasting feilet.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
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
          <Link href="/" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">← Tilbake til oversikt</Link>
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
    { id: 'dokumenter', label: 'Dokumenter' },
  ] as const

  return (
    <ProsjekterShell>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-none px-8 pt-6 pb-4 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 mb-3 transition-colors">
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
          <div className="flex gap-0.5 mt-4">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  activeTab === id
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
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-2">
                        Beskrivelse
                      </h3>
                      <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{project.description}</p>
                    </div>
                  )}

                  {/* Zoning progress */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-3">
                      Reguleringsstatus
                    </h3>
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
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-2">
                        Investering
                      </h3>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {project.investment_mnok.toLocaleString('no', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MNOK
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        {project.bra_m2
                          ? `≈ ${Math.round((project.investment_mnok * 1_000_000) / project.bra_m2).toLocaleString('no')} kr / m²`
                          : ''}
                      </p>
                    </div>
                  )}

                  {/* Financial calculator toggle */}
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
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-4">
                        Radarkart
                      </h3>
                      <RadarChart projects={[project]} />
                    </div>
                  )}
                </div>
              )}

              {/* 3D */}
              {activeTab === '3d' && (
                <div className="h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700">
                  <ThreeViewer project={project} />
                </div>
              )}

              {/* CHAT */}
              {activeTab === 'chat' && (
                <div className="max-w-2xl flex flex-col h-[520px]">
                  <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                    {messages.length === 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-gray-600 pt-2">
                        <Building2 size={16} />
                        <span>Still spørsmål om {project.name}. Last opp dokumenter for bedre svar.</span>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200'
                        }`}>
                          {m.content}
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5">
                          <Loader2 size={14} className="text-slate-400 dark:text-gray-600 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="flex-none flex gap-2 pt-3 border-t border-slate-200 dark:border-gray-800">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChat()}
                      placeholder="Spør om prosjektet…"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <button
                      onClick={sendChat}
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
                <div className="max-w-2xl space-y-4">
                  {/* Upload */}
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-gray-700 p-6 text-center">
                    <Upload size={24} className="mx-auto mb-2 text-slate-400 dark:text-gray-600" />
                    <p className="text-sm text-slate-600 dark:text-gray-400 mb-3">Last opp PDF-dokumenter for dette prosjektet</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium flex items-center gap-2 mx-auto transition-colors"
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploading ? 'Laster opp…' : 'Velg fil'}
                    </button>
                    {uploadMsg && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">{uploadMsg}</p>
                    )}
                  </div>

                  {/* Document list */}
                  {(project.documents?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {project.documents!.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
                          <FileText size={16} className="flex-none text-slate-400 dark:text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-gray-200 truncate">{doc.filename}</p>
                            <p className="text-xs text-slate-400 dark:text-gray-600">
                              {new Date(doc.created_at).toLocaleDateString('no')}
                              {doc.chunks ? ` · ${doc.chunks} chunks` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-gray-600">Ingen dokumenter lastet opp ennå.</p>
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
