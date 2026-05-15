import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    title: "AI-assistent",
    desc: "Still spørsmål til dine egne driftsdokumenter på norsk. Svar med kildehenvisninger — aldri gjetninger.",
    color: "bg-violet-500/10 border-violet-500/20 text-violet-300",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "CMMS",
    desc: "Arbeidsordre, eiendelsregister og vedlikeholdslogg samlet på ett sted. Aldri igjen tapt historikk.",
    color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Prosjektportefølje",
    desc: "Oversikt over alle prosjekter med nøkkeltall, analyseverktøy og dokumentarkiv per prosjekt.",
    color: "bg-blue-500/10 border-blue-500/20 text-blue-300",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
      </svg>
    ),
    title: "Kartvisning",
    desc: "Se alle eiendommer og prosjekter på kart. Klikk deg inn på detaljer uten å miste oversikten.",
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  },
];

const deepFeatures = [
  {
    tag: "AI-assistent",
    tagColor: "bg-violet-500/20 text-violet-300",
    headline: "Svar fra dine egne dokumenter — ikke fra internett",
    body: "Last opp driftshåndbøker, servicerapporter og tegningsbeskrivelser som PDF. Bygghjerne vektoriserer innholdet og lar deg stille spørsmål på norsk. Du ser alltid hvilke dokumenter svaret er hentet fra.",
    points: [
      "Norskspråklig søk og svar",
      "Kildehenvisninger med relevansgrad",
      "Isolert per bygg og organisasjon",
      "Støtte for teknisk fagterminologi",
    ],
    side: "left",
  },
  {
    tag: "CMMS",
    tagColor: "bg-cyan-500/20 text-cyan-300",
    headline: "Full kontroll på drift og vedlikehold",
    body: "Opprett arbeidsordre med status, prioritet og ansvarlig. Registrer tekniske installasjoner i eiendelsregisteret og logg tilstand over tid. Dashbordet gir deg KPI-er og åpne saker på ett blikk.",
    points: [
      "Arbeidsordre med prioritet og ansvarlig",
      "Eiendelsregister med tilstandsanalyse",
      "Historikk og inspeksjonslogs",
      "KPI-dashbord",
    ],
    side: "right",
  },
  {
    tag: "Prosjektportefølje",
    tagColor: "bg-blue-500/20 text-blue-300",
    headline: "Fra mulighetsstudie til salg — ett sted",
    body: "Følg hvert prosjekt gjennom fasene mulighetsstudie, regulering, prosjektering og salg. Analyser sol, støy og flomrisiko. Last opp dokumenter og chat med AI direkte på prosjektet.",
    points: [
      "Porteføljeoversikt med nøkkeltall",
      "Analyse av sol, støy og flom",
      "Kartvisning av alle prosjekter",
      "Dokumentopplasting og AI-chat per prosjekt",
    ],
    side: "left",
  },
];

const pillars = [
  {
    icon: "🇳🇴",
    title: "Alt på norsk",
    desc: "Grensesnitt, søk og AI-svar er tilpasset norsk fagspråk og norske forhold.",
  },
  {
    icon: "🔗",
    title: "Ett sted for alt",
    desc: "AI-assistent, CMMS og prosjektportefølje i én plattform. Ingen rundturer mellom systemer.",
  },
  {
    icon: "🔒",
    title: "Sikkert og isolert",
    desc: "Row Level Security i databasen sørger for at ingen andre kan se dine dokumenter eller data.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-20 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="h-2 w-2 rounded-full bg-coral-500 inline-block animate-pulse" />
          AI-drevet eiendomsforvaltning
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Et system for alt —{" "}
          <span style={{ color: "#ff5e3d" }}>bygget for norsk eiendom</span>
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mb-10" style={{ color: "rgba(147,183,255,0.75)" }}>
          AI-assistent som svarer fra dine egne dokumenter, komplett vedlikeholdssystem og
          prosjektportefølje med kartvisning — alt på norsk, alt på ett sted.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white px-8 py-4 rounded-xl text-sm font-semibold transition-colors"
            style={{ boxShadow: "0 0 32px rgba(255,94,61,0.35)" }}
          >
            Kom i gang gratis
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/om-oss"
            className="inline-flex items-center gap-2 border border-white/25 text-white px-8 py-4 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Les mer
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-navy-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-coral-400 mb-3">
            Hva du får
          </p>
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Fire moduler. Én plattform.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border p-6 flex flex-col gap-4 ${f.color}`}
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${f.color}`}
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">{f.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep feature sections */}
      {deepFeatures.map((f, i) => (
        <section
          key={f.tag}
          className={`py-20 px-6 ${i % 2 === 1 ? "bg-navy-900" : ""}`}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            {/* Text */}
            <div className={`flex-1 ${f.side === "right" ? "md:order-2" : ""}`}>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${f.tagColor}`}>
                {f.tag}
              </span>
              <h2 className="text-2xl font-bold text-white mt-4 mb-4">{f.headline}</h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "rgba(147,183,255,0.7)" }}>
                {f.body}
              </p>
              <ul className="flex flex-col gap-2">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-coral-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual placeholder */}
            <div className={`flex-1 ${f.side === "right" ? "md:order-1" : ""}`}>
              <div
                className="rounded-2xl border border-white/10 aspect-video flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <div className="text-center">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-3 ${f.tagColor}`}
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>Skjermbilde kommer</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Pillars */}
      <section className="py-20 px-6 bg-navy-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Hvorfor Bygghjerne?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 text-center">
                <span className="text-4xl">{p.icon}</span>
                <p className="font-semibold text-white">{p.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-coral-400">Kom i gang</p>
          <h2 className="text-4xl font-bold text-white">Klar til å prøve?</h2>
          <p className="max-w-md text-lg" style={{ color: "rgba(147,183,255,0.7)" }}>
            Opprett en gratis konto og last opp ditt første dokument — det tar under ett minutt.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white px-8 py-4 rounded-xl text-sm font-semibold transition-colors"
            style={{ boxShadow: "0 0 32px rgba(255,94,61,0.35)" }}
          >
            Registrer deg gratis
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Har du allerede konto?{" "}
            <Link href="/login" className="hover:text-white/60 transition-colors underline underline-offset-2">
              Logg inn
            </Link>
          </p>
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
          <span>© 2026 Bygghjerne</span>
          <Link href="/om-oss" className="hover:text-white/60 transition-colors">Om oss</Link>
          <Link href="/teknologi" className="hover:text-white/60 transition-colors">Teknologi</Link>
        </div>
      </footer>
    </div>
  );
}
