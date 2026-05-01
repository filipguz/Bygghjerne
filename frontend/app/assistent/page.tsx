import BackendWakeup from "@/components/BackendWakeup";
import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function Assistent() {
  return (
    <BackendWakeup>
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-900 text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <svg className="h-7 w-7 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Bygghjerne</h1>
              <p className="text-xs text-brand-300">AI-driftsassistent for bygget</p>
            </div>
          </Link>
          <LogoutButton />
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
