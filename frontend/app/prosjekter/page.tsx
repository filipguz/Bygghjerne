'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { MapPin, Building2, Layers, TrendingUp, ArrowRight, Calendar, Search, Plus, X, Trash2 } from 'lucide-react'
import ProsjekterShell from '@/components/ProsjekterShell'
import ProjectStatusBadge from '@/components/ProjectStatusBadge'
import InvestmentChart from '@/components/InvestmentChart'
import RadarChart from '@/components/RadarChart'
import ProjectActivityFeed from '@/components/ProjectActivityFeed'
import { Project, ProjectStatus } from '@/types/projects'
import { apiFetch } from '@/utils/api'

const STEPS: ProjectStatus[] = ['mulighetsstudie', 'regulering', 'prosjektering', 'salg']
const STEP_LABELS = ['Mulighetsstudie', 'Regulering', 'Prosjektering', 'Salg']
const STATUS_DOT: Record<ProjectStatus, string> = {
  mulighetsstudie: 'bg-violet-500',
  regulering:      'bg-amber-500',
  prosjektering:   'bg-blue-500',
  salg:            'bg-emerald-500',
}
const STATUS_FILTER_LABELS: Array<{ value: ProjectStatus | 'alle'; label: string }> = [
  { value: 'alle',            label: 'Alle' },
  { value: 'mulighetsstudie', label: 'Mulighetsstudie' },
  { value: 'regulering',      label: 'Regulering' },
  { value: 'prosjektering',   label: 'Prosjektering' },
  { value: 'salg',            label: 'Salg' },
]

const STATUS_OPTIONS: ProjectStatus[] = ['mulighetsstudie', 'regulering', 'prosjektering', 'salg']
const STATUS_LABELS: Record<ProjectStatus, string> = {
  mulighetsstudie: 'Mulighetsstudie',
  regulering:      'Regulering',
  prosjektering:   'Prosjektering',
  salg:            'Salg',
}

interface NewProjectForm {
  name: string
  location: string
  address: string
  status: ProjectStatus
  bra_m2: string
  units: string
  floors: string
  completion_year: string
  investment_mnok: string
  zoning_status: string
  zoning_code: string
  lat: string
  lng: string
  description: string
}

const EMPTY_FORM: NewProjectForm = {
  name: '', location: '', address: '', status: 'mulighetsstudie',
  bra_m2: '', units: '', floors: '', completion_year: '', investment_mnok: '',
  zoning_status: '', zoning_code: '', lat: '', lng: '', description: '',
}

const kpiVariants:  Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const kpiItem:      Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } }
const fadeUp:       Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } }
const cardVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

export default function ProjectsDashboard() {
  const [projects, setProjects]               = useState<Project[]>([])
  const [loading, setLoading]                 = useState(true)
  const [fetchError, setFetchError]           = useState(false)
  const [statusFilter, setStatusFilter]       = useState<ProjectStatus | 'alle'>('alle')
  const [cityFilter, setCityFilter]           = useState('alle')
  const [search, setSearch]                   = useState('')
  const [chartTab, setChartTab]               = useState<'investering' | 'radar'>('investering')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showModal, setShowModal]             = useState(false)
  const [form, setForm]                       = useState<NewProjectForm>(EMPTY_FORM)
  const [saving, setSaving]                   = useState(false)
  const [formError, setFormError]             = useState('')
  const [deletingId, setDeletingId]           = useState<string | null>(null)

  const loadProjects = () => {
    setLoading(true)
    setFetchError(false)
    apiFetch('/projects')
      .then((r) => r.json())
      .then((data: Project[]) => { setProjects(data); setLoading(false) })
      .catch(() => { setFetchError(true); setLoading(false) })
  }

  useEffect(() => { loadProjects() }, [])

  const cities = ['alle', ...Array.from(new Set(projects.map((p) => p.location).filter(Boolean)))]

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'alle' && p.status !== statusFilter) return false
    if (cityFilter !== 'alle' && p.location !== cityFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.location?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalBRA        = projects.reduce((s, p) => s + (p.bra_m2 ?? 0), 0)
  const totalUnits      = projects.reduce((s, p) => s + (p.units ?? 0), 0)
  const totalInvestment = projects.reduce((s, p) => s + (p.investment_mnok ?? 0), 0)

  const kpis = [
    { icon: <Building2 size={18} />, label: 'Prosjekter',  value: projects.length,                                                    suffix: '',      color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: <Layers size={18} />,    label: 'Total BRA',   value: totalBRA.toLocaleString('no'),                                      suffix: ' m²',   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: <MapPin size={18} />,    label: 'Enheter',     value: totalUnits,                                                         suffix: '',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: <TrendingUp size={18} />,label: 'Investering', value: totalInvestment.toLocaleString('no', { maximumFractionDigits: 0 }), suffix: ' MNOK', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Prosjektnavn er påkrevd.'); return }
    setSaving(true); setFormError('')
    try {
      const body: Record<string, unknown> = {
        name:   form.name.trim(),
        status: form.status,
      }
      if (form.location)        body.location        = form.location.trim()
      if (form.address)         body.address         = form.address.trim()
      if (form.bra_m2)          body.bra_m2          = parseInt(form.bra_m2)
      if (form.units)           body.units           = parseInt(form.units)
      if (form.floors)          body.floors          = parseInt(form.floors)
      if (form.completion_year) body.completion_year = parseInt(form.completion_year)
      if (form.investment_mnok) body.investment_mnok = parseFloat(form.investment_mnok)
      if (form.zoning_status)   body.zoning_status   = form.zoning_status.trim()
      if (form.zoning_code)     body.zoning_code     = form.zoning_code.trim()
      if (form.lat)             body.lat             = parseFloat(form.lat)
      if (form.lng)             body.lng             = parseFloat(form.lng)
      if (form.description)     body.description     = form.description.trim()

      const res = await apiFetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setFormError(err.detail ?? 'Noe gikk galt.')
        setSaving(false)
        return
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
      loadProjects()
    } catch {
      setFormError('Noe gikk galt. Prøv igjen.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' })
      setProjects((prev) => prev.filter((p) => p.id !== id))
      if (selectedProject?.id === id) setSelectedProject(null)
    } catch { /* ignore */ }
    setDeletingId(null)
  }

  const field = (label: string, child: React.ReactNode, required = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-gray-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {child}
    </div>
  )

  const inputCls = "px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/40 w-full"

  return (
    <ProsjekterShell>
      <div className="flex h-full overflow-hidden">
        {/* Main column */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div initial="hidden" animate="show" variants={kpiVariants} className="flex items-start justify-between mb-8">
            <div>
              <motion.h1 variants={kpiItem} className="text-2xl font-bold text-slate-900 dark:text-white">
                Prosjektoversikt
              </motion.h1>
              <motion.p variants={kpiItem} className="text-sm text-slate-500 dark:text-gray-500 mt-1">
                {loading ? 'Laster…' : fetchError ? 'Kunne ikke laste prosjekter' : `${projects.length} aktive prosjekter`}
              </motion.p>
            </div>
            <motion.button
              variants={kpiItem}
              onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setFormError('') }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              <Plus size={15} /> Nytt prosjekt
            </motion.button>
          </motion.div>

          {/* KPI row */}
          <motion.div initial="hidden" animate="show" variants={kpiVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map(({ icon, label, value, suffix, color, bg }) => (
              <motion.div key={label} variants={kpiItem} className={`rounded-xl border border-slate-200 dark:border-gray-700 ${bg} p-4`}>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color} mb-3`}>{icon}</div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}{suffix}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Filter bar */}
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk prosjekter…"
                className="pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 w-48"
              />
            </div>
            <div className="flex gap-1">
              {STATUS_FILTER_LABELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {cities.length > 2 && (
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-slate-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {cities.map((c) => <option key={c} value={c}>{c === 'alle' ? 'Alle byer' : c}</option>)}
              </select>
            )}
          </motion.div>

          {/* Project cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-slate-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={statusFilter + cityFilter + search}
                initial="hidden" animate="show" variants={cardVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {projects.length === 0 && !loading ? (
                  <motion.div variants={fadeUp} className="col-span-2 flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400">
                      <Building2 size={26} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">Ingen prosjekter ennå</p>
                      <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">Opprett ditt første prosjekt for å komme i gang.</p>
                    </div>
                    <button
                      onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setFormError('') }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus size={15} /> Nytt prosjekt
                    </button>
                  </motion.div>
                ) : filtered.length === 0 ? (
                  <motion.p variants={fadeUp} className="col-span-2 text-sm text-slate-400 dark:text-gray-600 py-8 text-center">
                    Ingen prosjekter matcher filteret.
                  </motion.p>
                ) : filtered.map((p) => {
                  const stepIdx = STEPS.indexOf(p.status)
                  return (
                    <motion.div
                      key={p.id}
                      variants={fadeUp}
                      onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                      className={`group rounded-xl border bg-white dark:bg-gray-900 cursor-pointer transition-all duration-200 overflow-hidden ${
                        selectedProject?.id === p.id
                          ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/20'
                          : 'border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</h3>
                            <p className="text-xs text-slate-400 dark:text-gray-600 mt-0.5 flex items-center gap-1">
                              <MapPin size={10} />{p.address ?? p.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ProjectStatusBadge status={p.status} />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}
                              disabled={deletingId === p.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                          {[
                            { label: 'BRA',    value: `${(p.bra_m2 ?? 0).toLocaleString('no')} m²` },
                            { label: 'Enheter', value: p.units ?? '—' },
                            { label: 'År',     value: p.completion_year ?? '—' },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-gray-800">
                              <p className="text-[10px] text-slate-400 dark:text-gray-600 mb-0.5">{label}</p>
                              <p className="font-medium text-slate-700 dark:text-gray-300">{String(value)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Progress steps */}
                        <div className="flex items-center gap-0">
                          {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                              <div className={`flex-none w-2 h-2 rounded-full transition-all ${i <= stepIdx ? STATUS_DOT[p.status] : 'bg-slate-200 dark:bg-gray-700'}`} />
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-0.5 ${i < stepIdx ? 'bg-current opacity-40' : 'bg-slate-200 dark:bg-gray-700'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1">
                          {STEP_LABELS.map((l, i) => (
                            <span key={l} className={`text-[9px] ${i <= stepIdx ? 'text-slate-600 dark:text-gray-400 font-medium' : 'text-slate-300 dark:text-gray-700'}`}>
                              {l.slice(0, 6)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="px-5 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-gray-600">
                          <Calendar size={11} />
                          <span>{p.completion_year ? `Ferdig ${p.completion_year}` : 'Dato ikke satt'}</span>
                        </div>
                        <Link
                          href={`/projects/${p.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                        >
                          Se detaljer <ArrowRight size={11} />
                        </Link>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="w-80 flex-none flex flex-col border-l border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="flex-none px-5 pt-5 pb-3 border-b border-slate-200 dark:border-gray-800">
            <div className="flex gap-1">
              {(['investering', 'radar'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    chartTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab === 'investering' ? 'Investering' : 'Analyse'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {projects.length > 0 && (
              <>
                {chartTab === 'investering' && <InvestmentChart projects={projects} />}
                {chartTab === 'radar' && <RadarChart projects={projects} />}
              </>
            )}
          </div>

          <div className="flex-none border-t border-slate-200 dark:border-gray-800 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-3">
              Aktivitet
            </p>
            <ProjectActivityFeed />
          </div>
        </aside>
      </div>

      {/* New project modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Nytt prosjekt</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 dark:text-gray-500">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {field('Prosjektnavn', (
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="f.eks. Kvadraturen Kvartal"
                      className={inputCls}
                    />
                  ), true)}
                  {field('Status', (
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                      className={inputCls}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  ))}
                  {field('By / sted', (
                    <input
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="f.eks. Kristiansand"
                      className={inputCls}
                    />
                  ))}
                  {field('Adresse', (
                    <input
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="f.eks. Markens gate 14"
                      className={inputCls}
                    />
                  ))}
                  {field('BRA (m²)', (
                    <input
                      type="number"
                      min={0}
                      value={form.bra_m2}
                      onChange={(e) => setForm((f) => ({ ...f, bra_m2: e.target.value }))}
                      placeholder="7800"
                      className={inputCls}
                    />
                  ))}
                  {field('Antall enheter', (
                    <input
                      type="number"
                      min={0}
                      value={form.units}
                      onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
                      placeholder="68"
                      className={inputCls}
                    />
                  ))}
                  {field('Etasjer', (
                    <input
                      type="number"
                      min={1}
                      value={form.floors}
                      onChange={(e) => setForm((f) => ({ ...f, floors: e.target.value }))}
                      placeholder="8"
                      className={inputCls}
                    />
                  ))}
                  {field('Ferdigstillelse (år)', (
                    <input
                      type="number"
                      min={2024}
                      max={2050}
                      value={form.completion_year}
                      onChange={(e) => setForm((f) => ({ ...f, completion_year: e.target.value }))}
                      placeholder="2027"
                      className={inputCls}
                    />
                  ))}
                  {field('Investering (MNOK)', (
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={form.investment_mnok}
                      onChange={(e) => setForm((f) => ({ ...f, investment_mnok: e.target.value }))}
                      placeholder="228"
                      className={inputCls}
                    />
                  ))}
                  {field('Reguleringsplan', (
                    <input
                      value={form.zoning_status}
                      onChange={(e) => setForm((f) => ({ ...f, zoning_status: e.target.value }))}
                      placeholder="f.eks. Offentlig ettersyn"
                      className={inputCls}
                    />
                  ))}
                  {field('Breddegrader (lat)', (
                    <input
                      type="number"
                      step="any"
                      value={form.lat}
                      onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                      placeholder="58.1471"
                      className={inputCls}
                    />
                  ))}
                  {field('Lengdegrader (lng)', (
                    <input
                      type="number"
                      step="any"
                      value={form.lng}
                      onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                      placeholder="7.9963"
                      className={inputCls}
                    />
                  ))}
                </div>

                {field('Beskrivelse', (
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Kort beskrivelse av prosjektet…"
                    rows={3}
                    className={inputCls + ' resize-none'}
                  />
                ))}

                {formError && (
                  <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors"
                  >
                    {saving ? 'Lagrer…' : 'Opprett prosjekt'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProsjekterShell>
  )
}
