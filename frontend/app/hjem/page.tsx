"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sun, Moon, LogOut, ChevronRight, Building2, FolderKanban, Wrench, Bot, Map } from "lucide-react";
import { apiFetch } from "@/utils/api";
import { useTheme } from "@/context/ThemeContext";
import { createClient } from "@/utils/supabase/client";

const MODULES = [
  {
    href: "/dashboard",
    accent: "brand",
    icon: Building2,
    title: "Drift og forvaltning",
    description: "Administrer bygg, arbeidsordre og vedlikehold med AI-assistert dokumentsøk.",
    features: [
      { icon: Wrench,  label: "Arbeidsordre og eiendeler" },
      { icon: Bot,     label: "AI-dokumentassistent" },
      { icon: Building2, label: "Dashboard per bygg" },
    ],
    cta: "Åpne driftsmodul",
    light: {
      card:    "bg-white border-slate-200 hover:border-brand-400 hover:shadow-brand-100/60",
      icon:    "bg-brand-50 border-brand-100 text-brand-600 group-hover:bg-brand-100",
      title:   "group-hover:text-brand-700",
      dot:     "bg-brand-400",
      arrow:   "text-brand-500",
      badge:   "bg-brand-50 text-brand-600 border-brand-100",
    },
    dark: {
      card:    "dark:bg-gray-900 dark:border-gray-800 dark:hover:border-blue-600/60 dark:hover:shadow-blue-900/20",
      icon:    "dark:bg-blue-600/10 dark:border-blue-600/20 dark:text-blue-400 dark:group-hover:bg-blue-600/20",
      title:   "dark:group-hover:text-blue-300",
      dot:     "dark:bg-blue-500",
      arrow:   "dark:text-blue-500",
      badge:   "dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-600/20",
    },
  },
  {
    href: "/prosjekter",
    accent: "blue",
    icon: FolderKanban,
    title: "Eiendomsutvikling",
    description: "Porteføljeoversikt med analyse, kartvisning og nøkkeltall for utviklingsprosjekter.",
    features: [
      { icon: FolderKanban, label: "Prosjektportefølje" },
      { icon: Map,          label: "Kartvisning og analyse" },
      { icon: Bot,          label: "AI-analyse av prosjekter" },
    ],
    cta: "Åpne utviklingsmodul",
    light: {
      card:    "bg-white border-slate-200 hover:border-violet-400 hover:shadow-violet-100/60",
      icon:    "bg-violet-50 border-violet-100 text-violet-600 group-hover:bg-violet-100",
      title:   "group-hover:text-violet-700",
      dot:     "bg-violet-400",
      arrow:   "text-violet-500",
      badge:   "bg-violet-50 text-violet-600 border-violet-100",
    },
    dark: {
      card:    "dark:bg-gray-900 dark:border-gray-800 dark:hover:border-violet-600/60 dark:hover:shadow-violet-900/20",
      icon:    "dark:bg-violet-600/10 dark:border-violet-600/20 dark:text-violet-400 dark:group-hover:bg-violet-600/20",
      title:   "dark:group-hover:text-violet-300",
      dot:     "dark:bg-violet-500",
      arrow:   "dark:text-violet-500",
      badge:   "dark:bg-violet-600/10 dark:text-violet-400 dark:border-violet-600/20",
    },
  },
];

export default function HjemPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/orgs/me")
      .then(async (res) => {
        if (!res.ok) { router.replace("/login"); return; }
        const org = await res.json();
        if (!org) { router.replace("/onboarding"); return; }
        setOrgName(org.name);
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <svg className="h-7 w-7 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="h-6 w-6 text-brand-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Bygghjerne</span>
          </div>

          <div className="flex items-center gap-1">
            {orgName && (
              <span className="hidden sm:block text-xs text-slate-400 dark:text-gray-500 mr-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-gray-800">
                {orgName}
              </span>
            )}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Bytt tema"
            >
              {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Logg ut"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full">

          {/* Heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-full px-3 py-1 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                {orgName ?? "Innlogget"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Hva vil du jobbe med i dag?
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-base max-w-sm mx-auto">
              Velg en modul for å komme i gang. Du kan bytte modul når som helst.
            </p>
          </div>

          {/* Module cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className={`group border rounded-2xl p-8 hover:shadow-lg transition-all duration-200 flex flex-col gap-6 ${mod.light.card} ${mod.dark.card}`}
                >
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between">
                    <div className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-colors ${mod.light.icon} ${mod.dark.icon}`}>
                      <Icon size={22} />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${mod.light.badge} ${mod.dark.badge}`}>
                      Modul
                    </span>
                  </div>

                  {/* Text */}
                  <div>
                    <p className={`font-semibold text-slate-900 dark:text-white text-lg mb-1.5 transition-colors ${mod.light.title} ${mod.dark.title}`}>
                      {mod.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-2">
                    {mod.features.map(({ icon: FIcon, label }) => (
                      <li key={label} className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-gray-500">
                        <FIcon size={13} className={`flex-none ${mod.light.arrow} ${mod.dark.arrow}`} />
                        {label}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className={`flex items-center gap-1.5 text-sm font-medium mt-auto pt-2 border-t border-slate-100 dark:border-gray-800 transition-colors ${mod.light.arrow} ${mod.dark.arrow}`}>
                    {mod.cta}
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom hint */}
          <p className="text-center text-xs text-slate-400 dark:text-gray-600 mt-10">
            Begge moduler deler samme organisasjon og data.
          </p>
        </div>
      </main>
    </div>
  );
}
