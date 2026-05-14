'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Map, Building2, Sun, Moon, Search, ArrowRight, Command } from 'lucide-react'
import { useCommandPalette } from '@/context/CommandPaletteContext'
import { useTheme } from '@/context/ThemeContext'
import { Project } from '@/types/projects'

const STATUS_LABEL: Record<string, string> = {
  mulighetsstudie: 'Mulighetsstudie',
  regulering:      'Regulering',
  prosjektering:   'Prosjektering',
  salg:            'Salg',
}
const STATUS_COLOR: Record<string, string> = {
  mulighetsstudie: 'bg-violet-400',
  regulering:      'bg-amber-400',
  prosjektering:   'bg-blue-400',
  salg:            'bg-emerald-400',
}

interface Cmd {
  id:          string
  label:       string
  description?: string
  icon:        React.ReactNode
  group:       string
  shortcut?:   string
  action:      () => void
  keywords?:   string[]
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-blue-100 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-sm not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

interface Props { projects: Project[] }

export default function CommandPalette({ projects }: Props) {
  const { isOpen, close }    = useCommandPalette()
  const { theme, toggle }    = useTheme()
  const router               = useRouter()
  const [query, setQuery]    = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef             = useRef<HTMLInputElement>(null)
  const listRef              = useRef<HTMLDivElement>(null)

  const commands = useMemo<Cmd[]>(() => [
    {
      id: 'nav-dashboard', label: 'Prosjektoversikt', group: 'Navigasjon',
      description: 'Alle prosjekter og KPI-dashboard',
      icon: <LayoutDashboard size={15} />, shortcut: 'G D',
      action: () => { router.push('/'); close() },
      keywords: ['hjem', 'dashboard', 'oversikt', 'prosjekter'],
    },
    {
      id: 'nav-map', label: 'Kartvisning', group: 'Navigasjon',
      description: 'Interaktivt kart med prosjektmarkører',
      icon: <Map size={15} />, shortcut: 'G M',
      action: () => { router.push('/map'); close() },
      keywords: ['kart', 'map', 'leaflet'],
    },
    ...projects.map((p) => ({
      id:          `proj-${p.id}`,
      label:       p.name,
      description: `${p.address ?? p.location} · ${STATUS_LABEL[p.status]}`,
      icon: (
        <div className="relative">
          <Building2 size={15} />
          <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${STATUS_COLOR[p.status]}`} />
        </div>
      ),
      group:    'Prosjekter',
      action:   () => { router.push(`/projects/${p.id}`); close() },
      keywords: [p.location ?? '', p.status, p.zoning_code ?? ''],
    })),
    {
      id: 'toggle-theme', group: 'Handlinger',
      label:   theme === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus',
      icon:    theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />,
      action:  () => { toggle(); close() },
      keywords: ['theme', 'tema', 'dark', 'light', 'mørk', 'lys'],
    },
  ], [router, close, theme, toggle, projects])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.keywords?.some((k) => k.toLowerCase().includes(q))
    )
  }, [commands, query])

  const grouped = useMemo(() => {
    if (query.trim()) return [{ group: 'Resultater', items: filtered }]
    const groups: Record<string, Cmd[]> = {}
    for (const cmd of filtered) {
      if (!groups[cmd.group]) groups[cmd.group] = []
      groups[cmd.group].push(cmd)
    }
    return Object.entries(groups).map(([group, items]) => ({ group, items }))
  }, [filtered, query])

  const flatList = grouped.flatMap((g) => g.items)

  useEffect(() => { setSelected(0) }, [query])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((i) => Math.min(i + 1, flatList.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && flatList[selected]) flatList[selected].action()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close, flatList, selected])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selected}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              className="w-full max-w-xl pointer-events-auto"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-gray-800">
                  <Search size={16} className="text-slate-400 dark:text-gray-500 flex-none" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Søk prosjekter, sider, handlinger…"
                    className="flex-1 bg-transparent text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 outline-none"
                  />
                  <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 dark:text-gray-600 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded px-1.5 py-0.5">
                    ESC
                  </kbd>
                </div>

                <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
                  {flatList.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-gray-600">
                      Ingen resultater for «{query}»
                    </div>
                  ) : (
                    grouped.map(({ group, items }) => (
                      <div key={group}>
                        <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-600">
                          {group}
                        </p>
                        {items.map((cmd) => {
                          const idx = flatList.indexOf(cmd)
                          const isSelected = idx === selected
                          return (
                            <button key={cmd.id} data-index={idx} onClick={cmd.action}
                              onMouseEnter={() => setSelected(idx)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isSelected ? 'bg-blue-50 dark:bg-blue-600/15' : 'hover:bg-slate-50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <span className={`flex-none w-7 h-7 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-blue-100 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400'
                                           : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                              }`}>{cmd.icon}</span>
                              <span className="flex-1 min-w-0">
                                <span className={`block text-sm font-medium ${
                                  isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-gray-200'
                                }`}><Highlight text={cmd.label} query={query} /></span>
                                {cmd.description && (
                                  <span className="block text-xs text-slate-400 dark:text-gray-600 truncate mt-0.5">
                                    <Highlight text={cmd.description} query={query} />
                                  </span>
                                )}
                              </span>
                              {cmd.shortcut && !query && (
                                <span className="flex-none flex gap-1">
                                  {cmd.shortcut.split(' ').map((k) => (
                                    <kbd key={k} className="text-[10px] text-slate-400 dark:text-gray-600 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded px-1.5 py-0.5">{k}</kbd>
                                  ))}
                                </span>
                              )}
                              {isSelected && <ArrowRight size={13} className="flex-none text-blue-500 dark:text-blue-400" />}
                            </button>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-gray-600">
                    <span className="flex items-center gap-1">
                      <kbd className="bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded px-1 py-0.5">↑</kbd>
                      <kbd className="bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded px-1 py-0.5">↓</kbd>
                      naviger
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded px-1.5 py-0.5">↵</kbd>
                      åpne
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 dark:text-gray-700">
                    <Command size={10} /><span>Bygghjerne</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
