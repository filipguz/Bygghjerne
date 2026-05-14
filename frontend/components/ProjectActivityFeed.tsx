'use client'

import { FileText, GitBranch, CheckCircle, Upload } from 'lucide-react'

const STATUS_DOT: Record<string, string> = {
  mulighetsstudie: 'bg-violet-400',
  regulering:      'bg-amber-400',
  prosjektering:   'bg-blue-400',
  salg:            'bg-emerald-400',
}

const activities = [
  { id: 1, project: 'Lund Terrasse',        status: 'salg',            event: 'Salgsstatistikk Q4 lastet opp',          time: '2t siden',  type: 'upload'    as const },
  { id: 2, project: 'Bjørvika Havnefront',  status: 'regulering',      event: 'Reguleringsplan oppdatert til rev. 3',   time: '1d siden',  type: 'update'    as const },
  { id: 3, project: 'Majorstuen Kvartal',   status: 'prosjektering',   event: 'SHA-plan revidert og godkjent',          time: '2d siden',  type: 'upload'    as const },
  { id: 4, project: 'Kvadraturen Parkside', status: 'mulighetsstudie', event: 'Mulighetsstudie konsept A ferdigstilt',  time: '3d siden',  type: 'milestone' as const },
  { id: 5, project: 'Majorstuen Kvartal',   status: 'prosjektering',   event: 'Rammetillatelse mottatt fra PBE',        time: '1u siden',  type: 'milestone' as const },
  { id: 6, project: 'Lund Terrasse',        status: 'salg',            event: 'Igangsettingstillatelse godkjent',       time: '2u siden',  type: 'milestone' as const },
]

const typeIcon = (type: 'upload' | 'update' | 'milestone') => {
  if (type === 'upload')   return <Upload      size={12} />
  if (type === 'update')   return <GitBranch   size={12} />
  return                          <CheckCircle size={12} />
}

const typeBg = (type: 'upload' | 'update' | 'milestone') => {
  if (type === 'upload')  return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
  if (type === 'update')  return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
  return                         'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
}

export default function ProjectActivityFeed() {
  return (
    <div className="space-y-0">
      {activities.map((a, i) => (
        <div key={a.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-none mt-0.5 ${typeBg(a.type)}`}>
              {typeIcon(a.type)}
            </div>
            {i < activities.length - 1 && (
              <div className="w-px flex-1 bg-slate-200 dark:bg-gray-800 my-1" />
            )}
          </div>
          <div className="pb-4 flex-1">
            <p className="text-xs text-slate-700 dark:text-gray-300 leading-snug">{a.event}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[a.status]}`} />
              <span className="text-[11px] text-slate-500 dark:text-gray-600">{a.project}</span>
              <span className="text-[11px] text-slate-300 dark:text-gray-700">·</span>
              <span className="text-[11px] text-slate-400 dark:text-gray-700">{a.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
