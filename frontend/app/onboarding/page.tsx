"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/utils/api";

type Role = "forvalter" | "utvikler" | "begge";

const ROLES: { id: Role; emoji: string; title: string; desc: string; bullets: string[] }[] = [
  {
    id: "forvalter",
    emoji: "🏢",
    title: "Eiendomsforvalter",
    desc: "Drift og vedlikehold av eksisterende bygningsmasse.",
    bullets: ["AI-assistent for driftsdokumenter", "Arbeidsordre og eiendelsregister", "Dashboard og vedlikeholdslogg"],
  },
  {
    id: "utvikler",
    emoji: "🏗️",
    title: "Eiendomsutvikler",
    desc: "Prosjektportefølje for nye bolig- og næringsprosjekter.",
    bullets: ["Prosjektoversikt med nøkkeltall", "Kartvisning og analyseverktøy", "Finanskalkulator per prosjekt"],
  },
  {
    id: "begge",
    emoji: "⚡",
    title: "Begge deler",
    desc: "Full tilgang til alle moduler i Bygghjerne.",
    bullets: ["Alt fra drift og forvaltning", "Alt fra eiendomsutvikling", "Bytt fritt mellom modulene"],
  },
];

const STEPS = ["Din rolle", "Organisasjon", "Første bygg", "Klar!"];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className={`flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            i < current
              ? "bg-brand-600 text-white"
              : i === current
                ? "bg-brand-600 text-white ring-4 ring-brand-100"
                : "bg-slate-100 text-slate-400"
          }`}>
            {i < current ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 transition-all duration-300 ${i < current ? "bg-brand-600" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [orgName, setOrgName] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsBuilding = role === "forvalter" || role === "begge";
  const totalSteps = needsBuilding ? 4 : 3;

  function getStepLabels() {
    if (needsBuilding) return STEPS;
    return ["Din rolle", "Organisasjon", "Klar!"];
  }

  async function handleOrgAndBuilding() {
    setError(null);
    setLoading(true);
    try {
      const orgRes = await apiFetch("/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim() }),
      });
      if (!orgRes.ok) {
        const data = await orgRes.json();
        throw new Error(data.detail || "Kunne ikke opprette organisasjon.");
      }

      if (needsBuilding && buildingName.trim()) {
        const buildRes = await apiFetch("/buildings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: buildingName.trim(), address: address.trim() || null }),
        });
        if (!buildRes.ok) {
          const data = await buildRes.json();
          throw new Error(data.detail || "Kunne ikke opprette bygg.");
        }
      }

      setStep((s) => s + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    if (role === "forvalter") router.push("/bygninger");
    else if (role === "utvikler") router.push("/prosjekter");
    else router.push("/hjem");
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-colors bg-slate-50 focus:bg-white";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-bold text-brand-900">Bygghjerne</span>
          </Link>
          <span className="text-xs text-slate-400">{getStepLabels()[step]}</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <StepIndicator current={step} total={needsBuilding ? 4 : 3} />

          {/* ── Step 0: Role ────────────────────────────────────────── */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Hva beskriver deg best?</h1>
              <p className="text-sm text-slate-500 mb-7">
                Vi tilpasser oppsettet basert på hva du jobber med.
              </p>
              <div className="flex flex-col gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-150 ${
                      role === r.id
                        ? "border-brand-500 bg-brand-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-none">{r.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">{r.title}</p>
                          <div className={`w-4 h-4 rounded-full border-2 flex-none transition-all ${
                            role === r.id
                              ? "border-brand-600 bg-brand-600"
                              : "border-slate-300"
                          }`}>
                            {role === r.id && (
                              <svg className="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5 mb-3">{r.desc}</p>
                        <ul className="flex flex-col gap-1">
                          {r.bullets.map((b) => (
                            <li key={b} className="flex items-center gap-2 text-xs text-slate-500">
                              <span className={`h-1.5 w-1.5 rounded-full flex-none ${role === r.id ? "bg-brand-500" : "bg-slate-300"}`} />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => role && setStep(1)}
                disabled={!role}
                className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
              >
                Fortsett
              </button>
            </div>
          )}

          {/* ── Step 1: Org name ────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Hva heter organisasjonen din?</h1>
              <p className="text-sm text-slate-500 mb-7">
                Du kan invitere kollegaer inn i organisasjonen etterpå.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Organisasjonsnavn</label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && orgName.trim() && setStep(2)}
                    className={inputCls}
                    placeholder="f.eks. Gustavsen Eiendom AS"
                  />
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Data er isolert per organisasjon — ingen andre ser din informasjon.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Tilbake
                </button>
                <button
                  onClick={() => orgName.trim() && setStep(2)}
                  disabled={!orgName.trim()}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  Fortsett
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Building (if forvalter/begge) OR confirm (if utvikler) ── */}
          {step === 2 && needsBuilding && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Legg til ditt første bygg</h1>
              <p className="text-sm text-slate-500 mb-7">
                Du kan legge til flere bygg og administrere dem fra bygningsoversikten.
              </p>

              {error && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <svg className="h-4 w-4 flex-none mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Navn på bygg</label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className={inputCls}
                    placeholder="f.eks. Rådhuset"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Adresse <span className="text-slate-400 font-normal">(valgfri)</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputCls}
                    placeholder="f.eks. Rådhusplassen 1, 4611 Kristiansand"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setStep(1); setError(null); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Tilbake
                </button>
                <button
                  onClick={handleOrgAndBuilding}
                  disabled={!buildingName.trim() || loading}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Oppretter…
                    </>
                  ) : "Fullfør oppsett"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2 for utvikler: confirm and create org ─────────── */}
          {step === 2 && !needsBuilding && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Se over og fullfør</h1>
              <p className="text-sm text-slate-500 mb-7">Alt ser bra ut. Vi oppretter din konto nå.</p>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Rolle</span>
                  <span className="font-medium text-slate-800">
                    {ROLES.find((r) => r.id === role)?.title}
                  </span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Organisasjon</span>
                  <span className="font-medium text-slate-800">{orgName}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <svg className="h-4 w-4 flex-none mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(1); setError(null); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Tilbake
                </button>
                <button
                  onClick={handleOrgAndBuilding}
                  disabled={loading}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Oppretter…
                    </>
                  ) : "Fullfør oppsett"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 (or 2 for utvikler): Success ─────────────────── */}
          {((needsBuilding && step === 3) || (!needsBuilding && step === 3)) && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mb-2">Du er klar!</h1>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                {role === "forvalter" && "Organisasjonen og ditt første bygg er opprettet. Legg til driftsdokumenter og kom i gang."}
                {role === "utvikler" && "Organisasjonen er opprettet. Legg til dine første prosjekter i porteføljen."}
                {role === "begge" && "Alt er klart. Du kan fritt bytte mellom drift og prosjektportefølje."}
              </p>

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                {(role === "forvalter" || role === "begge") && (
                  <button
                    onClick={() => router.push("/bygninger")}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Gå til drift og forvaltning
                  </button>
                )}
                {(role === "utvikler" || role === "begge") && (
                  <button
                    onClick={() => router.push("/prosjekter")}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                      role === "utvikler"
                        ? "bg-brand-600 hover:bg-brand-700 text-white"
                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    </svg>
                    Gå til prosjektportefølje
                  </button>
                )}
              </div>

              {/* Quick tips */}
              <div className="mt-10 text-left bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Neste steg</p>
                <ul className="flex flex-col gap-2.5">
                  {role !== "utvikler" && (
                    <li className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="flex-none w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      Last opp driftsdokumenter (PDF) og still spørsmål til AI-assistenten
                    </li>
                  )}
                  {role !== "utvikler" && (
                    <li className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="flex-none w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      Opprett din første arbeidsordre under Arbeidsordre
                    </li>
                  )}
                  {role !== "forvalter" && (
                    <li className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="flex-none w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold mt-0.5">{role === "utvikler" ? "1" : "3"}</span>
                      Legg til ditt første prosjekt i porteføljen med adresse og koordinater
                    </li>
                  )}
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="flex-none w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold mt-0.5">
                      {role === "forvalter" ? "3" : role === "utvikler" ? "2" : "4"}
                    </span>
                    Inviter kollegaer via Innstillinger → Team
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
