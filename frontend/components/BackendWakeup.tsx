"use client";

import { useEffect, useState } from "react";

export default function BackendWakeup({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setSlow(true); }, 2500);

    async function ping() {
      while (!cancelled) {
        try {
          const res = await fetch("/api/backend/health", { cache: "no-store" });
          if (res.ok) {
            clearTimeout(slowTimer);
            if (!cancelled) setReady(true);
            return;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    ping();
    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, []);

  if (ready) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <svg className="h-10 w-10 text-brand-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      {slow ? (
        <>
          <p className="text-slate-700 font-medium">Starter opp tjenesten…</p>
          <p className="text-sm text-slate-400 max-w-xs text-center">
            Dette kan ta opptil 60 sekunder etter inaktivitet. Vennligst vent.
          </p>
        </>
      ) : (
        <p className="text-slate-500 text-sm">Kobler til…</p>
      )}
    </div>
  );
}
