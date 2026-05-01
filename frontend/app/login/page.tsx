"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError("Feil e-post eller passord.");
        } else {
          router.push("/assistent");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          setInfo("Sjekk e-posten din for en bekreftelseslenke.");
        }
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-bold text-brand-900 text-lg">Bygghjerne</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            {mode === "login" ? "Logg inn" : "Opprett konto"}
          </h1>
          <p className="text-sm text-slate-500 text-center mb-8">
            {mode === "login" ? "Ingen konto?" : "Har du allerede konto?"}{" "}
            <button
              className="text-brand-600 font-medium hover:underline"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setInfo(null); }}
            >
              {mode === "login" ? "Registrer deg" : "Logg inn"}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-post</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="deg@eksempel.no"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passord</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Minst 6 tegn"
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
            )}
            {info && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Venter..." : mode === "login" ? "Logg inn" : "Opprett konto"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
