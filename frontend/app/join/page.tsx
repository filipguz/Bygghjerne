"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { apiFetch } from "@/utils/api";

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Laster…</p>
      </div>
    }>
      <Join />
    </Suspense>
  );
}

function Join() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [orgName, setOrgName] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [session, setSession] = useState<boolean | null>(null);

  // Auth form state
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signupSent, setSignupSent] = useState(false);

  // Join state
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // 1. Fetch org name from invite token
  useEffect(() => {
    if (!token) return;
    fetch(`/api/backend/orgs/invite/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Ugyldig invitasjonslenke.");
        }
        return res.json();
      })
      .then((data) => setOrgName(data.org_name))
      .catch((e: unknown) => setFetchError(e instanceof Error ? e.message : "Ugyldig lenke."));
  }, [token]);

  // 2. Check if user already has a session
  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });
  }, []);

  async function handleJoin() {
    if (!token) return;
    setJoining(true);
    setJoinError(null);
    try {
      const res = await apiFetch(`/orgs/join?token=${token}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Kunne ikke bli med.");
      }
      setDone(true);
      setTimeout(() => router.push("/bygninger"), 1500);
    } catch (e: unknown) {
      setJoinError(e instanceof Error ? e.message : "Noe gikk galt.");
      setJoining(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const supabase = createClient();

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setAuthError("Feil e-post eller passord.");
          return;
        }
        // Logged in — now join
        setSession(true);
        await handleJoin();
      } else {
        const redirectTo = `${window.location.origin}/join?token=${token}`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) {
          setAuthError(error.message);
          return;
        }
        setSignupSent(true);
      }
    } catch {
      setAuthError("Noe gikk galt. Prøv igjen.");
    } finally {
      setAuthLoading(false);
    }
  }

  if (!token) return <ErrorPage message="Mangler invitasjonstoken i lenken." />;
  if (fetchError) return <ErrorPage message={fetchError} />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-6 py-5 flex items-center max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-bold text-brand-900 text-lg">Serv24</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          {/* Loading org name */}
          {orgName === null && (
            <p className="text-sm text-slate-400 text-center">Laster…</p>
          )}

          {/* Success */}
          {done && (
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">Du er med!</h1>
              <p className="text-sm text-slate-500">Sender deg til byggene dine…</p>
            </div>
          )}

          {/* Signup confirmation sent */}
          {signupSent && !done && (
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Sjekk e-posten din</h1>
              <p className="text-sm text-slate-500">
                Vi har sendt en bekreftelseslenke til <strong>{email}</strong>.
                Klikk på lenken i e-posten for å fullføre registreringen og bli med i{" "}
                <strong>{orgName}</strong>.
              </p>
            </div>
          )}

          {/* Main invite UI */}
          {orgName && !done && !signupSent && (
            <>
              <div className="text-center mb-8">
                <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
                  <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Du er invitert!</h1>
                <p className="text-slate-500 text-sm">
                  Bli med i <span className="font-semibold text-slate-800">{orgName}</span> på Serv24
                </p>
              </div>

              {joinError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
                  {joinError}
                </p>
              )}

              {/* Already logged in → just show join button */}
              {session === true ? (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
                >
                  {joining ? "Blir med…" : `Bli med i ${orgName}`}
                </button>
              ) : session === false ? (
                /* Not logged in → inline auth form */
                <div className="flex flex-col gap-4">
                  {/* Login / Signup toggle */}
                  <div className="flex rounded-lg border border-slate-200 p-1 gap-1">
                    <button
                      onClick={() => { setAuthMode("login"); setAuthError(null); }}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        authMode === "login" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Logg inn
                    </button>
                    <button
                      onClick={() => { setAuthMode("signup"); setAuthError(null); }}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        authMode === "signup" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Ny konto
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-post</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="deg@eksempel.no"
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Passord</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="Minst 6 tegn"
                        autoComplete={authMode === "login" ? "current-password" : "new-password"}
                      />
                    </div>

                    {authError && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                        {authError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
                    >
                      {authLoading
                        ? "Venter…"
                        : authMode === "login"
                        ? `Logg inn og bli med i ${orgName}`
                        : `Registrer deg og bli med i ${orgName}`}
                    </button>
                  </form>
                </div>
              ) : null /* loading session check */}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p className="text-slate-700 font-semibold mb-1">Invitasjonen virker ikke</p>
      <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">{message}</p>
      <Link href="/" className="text-brand-600 text-sm hover:underline">Tilbake til forsiden</Link>
    </div>
  );
}
