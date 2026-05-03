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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "joining" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/backend/orgs/invite/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Ugyldig lenke.");
        }
        return res.json();
      })
      .then((data) => setOrgName(data.org_name))
      .catch((e: unknown) => setFetchError(e instanceof Error ? e.message : "Ugyldig lenke."));

    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => setIsLoggedIn(!!session));
  }, [token]);

  async function handleJoin() {
    if (!token) return;
    setStatus("joining");
    setErrorMsg(null);
    try {
      const res = await apiFetch(`/orgs/join?token=${token}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Kunne ikke bli med.");
      }
      setStatus("done");
      setTimeout(() => router.push("/bygninger"), 1500);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Noe gikk galt.");
      setStatus("error");
    }
  }

  if (!token) {
    return <ErrorPage message="Mangler invitasjonstoken i lenken." />;
  }

  if (fetchError) {
    return <ErrorPage message={fetchError} />;
  }

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
        <div className="w-full max-w-sm text-center">
          {orgName === null ? (
            <p className="text-sm text-slate-400">Laster…</p>
          ) : status === "done" ? (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">Du er med!</h1>
              <p className="text-sm text-slate-500">Sender deg til byggene dine…</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
                <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Du er invitert!</h1>
              <p className="text-slate-500 mb-8 text-sm">
                Du er invitert til å bli med i <span className="font-semibold text-slate-800">{orgName}</span> på Serv24.
              </p>

              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
                  {errorMsg}
                </p>
              )}

              {isLoggedIn === false ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-500">Du må logge inn for å akseptere invitasjonen.</p>
                  <Link
                    href={`/login`}
                    className="bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors"
                  >
                    Logg inn / Registrer deg
                  </Link>
                </div>
              ) : isLoggedIn === true ? (
                <button
                  onClick={handleJoin}
                  disabled={status === "joining"}
                  className="w-full bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
                >
                  {status === "joining" ? "Blir med…" : `Bli med i ${orgName}`}
                </button>
              ) : null}
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
      <p className="text-slate-500 text-sm mb-4">{message}</p>
      <Link href="/" className="text-brand-600 text-sm hover:underline">Tilbake til forsiden</Link>
    </div>
  );
}