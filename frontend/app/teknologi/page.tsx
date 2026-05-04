import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const steps = [
  {
    number: "01",
    title: "Du laster opp en PDF",
    description:
      "Serv24-serveren leser PDF-en med pypdf og trekker ut all tekst. Filen lagres ikke i sin opprinnelige form — bare teksten brukes videre.",
    detail: "Støtter driftshåndbøker, servicerapporter, tegningsbeskrivelser og andre tekniske dokumenter.",
  },
  {
    number: "02",
    title: "Teksten deles opp i biter",
    description:
      "Teksten deles inn i overlappende biter på 1 000 tegn med 200 tegns overlapp mellom hver bit. Overlappet sikrer at setninger og avsnitt ikke kuttes midt i en viktig sammenheng.",
    detail: "Et dokument på 10 sider gir typisk 30–60 tekstbiter.",
  },
  {
    number: "03",
    title: "Voyage AI lager vektorrepresentasjoner",
    description:
      "Hver tekstbit sendes til Voyage AI sin modell voyage-multilingual-2, som oversetter teksten til en tallvektor med 1 024 dimensjoner. Vektoren representerer tekstens mening — ikke bare ord.",
    detail: "voyage-multilingual-2 er trent på norsk og forstår fagterminologi fra bygningsdrift.",
  },
  {
    number: "04",
    title: "Vektorene lagres i Supabase",
    description:
      "Tekstbiter og vektorer lagres i PostgreSQL med pgvector-utvidelsen. Alle data er knyttet til ditt bygg og din organisasjon — ingen andre kan se dem.",
    detail: "IVFFlat-indeksering gjør cosinus-likhetssøk raskt selv med tusenvis av biter.",
  },
  {
    number: "05",
    title: "Spørsmålet ditt vektoriseres",
    description:
      "Når du stiller et spørsmål, sendes det gjennom den samme Voyage AI-modellen. Spørsmålets vektor sammenlignes med alle lagrede biter ved hjelp av cosinus-likhet.",
    detail: "De 5 mest relevante bitene hentes ut — kun fra ditt bygg.",
  },
  {
    number: "06",
    title: "Claude svarer basert på dine dokumenter",
    description:
      "De relevante tekstbitene sendes som kontekst til Anthropic Claude Sonnet. Claude får en klar instruks: svar kun fra det som finnes i konteksten, svar på norsk, og si tydelig fra hvis svaret ikke finnes.",
    detail: "Du ser alltid hvilke dokumenter svaret er hentet fra.",
  },
];

const stack = [
  {
    name: "Anthropic Claude",
    model: "claude-sonnet-4-6",
    role: "Språkmodell",
    description:
      "Claude er ansvarlig for å formulere svar. Den får kun de relevante dokumentutdragene som kontekst og instrueres til å ikke svare utenfor disse.",
    color: "bg-orange-500/10 border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-300",
  },
  {
    name: "Voyage AI",
    model: "voyage-multilingual-2",
    role: "Embedding-modell",
    description:
      "Voyage AI konverterer tekst til vektorer. Modellen er trent på mange språk inkludert norsk, og forstår faglig terminologi fra bygg og teknisk drift.",
    color: "bg-violet-500/10 border-violet-500/20",
    badge: "bg-violet-500/20 text-violet-300",
  },
  {
    name: "Supabase",
    model: "PostgreSQL + pgvector",
    role: "Database og auth",
    description:
      "Supabase lagrer alle dokumentbiter, vektorer, brukere og organisasjoner. Row Level Security (RLS) sørger for at data er isolert per organisasjon på databasenivå.",
    color: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
  {
    name: "FastAPI",
    model: "Python 3.12",
    role: "Backend-API",
    description:
      "Alle operasjoner — opplasting, embedding, søk og chat — går gjennom et FastAPI-backend som validerer autentisering og tilgangsstyring på hvert kall.",
    color: "bg-cyan-500/10 border-cyan-500/20",
    badge: "bg-cyan-500/20 text-cyan-300",
  },
];

export default function Teknologi() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <PublicNav active="teknologi" />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="h-2 w-2 rounded-full bg-coral-500 inline-block" />
          Under panseret
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Slik fungerer Serv24</h1>
        <p className="text-lg leading-relaxed" style={{ color: "rgba(147,183,255,0.75)" }}>
          Serv24 bruker en teknikk kalt RAG — Retrieval-Augmented Generation. I stedet for å la AI-en gjette,
          henter vi de relevante utdragene fra dine egne dokumenter og gir dem som kontekst til Claude.
          Svaret er alltid forankret i det du har lastet opp.
        </p>
      </section>

      {/* Pipeline */}
      <section className="bg-navy-900 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Fra PDF til svar</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "rgba(147,183,255,0.55)" }}>
            Seks steg fra opplasting til presist svar
          </p>

          <div className="flex flex-col gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#ff5e3d" }}
                  >
                    <span className="text-white text-xs font-bold">{step.number}</span>
                  </div>
                  <div className="w-px flex-1 mt-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                </div>
                <div className="pb-8 min-w-0">
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {step.description}
                  </p>
                  <p
                    className="text-xs rounded-lg px-3 py-2 inline-block bg-white/5 border border-white/10"
                    style={{ color: "rgba(147,183,255,0.6)" }}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Teknologistakken</h2>
          <p className="text-center mb-10 text-sm" style={{ color: "rgba(147,183,255,0.55)" }}>
            Verktøyene Serv24 er bygget på
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stack.map((s) => (
              <div key={s.name} className={`rounded-2xl border p-6 ${s.color}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {s.model}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>
                    {s.role}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-navy-900 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Sikkerhet og personvern</h2>
          <p className="text-center mb-10 text-sm" style={{ color: "rgba(147,183,255,0.55)" }}>
            Dine dokumenter tilhører deg
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-sm">Isolert per organisasjon</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Row Level Security i Supabase sørger for at ingen andre organisasjoner kan lese eller søke i dine dokumenter — hverken via frontend eller direkte databasetilgang.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-sm">Validert på hvert kall</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Alle API-kall verifiserer at innlogget bruker tilhører den organisasjonen som eier bygget. Det er ikke mulig å hente data fra et annet bygg ved å endre en URL-parameter.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="font-semibold text-white text-sm">Ikke brukt til AI-trening</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Dokumentene og samtalene dine brukes ikke til å trene opp AI-modellene. Innholdet sendes kun som kontekst for den aktuelle forespørselen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-white">Klar til å prøve?</h2>
          <p className="max-w-md" style={{ color: "rgba(147,183,255,0.7)" }}>
            Last opp driftsdokumentene dine og still ditt første spørsmål — det tar under ett minutt å komme i gang.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ boxShadow: "0 0 24px rgba(255,94,61,0.3)" }}
            >
              Prøv gratis
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/om-oss"
              className="inline-flex items-center gap-2 border border-white/25 text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Les om oss
            </Link>
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
