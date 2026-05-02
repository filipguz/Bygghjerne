"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/utils/api";

export default function Onboarding() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orgRes = await apiFetch("/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      if (!orgRes.ok) {
        const data = await orgRes.json();
        throw new Error(data.detail || "Kunne ikke opprette organisasjon.");
      }

      const buildingRes = await apiFetch("/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: buildingName, address: address || null }),
      });
      if (!buildingRes.ok) {
        const data = await buildingRes.json();
        throw new Error(data.detail || "Kunne ikke opprette bygg.");
      }

      router.push("/bygninger");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-6 py-5 flex items-center max-w-6xl mx-auto w-full">
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Kom i gang</h1>
          <p className="text-sm text-slate-500 text-center mb-8">
            Opprett din organisasjon og legg til ditt første bygg.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Organisasjon</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Navn på organisasjon</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="f.eks. Oslo Kommune"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Første bygg</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Navn på bygg</label>
                  <input
                    type="text"
                    required
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="f.eks. Rådhuset"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse <span className="text-slate-400">(valgfri)</span></label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="f.eks. Rådhusplassen 1, Oslo"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Oppretter…" : "Opprett og fortsett"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
