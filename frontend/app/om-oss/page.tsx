import Image from "next/image";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const founder = {
  name: "Filip Gustavsen",
  role: "Grunder & Utvikler",
  photo: "/profil1.jpeg",
  bio: "Filip er selvlært utvikler med bakgrunn fra eiendomsbransjen i Kristiansand-regionen. Han bygger Bygghjerne for å samle det som i dag er spredt over mange systemer — driftsdokumenter, vedlikehold, arbeidsordre og prosjektportefølje — på ett sted, med AI som gjør informasjonen søkbar på norsk.",
};

const roadmap = [
  {
    phase: "Fase 1",
    title: "AI-assistent for bygningsdokumenter",
    status: "live",
    items: [
      "Last opp driftsdokumenter som PDF",
      "AI-chat som svarer fra dine egne dokumenter",
      "Norskspråklig søk og svar med kildehenvisninger",
      "Isolert per bygg og organisasjon",
    ],
  },
  {
    phase: "Fase 2",
    title: "CMMS — Drifts- og vedlikeholdsstyring",
    status: "live",
    items: [
      "Arbeidsordre med status, prioritet og ansvarlig",
      "Eiendelsregister med tilstandsanalyse og trendvisning",
      "Tilstandsrapporter og inspeksjonslogs",
      "Dashbord med KPI-er og aktivitetslogg",
    ],
  },
  {
    phase: "Fase 3",
    title: "Prosjektportefølje og kartvisning",
    status: "live",
    items: [
      "Porteføljeoversikt med BRA, enheter og investeringsvolum",
      "Kartvisning av alle prosjekter (Leaflet + fargekodet etter fase)",
      "Analyser per prosjekt: sol, støy, flomrisiko og fjernvirkning",
      "3D-prinsippmodell i nettleseren (Three.js, ingen plugins)",
      "Finanskalkulator og dokumentarkiv per prosjekt",
    ],
  },
  {
    phase: "Fase 4",
    title: "Unreal Engine / Pixel Streaming",
    status: "live",
    items: [
      "Infrastruktur for live 3D-visualisering via Unreal Engine",
      "Pixel Streaming direkte i nettleseren — ingen installasjon",
      "Konfigurer stream-URL og BIM-modell per prosjekt",
      "Automatisk fallback til Three.js-modell om stream ikke er aktiv",
    ],
  },
  {
    phase: "Fase 5",
    title: "Integrasjoner og automatisering",
    status: "planned",
    items: [
      "Støtte for Word og Excel i tillegg til PDF",
      "Automatiske påminnelser om vedlikeholdsfrister",
      "API mot BMS / SD-anlegg og FDV-systemer",
      "Automatisk rapportgenerering med AI",
    ],
  },
];

const statusStyle: Record<string, string> = {
  live: "bg-green-500/20 text-green-400",
  next: "bg-blue-500/20 text-blue-300",
  planned: "bg-white/10 text-white/40",
};

const statusLabel: Record<string, string> = {
  live: "Live nå",
  next: "Neste",
  planned: "Planlagt",
};

export default function OmOss() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <PublicNav active="om-oss" />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Ideen bak Bygghjerne</h1>
        <p className="text-lg leading-relaxed mb-4" style={{ color: "rgba(147,183,255,0.75)" }}>
          Bygghjerne er en samlet plattform for eiendomsforvaltere og eiendomsutviklere. Du får
          AI-assistent som svarer fra dine egne dokumenter, et komplett vedlikeholdssystem (CMMS),
          en prosjektportefølje med kartvisning og analyseverktøy — og støtte for live
          3D-visualisering via Unreal Engine Pixel Streaming.
        </p>
        <p className="text-lg leading-relaxed" style={{ color: "rgba(147,183,255,0.75)" }}>
          Alt på norsk, alt på ett sted — uten å måtte bytte mellom fem forskjellige systemer.
        </p>
      </section>

      {/* Feature overview */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: "💬",
              title: "AI-assistent",
              desc: "Last opp PDF-er og still spørsmål på norsk. Bygghjerne henter svar direkte fra dine egne driftsdokumenter med kildehenvisninger.",
            },
            {
              icon: "🔧",
              title: "CMMS",
              desc: "Opprett og følg opp arbeidsordre, registrer eiendeler og tekniske installasjoner, og få tilstandsanalyse med trendvisning.",
            },
            {
              icon: "🗺️",
              title: "Prosjektportefølje",
              desc: "Hold oversikt over alle utviklingsprosjekter på ett kart. Analyser sol, støy og flomrisiko per prosjekt med nøkkeltall og finanskalkulator.",
            },
            {
              icon: "🎮",
              title: "Unreal / 3D",
              desc: "Live 3D-visualisering via Unreal Engine Pixel Streaming direkte i nettleseren. Faller tilbake til Three.js-modell om stream ikke er aktiv.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
              <span className="text-3xl">{f.icon}</span>
              <p className="font-semibold text-white">{f.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="bg-navy-900 py-16 px-6">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-10">Mennesket bak</h2>
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 flex flex-col items-center gap-4">
            <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-white/20">
              <Image src={founder.photo} alt={founder.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold text-white text-lg">{founder.name}</p>
              <p className="text-sm font-medium text-coral-400">{founder.role}</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {founder.bio}
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Veikart</h2>
          <p className="text-center mb-10" style={{ color: "rgba(147,183,255,0.55)" }}>
            Hva vi har bygget og hva som kommer
          </p>
          <div className="flex flex-col gap-6">
            {roadmap.map((phase) => (
              <div key={phase.phase} className="border border-white/10 rounded-2xl p-6 bg-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[phase.status]}`}>
                    {statusLabel[phase.status]}
                  </span>
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {phase.phase}
                    </span>
                    <h3 className="font-semibold text-white">{phase.title}</h3>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          phase.status === "live" ? "bg-green-400" : "bg-white/20"
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-navy-900">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-coral-400">Kom i gang</p>
          <h2 className="text-3xl font-bold text-white">Klar til å prøve?</h2>
          <p className="max-w-md" style={{ color: "rgba(147,183,255,0.7)" }}>
            Last opp driftsdokumentene dine og still ditt første spørsmål — det tar under ett minutt.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ boxShadow: "0 0 24px rgba(255,94,61,0.3)" }}
          >
            Kom i gang gratis
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
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
