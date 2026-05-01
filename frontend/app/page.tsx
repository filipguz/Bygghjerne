import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-bold text-brand-900 text-lg">Bygghjerne</span>
        </div>
        <Link
          href="/assistent"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Åpne appen
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="h-2 w-2 rounded-full bg-brand-500 inline-block"></span>
          AI-drevet driftsassistent
        </div>

        <h1 className="text-5xl font-bold text-slate-900 max-w-2xl leading-tight mb-6">
          Hele byggets kunnskap,<br />alltid tilgjengelig
        </h1>

        <p className="text-lg text-slate-500 max-w-xl mb-10">
          Last opp driftshåndbøker, tegninger og servicerapporter. Still spørsmål på norsk og få presise svar — basert på dine egne dokumenter.
        </p>

        <Link
          href="/assistent"
          className="bg-brand-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-brand-700 transition-colors shadow-sm"
        >
          Kom i gang gratis
        </Link>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800">Last opp PDF</h3>
            <p className="text-sm text-slate-500">Driftshåndbøker, servicerapporter og tegninger — Bygghjerne leser og forstår dem.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800">Still spørsmål på norsk</h3>
            <p className="text-sm text-slate-500">Spør om vedlikehold, serviceintervaller eller tekniske detaljer — få svar med kildehenvisning.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-800">Basert på dine dokumenter</h3>
            <p className="text-sm text-slate-500">AI-en svarer kun fra innholdet du har lastet opp — ingen gjetting eller generelle svar.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400">
        © 2026 Bygghjerne
      </footer>
    </div>
  );
}
