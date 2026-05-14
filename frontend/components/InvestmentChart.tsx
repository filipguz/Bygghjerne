'use client'

import { useState } from 'react'
import { Project } from '@/types/projects'

const STATUS_COLOR: Record<string, string> = {
  mulighetsstudie: '#8b5cf6',
  regulering:      '#f59e0b',
  prosjektering:   '#3b82f6',
  salg:            '#10b981',
}

interface Props { projects: Project[] }

export default function InvestmentChart({ projects }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = projects.reduce((s, p) => s + (p.investment_mnok ?? 0), 0)

  const cx = 80, cy = 80, R = 58, r = 36, gap = 0.03
  let cumAngle = -Math.PI / 2

  const slices = projects.map((p) => {
    const fraction   = (p.investment_mnok ?? 0) / total
    const sweep      = fraction * 2 * Math.PI - gap
    const startAngle = cumAngle + gap / 2
    const endAngle   = startAngle + sweep
    cumAngle        += fraction * 2 * Math.PI

    const x1  = cx + R * Math.cos(startAngle), y1  = cy + R * Math.sin(startAngle)
    const x2  = cx + R * Math.cos(endAngle),   y2  = cy + R * Math.sin(endAngle)
    const ix1 = cx + r * Math.cos(endAngle),   iy1 = cy + r * Math.sin(endAngle)
    const ix2 = cx + r * Math.cos(startAngle), iy2 = cy + r * Math.sin(startAngle)
    const large = sweep > Math.PI ? 1 : 0

    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ')

    return { p, d, fraction, color: STATUS_COLOR[p.status] }
  })

  const active = hovered ? projects.find((p) => p.id === hovered) : null

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-none w-40 h-40">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map(({ p, d, color }) => (
            <path
              key={p.id} d={d} fill={color}
              opacity={hovered && hovered !== p.id ? 0.25 : 1}
              style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold text-slate-900 dark:text-gray-100 tabular-nums leading-none">
            {active ? active.investment_mnok : total}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
            {active ? 'MNOK' : 'MNOK totalt'}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {slices.map(({ p, fraction, color }) => (
          <div key={p.id} className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}>
            <span className="w-2.5 h-2.5 rounded-sm flex-none transition-opacity"
              style={{ background: color, opacity: hovered && hovered !== p.id ? 0.25 : 1 }} />
            <span className={`text-xs flex-1 truncate transition-colors ${
              hovered === p.id ? 'text-slate-900 dark:text-gray-200' : 'text-slate-500 dark:text-gray-500'
            }`}>{p.name}</span>
            <span className={`text-xs font-semibold tabular-nums transition-colors ${
              hovered === p.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-600'
            }`}>{Math.round(fraction * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
