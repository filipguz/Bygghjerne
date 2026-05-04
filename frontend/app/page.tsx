import ParticleCanvas from "@/components/ParticleCanvas";
import PublicNav from "@/components/PublicNav";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden"
        style={{ minHeight: "88vh" }}
      >
        <ParticleCanvas />

        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(147,183,255,0.22) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Bottom fade into features section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-navy-950 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span
              className="h-2 w-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: "#ff5e3d" }}
            />
            AI-drevet driftsassistent
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white max-w-3xl leading-tight mb-6 tracking-tight">
            Hele byggets kunnskap,<br />alltid tilgjengelig
          </h1>

          <p
            className="text-lg max-w-xl mb-10 leading-relaxed"
            style={{ color: "rgba(147,183,255,0.8)" }}
          >
            Last opp driftshåndbøker, tegninger og servicerapporter. Still spørsmål på norsk og få presise svar — basert på dine egne dokumenter.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/login"
              className="bg-coral-500 hover:bg-coral-600 px-8 py-4 rounded-xl text-base font-semibold text-white transition-colors"
              style={{ boxShadow: "0 0 28px rgba(255,94,61,0.35)" }}
            >
              Prøv gratis
            </Link>
            <Link
              href="/teknologi"
              className="px-8 py-4 rounded-xl text-base font-semibold text-white border border-white/25 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Se hvordan det fungerer
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-navy-900 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Hva Serv24 gjør for deg
          </h2>
          <p className="text-center mb-16" style={{ color: "rgba(147,183,255,0.55)" }}>
            Dokumentasjon som faktisk er tilgjengelig — for hele teamet
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,94,61,0.15)" }}
              >
                <svg className="h-5 w-5 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Last opp PDF</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(147,183,255,0.6)" }}>
                Driftshåndbøker, servicerapporter og tegninger — Serv24 leser og forstår dem.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,94,61,0.15)" }}
              >
                <svg className="h-5 w-5 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Still spørsmål på norsk</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(147,183,255,0.6)" }}>
                Spør om vedlikehold, serviceintervaller eller tekniske detaljer — få svar med kildehenvisning.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,94,61,0.15)" }}
              >
                <svg className="h-5 w-5 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Basert på dine dokumenter</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(147,183,255,0.6)" }}>
                AI-en svarer kun fra innholdet du har lastet opp — ingen gjetting eller generelle svar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="py-8 text-center text-sm"
        style={{
          backgroundColor: "#06091a",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        <div className="flex items-center justify-center gap-6">
          <span>© 2026 Serv24</span>
          <Link href="/om-oss" className="hover:text-white/60 transition-colors">Om oss</Link>
          <Link href="/teknologi" className="hover:text-white/60 transition-colors">Teknologi</Link>
        </div>
      </footer>
    </div>
  );
}
