'use client'

import { motion } from 'framer-motion'

interface Props {
  score: number
  label: string
  description?: string
  icon?: React.ReactNode
  delay?: number
  compact?: boolean
}

function scoreColor(score: number) {
  if (score >= 70) return { stroke: '#10b981', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' }
  if (score >= 40) return { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10',   border: 'border-amber-200 dark:border-amber-500/20' }
  return             { stroke: '#ef4444', text: 'text-red-600 dark:text-red-400',           bg: 'bg-red-50 dark:bg-red-500/10',       border: 'border-red-200 dark:border-red-500/20' }
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Svært god'
  if (score >= 60) return 'God'
  if (score >= 40) return 'Moderat'
  if (score >= 20) return 'Lav'
  return 'Kritisk'
}

export default function ScoreCard({ score, label, description, icon, delay = 0, compact = false }: Props) {
  const radius = 30
  const colors = scoreColor(score)

  if (compact) {
    return (
      <div className={`rounded-lg border ${colors.border} ${colors.bg} px-2 py-1.5 flex items-center gap-2`}>
        <div className="relative w-8 h-8 flex-none">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="8"
              className="stroke-slate-200 dark:stroke-white/5" />
            <motion.circle
              cx="36" cy="36" r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: score / 100 }}
              transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1], delay: delay + 0.1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[10px] font-bold ${colors.text}`}>{score}</span>
          </div>
        </div>
        <span className="text-xs text-slate-600 dark:text-gray-400 truncate">{label}</span>
      </div>
    )
  }

  return (
    <motion.div
      className={`rounded-xl border ${colors.border} ${colors.bg} p-4 flex gap-4 items-start`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
    >
      <div className="flex-none flex flex-col items-center gap-1">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="6"
              className="stroke-slate-200 dark:stroke-white/5" />
            <motion.circle
              cx="36" cy="36" r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: score / 100 }}
              transition={{ duration: 1.1, ease: [0.33, 1, 0.68, 1], delay: delay + 0.15 }}
            />
          </svg>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.5 }}
          >
            <span className={`text-lg font-bold ${colors.text}`}>{score}</span>
          </motion.div>
        </div>
        <span className={`text-[10px] font-medium ${colors.text}`}>{scoreLabel(score)}</span>
      </div>

      <div className="flex-1 min-w-0">
        {(icon || label) && (
          <div className="flex items-center gap-1.5 mb-1">
            {icon && <span className="text-slate-400 dark:text-gray-400">{icon}</span>}
            <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">{label}</span>
          </div>
        )}
        {description && <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed">{description}</p>}
      </div>
    </motion.div>
  )
}
