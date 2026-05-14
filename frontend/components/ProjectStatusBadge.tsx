'use client'

import { ProjectStatus } from '@/types/projects'

const config: Record<ProjectStatus, { label: string; classes: string; dot: string }> = {
  mulighetsstudie: {
    label: 'Mulighetsstudie',
    classes: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    dot: 'bg-violet-500',
  },
  regulering: {
    label: 'Regulering',
    classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  prosjektering: {
    label: 'Prosjektering',
    classes: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    dot: 'bg-blue-500',
  },
  salg: {
    label: 'Salg',
    classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
}

interface Props {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

export default function ProjectStatusBadge({ status, size = 'md' }: Props) {
  const c = config[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.classes} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
