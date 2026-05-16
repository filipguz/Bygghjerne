"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/utils/api";
import { createClient } from "@/utils/supabase/client";

export default function HjemPage() {
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <svg className="h-7 w-7 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-bold text-brand-900 text-base">Bygghjerne</span>
          </div>
          <div className="flex items-center gap-4">
            {orgName && (
              <span className="text-sm text-slate-500">{orgName}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              Logg ut
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Hva vil du jobbe med?</h1>
            <p className="text-slate-500 text-base">Velg modul for å komme i gang.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Drift */}
            <Link
              href="/bygninger"
              className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-brand-400 hover:shadow-md transition-all flex flex-col gap-5"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg mb-1 group-hover:text-brand-700 transition-colors">
                  Drift og forvaltning
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Arbeidsordre, eiendelsregister, AI-assistent og vedlikeholdsoversikt for dine bygg.
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 mt-auto">
                {["Dashboard per bygg", "Arbeidsordre og eiendeler", "Dokumentassistent (AI)"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Link>

            {/* Eiendomsutvikling */}
            <Link
              href="/prosjekter"
              className="group bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-md transition-all flex flex-col gap-5"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">
                  Eiendomsutvikling
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Prosjektportefølje med analyse, kartvisning og nøkkeltall for utviklingsprosjekter.
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 mt-auto">
                {["Porteføljeoversikt", "Analyse og nøkkeltall", "Kartvisning av prosjekter"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
