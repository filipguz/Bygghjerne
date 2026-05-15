'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { MapPin, Building2, Layers, TrendingUp, ArrowRight, Calendar, Search } from 'lucide-react'
import ProsjekterShell from '@/components/ProsjekterShell'
import ProjectStatusBadge from '@/components/ProjectStatusBadge'
import InvestmentChart from '@/components/InvestmentChart'
import RadarChart from '@/components/RadarChart'
import ProjectActivityFeed from '@/components/ProjectActivityFeed'
import { Project, ProjectStatus } from '@/types/projects'

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

const kpiVariants:  Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const kpiItem:      Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } }
const fadeUp:       Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } }
const cardVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

export default function ProjectsDashboard() {
  const [projects, setProjects]             = useState<Project[]>([])
  const [loading, setLoading]               = useState(true)
  const [statusFilter, setStatusFilter]     = useState<ProjectStatus | 'alle'>('alle')
  const [cityFilter, setCityFilter]         = useState('alle')
  const [search, setSearch]                 = useState('')
  const [chartTab, setChartTab]             = useState<'investering' | 'radar'>('investering')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    fetch('/api/backend/projects')
      .then((r) => r.json())
      .then((data: Project[]) => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
    { icon: <Building2 size={18} />, label: 'Prosjekter',  value: projects.length,                                                                              suffix: '',      color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: <Layers size={18} />,    label: 'Total BRA',   value: totalBRA.toLocaleString('no'),                                                                suffix: ' m²',   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: <MapPin size={18} />,    label: 'Enheter',     value: totalUnits,                                                                                   suffix: '',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: <TrendingUp size={18} />,label: 'Investering', value: totalInvestment.toLocaleString('no', { maximumFractionDigits: 0 }),                           suffix: ' MNOK', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ]

  return (
    <ProsjekterShell>
      <div className="flex h-full overflow-hidden">
        {/* Main column */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div initial="hidden" animate="show" variants={kpiVariants} className="mb-8">
            <motion.h1 variants={kpiItem} className="text-2xl font-bold text-slate-900 dark:text-white">
              Prosjektoversikt
            </motion.h1>
            <motion.p variants={kpiItem} className="text-sm text-slate-500 dark:text-gray-500 mt-1">
              {loading ? 'Laster…' : `${projects.length} aktive prosjekter`}
            </motion.p>
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
                {filtered.length === 0 ? (
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
                          <ProjectStatusBadge status={p.status} />
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
    </ProsjekterShell>
  )
}
