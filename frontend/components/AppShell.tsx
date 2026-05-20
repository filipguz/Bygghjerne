"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sun, Moon, Home, LogOut, User, Settings } from "lucide-react";
import BackendWakeup from "@/components/BackendWakeup";
import { apiFetch } from "@/utils/api";
import { useBuilding } from "@/utils/building-context";
import { useTheme } from "@/context/ThemeContext";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  {
    href: "/dashboard",
    label: "Oversikt",
    shortLabel: "Oversikt",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/arbeidsordre",
    label: "Arbeidsordre",
    shortLabel: "Ordrer",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/eiendeler",
    label: "Eiendeler",
    shortLabel: "Utstyr",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/rapporter",
    label: "Rapporter",
    shortLabel: "Rapporter",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/assistent",
    label: "Dokumenter",
    shortLabel: "AI",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: "/prosjekter",
    label: "Portefølje",
    shortLabel: "Portefølje",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { buildingId, buildingName, loaded } = useBuilding();
  const { theme, toggle } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    apiFetch("/orgs/me").then(async (res) => {
      if (!res.ok) { router.replace("/login"); return; }
      const org = await res.json();
      if (!org) { router.replace("/onboarding"); return; }
      if (!buildingId) { router.replace("/bygninger"); return; }
      setReady(true);
    }).catch(() => router.replace("/login"));
  }, [loaded, buildingId, router]);

  if (!loaded || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <svg className="h-8 w-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  return (
    <BackendWakeup>
      <div className="min-h-screen flex bg-slate-50 dark:bg-gray-950">

        {/* ── Desktop sidebar ───────────────────────────────────────────── */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800">
          {/* Logo */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
            <Link href="/hjem" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="h-6 w-6 text-brand-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-bold text-slate-900 dark:text-white text-sm">Bygghjerne</span>
            </Link>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">Driftsforvaltning</p>
          </div>

          <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800">
            <p className="text-xs text-slate-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-1">Bygg</p>
            <Link href="/bygninger" className="flex items-center justify-between gap-1 group min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-gray-200 truncate group-hover:text-brand-600 dark:group-hover:text-blue-400 transition-colors">
                {buildingName ?? "—"}
              </p>
              <svg className="h-3.5 w-3.5 text-slate-300 dark:text-gray-600 group-hover:text-brand-500 dark:group-hover:text-blue-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 dark:bg-blue-600/20 text-brand-700 dark:text-blue-400 border border-brand-200 dark:border-blue-600/30"
                      : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-200"
                  }`}
                >
                  <span className={active ? "text-brand-500 dark:text-blue-400" : "text-slate-400 dark:text-gray-600"}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bytt modul */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-gray-800">
            <Link
              href="/hjem"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Home size={14} />
              Bytt modul
            </Link>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-slate-100 dark:border-gray-800 flex flex-col gap-2">
            <button
              onClick={toggle}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 transition-all"
            >
              <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                {theme === "dark" ? "Mørk modus" : "Lys modus"}
              </span>
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm">
                {theme === "dark"
                  ? <Moon size={13} className="text-blue-400" />
                  : <Sun  size={13} className="text-amber-500" />
                }
              </div>
            </button>

            <Link
              href="/profil"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/profil')
                  ? 'bg-brand-50 dark:bg-blue-600/20 text-brand-700 dark:text-blue-400'
                  : 'text-slate-500 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              <User size={14} />
              Min profil
            </Link>

            <Link
              href="/innstillinger"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/innstillinger')
                  ? 'bg-brand-50 dark:bg-blue-600/20 text-brand-700 dark:text-blue-400'
                  : 'text-slate-500 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              <Settings size={14} />
              Innstillinger
            </Link>

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

          <Link href="/bygninger" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors max-w-[140px]">
            <p className="text-xs font-semibold text-slate-700 dark:text-gray-300 truncate">{buildingName ?? "—"}</p>
            <svg className="h-3 w-3 text-slate-400 dark:text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Bytt tema"
            >
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link
              href="/innstillinger"
              className={`p-2 transition-colors ${
                isActive('/innstillinger')
                  ? 'text-brand-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
              aria-label="Innstillinger"
            >
              <Settings size={18} />
            </Link>
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
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 md:pt-0 pb-16 md:pb-0">
          {children}
        </div>

        {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 flex">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                  active
                    ? "text-brand-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400"
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium leading-none">{item.shortLabel}</span>
              </Link>
            );
          })}
          <Link
            href="/hjem"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 transition-colors"
          >
            <Home size={20} />
            <span className="text-[10px] font-medium leading-none">Hjem</span>
          </Link>
        </nav>

      </div>
    </BackendWakeup>
  );
}
