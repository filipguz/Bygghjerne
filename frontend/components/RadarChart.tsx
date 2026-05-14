'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Project } from '@/types/projects'

const STATUS_COLOR: Record<string, string> = {
  mulighetsstudie: '#8b5cf6',
  regulering:      '#f59e0b',
  prosjektering:   '#3b82f6',
  salg:            '#10b981',
}

const AXES = [
  { key: 'sol' as const,           label: 'Sol',     angle: -Math.PI / 2 },
  { key: 'fjernvirkning' as const, label: 'Fjernv.', angle: 0 },
  { key: 'støy' as const,          label: 'Støy',    angle: Math.PI / 2 },
  { key: 'flom' as const,          label: 'Flom',    angle: Math.PI },
]

const CX = 110, CY = 108, R = 70
const LEVELS = [0.25, 0.5, 0.75, 1]

function polarPoint(angle: number, radius: number) {
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) }
}

function buildPolygon(p: Project): string {
  return AXES.map(({ key, angle }) => {
    const s = (p.analysis?.[key]?.score ?? 50) / 100
    const pt = polarPoint(angle, s * R)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

interface Props { projects: Project[] }

export default function RadarChart({ projects }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div>
      <svg viewBox="0 0 220 230" className="w-full text-slate-400 dark:text-gray-600">
        {LEVELS.map((lvl) => {
          const pts = AXES.map(({ angle }) => {
            const pt = polarPoint(angle, lvl * R)
            return `${pt.x},${pt.y}`
          }).join(' ')
          return <polygon key={lvl} points={pts} fill="none" stroke="currentColor" strokeWidth="0.8" opacity={0.5} />
        })}

        {LEVELS.map((lvl) => (
          <text key={lvl} x={CX + 3} y={CY - lvl * R + 3} fontSize="7" fill="currentColor" opacity="0.6">
            {lvl * 100}
          </text>
        ))}

        {AXES.map(({ key, angle }) => {
          const end = polarPoint(angle, R)
          return <line key={key} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        })}

        {AXES.map(({ key, label, angle }) => {
          const pt = polarPoint(angle, R + 14)
          const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end'
          return (
            <text key={key} x={pt.x} y={pt.y + 3} textAnchor={anchor} fontSize="9" fontWeight="600" fill="currentColor">
              {label}
            </text>
          )
        })}

        {[...projects]
          .sort((a, b) => (hovered === a.id ? 1 : hovered === b.id ? -1 : 0))
          .map((p, i) => {
            const pts   = buildPolygon(p)
            const color = STATUS_COLOR[p.status]
            const isHov = hovered === p.id
            const isDim = hovered !== null && !isHov
            return (
              <motion.polygon
                key={p.id}
                points={pts}
                fill={color}
                fillOpacity={isHov ? 0.35 : isDim ? 0.05 : 0.18}
                stroke={color}
                strokeWidth={isHov ? 2 : 1.5}
                strokeOpacity={isDim ? 0.2 : 1}
                style={{ cursor: 'pointer', transition: 'fill-opacity 0.15s, stroke-opacity 0.15s' }}
                initial={{ scale: 0, originX: `${CX}px`, originY: `${CY}px` }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.08 }}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
      </svg>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 px-1">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}>
            <span className="w-2 h-2 rounded-sm flex-none"
              style={{ background: STATUS_COLOR[p.status], opacity: hovered && hovered !== p.id ? 0.25 : 1 }} />
            <span className={`text-[10px] transition-colors truncate ${
              hovered === p.id ? 'text-slate-900 dark:text-gray-100 font-medium' : 'text-slate-500 dark:text-gray-500'
            }`}>{p.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
