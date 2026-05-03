"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackendWakeup from "@/components/BackendWakeup";
import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";
import LogoutButton from "@/components/LogoutButton";
import { useBuilding } from "@/utils/building-context";
import { apiFetch } from "@/utils/api";

export default function Assistent() {
  const router = useRouter();
  const { buildingId, buildingName, loaded } = useBuilding();

  useEffect(() => {
    if (!loaded) return;
    apiFetch("/orgs/me").then(async (res) => {
      if (!res.ok) return;
      const org = await res.json();
      if (!org) {
        router.replace("/onboarding");
      } else if (!buildingId) {
        router.replace("/bygninger");
      }
    }).catch(() => {});
  }, [loaded, buildingId, router]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm">Laster…</p>
        </div>
      </div>
    );
  }

  if (!buildingId) return null;

  return (
    <BackendWakeup>
      <div className="min-h-screen flex flex-col">
        <header className="bg-brand-900 text-white px-6 py-4 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/bygninger" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <svg className="h-7 w-7 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Serv24</h1>
                <p className="text-xs text-brand-300">{buildingName ?? "AI-driftsassistent"}</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/bygninger" className="text-sm text-brand-300 hover:text-white transition-colors">
                Bytt bygg
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[360px_1fr] gap-6 min-h-0">
          <aside className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
            <DocumentUpload />
          </aside>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
            style={{ height: "calc(100vh - 140px)" }}>
            <ChatInterface />
          </section>
        </main>
      </div>
    </BackendWakeup>
  );
}
