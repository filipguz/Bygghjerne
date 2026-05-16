'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Map, ChevronRight, Sun, Moon, Search, LogOut, Home } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useCommandPalette } from '@/context/CommandPaletteContext'
import CommandPalette from '@/components/CommandPalette'
import { Project } from '@/types/projects'
import { MOCK_PROJECTS } from '@/utils/mock-projects'
import { createClient } from '@/utils/supabase/client'
import { apiFetch } from '@/utils/api'

const STATUS_DOT: Record<string, string> = {
  mulighetsstudie: 'bg-violet-400',
  regulering:      'bg-amber-400',
  prosjektering:   'bg-blue-400',
  salg:            'bg-emerald-400',
}

const navItems = [
  { to: '/prosjekter', icon: LayoutDashboard, label: 'Oversikt' },
  { to: '/map',        icon: Map,             label: 'Kartvisning' },
]

interface Props {
  children: React.ReactNode
}

export default function ProsjekterShell({ children }: Props) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { theme, toggle } = useTheme()
  const { open }          = useCommandPalette()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    apiFetch('/projects')
      .then((r) => r.json())
      .then((data: Project[]) => setProjects(data.length > 0 ? data : MOCK_PROJECTS))
      .catch(() => setProjects(MOCK_PROJECTS))
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(to: string) {
    return pathname.startsWith(to)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-gray-950">

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-56 flex-none flex-col bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200 dark:border-gray-800">
          <Link href="/hjem" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="h-6 w-6 text-brand-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Bygghjerne</span>
          </Link>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">Eiendomsutvikling</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-600 px-2 mb-2">
            Navigasjon
          </p>

          {/* Search trigger */}
          <button onClick={open}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-150 group mb-1">
            <Search size={16} className="flex-none" />
            <span className="flex-1 text-left">Søk…</span>
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-gray-600 bg-slate-100 dark:bg-gray-800 group-hover:bg-slate-200 dark:group-hover:bg-gray-700 border border-slate-200 dark:border-gray-700 rounded px-1.5 py-0.5 transition-colors">
              ⌘K
            </kbd>
          </button>

          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} href={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive(to)
                  ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600/30'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={16} /><span>{label}</span>
            </Link>
          ))}

          {projects.length > 0 && (
            <div className="pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-gray-600 px-2 mb-2">
                Prosjekter
              </p>
              {projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                    pathname === `/projects/${p.id}`
                      ? 'bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-gray-100'
                      : 'text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-none ${STATUS_DOT[p.status] ?? 'bg-slate-400'}`} />
                  <span className="truncate flex-1 text-xs">{p.name}</span>
                  <ChevronRight size={12} className="flex-none opacity-0 group-hover:opacity-50 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Bytt modul */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-gray-800">
          <Link
            href="/hjem"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Home size={14} />
            Bytt modul
          </Link>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-gray-800 flex flex-col gap-2">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 transition-all"
          >
            <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">
              {theme === 'dark' ? 'Mørk modus' : 'Lys modus'}
            </span>
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm">
              {theme === 'dark'
                ? <Moon size={13} className="text-blue-400" />
                : <Sun  size={13} className="text-amber-500" />
              }
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={14} />
            Logg ut
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between px-4">
        <Link href="/hjem" className="flex items-center gap-2">
          <svg className="h-6 w-6 text-brand-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-bold text-slate-900 dark:text-white text-sm">Bygghjerne</span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Bytt tema"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Logg ut"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-16 md:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname.startsWith(to)
          return (
            <Link
              key={to}
              href={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
        <Link
          href="/hjem"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 transition-colors"
        >
          <Home size={20} />
          <span className="text-[10px] font-medium leading-none">Hjem</span>
        </Link>
      </nav>

      <CommandPalette projects={projects} />
    </div>
  )
}
