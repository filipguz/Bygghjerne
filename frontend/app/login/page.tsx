"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { apiFetch } from "@/utils/api";

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    text: "AI-assistent som svarer fra dine egne driftsdokumenter",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    text: "Komplett CMMS — arbeidsordre, eiendeler og vedlikehold",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
      </svg>
    ),
    text: "Prosjektportefølje med kartvisning og analyseverktøy",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    text: "Alt på norsk — søk, svar og grensesnitt",
  },
];

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-slate-400">Laster…</p>
      </div>
    }>
      <Login />
    </Suspense>
  );
}

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(m: "login" | "signup") {
    setMode(m);
    setError(null);
    setInfo(null);
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passordene stemmer ikke overens.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError("Feil e-post eller passord."); return; }
        if (next) {
          router.push(next);
        } else {
          const orgRes = await apiFetch("/orgs/me");
          const org = orgRes.ok ? await orgRes.json() : null;
          router.push(org ? "/hjem" : "/onboarding");
        }
        router.refresh();
      } else {
        const destination = next ?? '/onboarding'
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) {
          setError(error.message);
        } else {
          setInfo("Sjekk e-posten din for en bekreftelseslenke for å aktivere kontoen.");
        }
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-colors bg-slate-50 focus:bg-white";

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (desktop only) ───────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between px-16 py-12"
        style={{ backgroundColor: "#06091a" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-fit">
          <svg className="h-7 w-7 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-bold text-white text-xl">Bygghjerne</span>
        </Link>

        {/* Main pitch */}
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-coral-500 animate-pulse" />
            Bygget for norsk eiendom
          </div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Alt du trenger for å forvalte og utvikle eiendom
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(147,183,255,0.7)" }}>
            Fra driftsdokumenter og arbeidsordre til prosjektportefølje og 3D-visualisering — i én plattform, på norsk.
          </p>

          <ul className="flex flex-col gap-4">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-none w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: "rgba(255,94,61,0.12)", color: "#ff8a6b" }}
                >
                  {f.icon}
                </span>
                <span className="text-sm leading-relaxed pt-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 Bygghjerne · Kristiansand
        </p>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden px-6 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
            <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-bold text-brand-900 text-lg">Bygghjerne</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">

            {/* Tab switcher */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {m === "login" ? "Logg inn" : "Registrer deg"}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {mode === "login" ? "Velkommen tilbake" : "Opprett gratis konto"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {mode === "login"
                  ? "Logg inn for å fortsette til Bygghjerne."
                  : "Kom i gang på under ett minutt."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-post</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="deg@firma.no"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Passord</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder={mode === "signup" ? "Minst 6 tegn" : "Ditt passord"}
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bekreft passord</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Gjenta passordet"
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg className="h-4 w-4 flex-none mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {info && (
                <div className="flex items-start gap-2.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <svg className="h-4 w-4 flex-none mt-0.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Venter…
                  </>
                ) : mode === "login" ? "Logg inn" : "Opprett konto"}
              </button>
            </form>

            {mode === "login" && (
              <p className="text-xs text-center text-slate-400 mt-6">
                Ny bruker?{" "}
                <button onClick={() => switchMode("signup")} className="text-brand-600 font-medium hover:underline">
                  Registrer deg gratis
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
