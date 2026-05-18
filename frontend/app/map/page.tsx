'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import ProsjekterShell from '@/components/ProsjekterShell'
import ProjectStatusBadge from '@/components/ProjectStatusBadge'
import ScoreCard from '@/components/ScoreCard'
import { Project } from '@/types/projects'
import { apiFetch } from '@/utils/api'

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), { ssr: false })

const STATUS_DOT: Record<string, string> = {
  mulighetsstudie: 'bg-violet-400',
  regulering:      'bg-amber-400',
  prosjektering:   'bg-blue-400',
  salg:            'bg-emerald-400',
}

const LEGEND = [
  { color: '#8b5cf6', label: 'Mulighetsstudie' },
  { color: '#f59e0b', label: 'Regulering' },
  { color: '#3b82f6', label: 'Prosjektering' },
  { color: '#10b981', label: 'Salg' },
]

const ANALYSIS_LABELS: Record<string, string> = {
  sol:            'Solforhold',
  støy:           'Støy',
  flom:           'Flomrisiko',
  fjernvirkning:  'Fjernvirkning',
}

export default function MapPage() {
  const [projects, setProjects]   = useState<Project[]>([])
  const [selected, setSelected]   = useState<Project | null>(null)
  const [loading, setLoading]     = useState(true)
  const [showPlans, setShowPlans] = useState(false)

  useEffect(() => {
    apiFetch('/projects')
      .then((r) => r.json())
      .then((data: Project[]) => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const analysisKeys = selected?.analysis
    ? Object.keys(selected.analysis)
    : []

  return (
    <ProsjekterShell>
      <div className="flex h-full overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-72 flex-none flex flex-col bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-200 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-gray-100">Kartvisning</h2>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">
              {loading ? 'Laster…' : `${projects.length} prosjekter`}
            </p>
          </div>

          {/* Project list */}
          <div className="flex-1 overflow-y-auto py-2">
            {projects.map((p) => (
              <motion.button
                key={p.id}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                  selected?.id === p.id
                    ? 'bg-blue-50 dark:bg-blue-600/15 border-r-2 border-blue-500'
                    : 'hover:bg-slate-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-none ${STATUS_DOT[p.status] ?? 'bg-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    selected?.id === p.id
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-800 dark:text-gray-200'
                  }`}>{p.name}</p>
                  <p className="text-xs text-slate-400 dark:text-gray-600 truncate mt-0.5">
                    {p.address ?? p.location}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Analysis panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden border-t border-slate-200 dark:border-gray-800"
              >
                <div className="px-4 pt-4 pb-5 bg-slate-50 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-gray-300">{selected.name}</p>
                      <ProjectStatusBadge status={selected.status} />
                    </div>
                    <Link
                      href={`/projects/${selected.id}`}
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Vis detaljer <ArrowRight size={11} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-slate-500 dark:text-gray-500">
                    <span>BRA: {(selected.bra_m2 ?? 0).toLocaleString('no')} m²</span>
                    <span>Enheter: {selected.units ?? '—'}</span>
                    <span>Etasjer: {selected.floors ?? '—'}</span>
                    <span>År: {selected.completion_year ?? '—'}</span>
                  </div>

                  {analysisKeys.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {analysisKeys.slice(0, 4).map((key) => {
                        const analysis = selected.analysis as Record<string, { score: number; label: string; description: string }>
                        const item = analysis[key]
                        return (
                          <ScoreCard
                            key={key}
                            label={ANALYSIS_LABELS[key] ?? key}
                            score={item.score}
                            compact
                          />
                        )
                      })}
                    </div>
                  )}

                  {analysisKeys.length === 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-600">
                      <MapPin size={12} />
                      <span>Ingen analysedata tilgjengelig</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-gray-600 text-sm">
              Laster kart…
            </div>
          ) : (
            <LeafletMap
              projects={projects}
              selected={selected}
              onSelect={setSelected}
              showPlans={showPlans}
            />
          )}

          {/* Reguleringsplan toggle */}
          <button
            onClick={() => setShowPlans((v) => !v)}
            className={`absolute top-4 right-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-xl border shadow-lg text-xs font-medium transition-all backdrop-blur-sm ${
              showPlans
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-white/90 dark:bg-gray-900/90 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-sm ${showPlans ? 'bg-white/80' : 'bg-amber-400'}`} />
            Reguleringsplaner
          </button>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-gray-700 px-3 py-2.5 shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 mb-1.5">
              Status
            </p>
            <div className="space-y-1.5">
              {LEGEND.map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-600 dark:text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProsjekterShell>
  )
}
