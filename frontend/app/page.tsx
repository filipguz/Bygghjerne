import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground";

// ── UI Mockups ───────────────────────────────────────────────────────────────

function AIChatMockup() {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
      style={{ backgroundColor: "#0a1128" }}>
      {/* Topbar */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
        </div>
        <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>AI-assistent</span>
      </div>
      {/* Document pill */}
      <div className="px-4 pt-4">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs mb-4"
          style={{ color: "rgba(147,183,255,0.7)" }}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Driftshåndbok-ventilasjon-2024.pdf
        </div>
      </div>
      {/* Messages */}
      <div className="px-4 pb-3 flex flex-col gap-3">
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] leading-relaxed">
            Hvor ofte skal ventilasjonsanlegget kontrolleres?
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-none w-6 h-6 rounded-full bg-coral-500/20 flex items-center justify-center mt-0.5">
            <svg className="h-3 w-3 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 text-xs rounded-2xl rounded-tl-sm px-3 py-2.5 leading-relaxed"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}>
            Ifølge driftshåndboken skal ventilasjonsanlegget gjennomgå full service hvert 6. måned og enkel filtersjekk månedlig.
            <div className="mt-2 flex items-center gap-1.5" style={{ color: "rgba(147,183,255,0.5)" }}>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              </svg>
              <span className="text-[10px]">Driftshåndbok s. 14</span>
            </div>
          </div>
        </div>
      </div>
      {/* Input */}
      <div className="px-4 pb-4 flex gap-2">
        <div className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)" }}>
          Skriv spørsmål til dokumentene…
        </div>
        <div className="w-8 h-8 rounded-xl bg-coral-500 flex items-center justify-center flex-none">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CMMSMockup() {
  const orders = [
    { title: "Ventilasjonsservice bygg A", prio: "Kritisk", dot: "bg-red-500" },
    { title: "Heisservice — kvartal 2",    prio: "Høy",     dot: "bg-amber-500" },
    { title: "Brannøvelse bygg B",         prio: "Medium",  dot: "bg-blue-500" },
    { title: "Utskifting av lysarmaturer", prio: "Lav",     dot: "bg-emerald-500" },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      {/* Top bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Dashboard</span>
        <span className="text-xs text-slate-400">Rådhuset, Kristiansand</span>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-px bg-slate-100">
        {[["14", "Åpne ordrer", "text-blue-600 bg-blue-50"],
          ["3",  "Forfalt",     "text-red-600 bg-red-50"],
          ["91%","Oppetid",    "text-emerald-600 bg-emerald-50"]].map(([val, label, cls]) => (
          <div key={label} className="bg-white px-4 py-3">
            <p className={`text-lg font-bold ${cls.split(" ")[0]}`}>{val}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      {/* Work order list */}
      <div className="divide-y divide-slate-100">
        {orders.map((o) => (
          <div key={o.title} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`flex-none w-2 h-2 rounded-full ${o.dot}`} />
              <span className="text-xs text-slate-700 truncate">{o.title}</span>
            </div>
            <span className="flex-none text-[10px] font-medium text-slate-400">{o.prio}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioMockup() {
  const projects = [
    { name: "Kvadraturen Kvartal", status: "Prosjektering", color: "#3b82f6", x: "42%", y: "38%" },
    { name: "Havnefront Vest",     status: "Regulering",    color: "#f59e0b", x: "31%", y: "55%" },
    { name: "Lund Terrasse",       status: "Salg",          color: "#10b981", x: "58%", y: "47%" },
    { name: "Slettheia Boligpark", status: "Mulighetsstudie", color: "#8b5cf6", x: "67%", y: "28%" },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      {/* Map area */}
      <div className="relative h-52 bg-slate-800 overflow-hidden">
        {/* Simplified map grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          {[20,40,60,80].map(p => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="white" strokeWidth="0.5" />
            </g>
          ))}
        </svg>
        {/* Simulated road lines */}
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,120 Q200,100 400,130" stroke="white" strokeWidth="3" fill="none" />
          <path d="M150,0 Q160,100 140,208" stroke="white" strokeWidth="2" fill="none" />
          <path d="M0,80 Q300,90 500,70" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
        {/* Project dots */}
        {projects.map((p) => (
          <div key={p.name} className="absolute" style={{ left: p.x, top: p.y, transform: "translate(-50%,-50%)" }}>
            <div className="relative group cursor-pointer">
              <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: p.color }} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block
                bg-white text-slate-800 text-[10px] font-medium px-2 py-1 rounded-lg shadow-xl whitespace-nowrap z-10">
                {p.name}
              </div>
            </div>
          </div>
        ))}
        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-2">
          {[["#8b5cf6","Mulighetsstudie"],["#f59e0b","Regulering"],["#3b82f6","Prosjektering"],["#10b981","Salg"]].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c as string }} />
              <span className="text-[9px] text-white/80">{l}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
        {[["4", "Prosjekter"], ["44 350", "m² BRA"], ["988", "MNOK"]].map(([val, label]) => (
          <div key={label} className="px-4 py-3 text-center">
            <p className="text-sm font-bold text-slate-900">{val}</p>
            <p className="text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: "Last opp PDF-dokumenter",
    desc: "Driftshåndbøker, servicerapporter, tegninger og FDV-dokumentasjon. Ingen begrensning på antall filer.",
  },
  {
    step: "02",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Still spørsmål på norsk",
    desc: "Skriv spørsmålet ditt som du ville spurt en erfaren kollega. Ingen søketermer eller kommandoer.",
  },
  {
    step: "03",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Få svar med kildehenvisning",
    desc: "Bygghjerne viser nøyaktig hvilke dokumenter og sider svaret er hentet fra. Aldri gjetninger.",
  },
];

const DEEP_FEATURES = [
  {
    tag: "AI-assistent",
    tagColor: "bg-violet-500/20 text-violet-300",
    headline: "Svar fra dine egne dokumenter — ikke fra internett",
    body: "Last opp driftshåndbøker, servicerapporter og tegningsbeskrivelser. Bygghjerne vektoriserer innholdet og lar deg stille spørsmål på norsk. Du ser alltid hvilke dokumenter svaret er hentet fra.",
    points: [
      "Norskspråklig søk og presise svar",
      "Kildehenvisninger med sidetall",
      "Isolert per bygg og organisasjon",
      "Støtte for teknisk fagterminologi",
    ],
    side: "left",
    mockup: <AIChatMockup />,
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
      "KPI-dashbord per bygg",
    ],
    side: "right",
    mockup: <CMMSMockup />,
  },
  {
    tag: "Prosjektportefølje",
    tagColor: "bg-blue-500/20 text-blue-300",
    headline: "Fra mulighetsstudie til salg — ett sted",
    body: "Følg hvert prosjekt gjennom fasene mulighetsstudie, regulering, prosjektering og salg. Se alle prosjekter på kart, analyser sol, støy og flomrisiko, og kalkuler lønnsomhet per prosjekt.",
    points: [
      "Porteføljeoversikt med nøkkeltall",
      "Analyse av sol, støy og flomrisiko",
      "Kartvisning av alle prosjekter",
      "Finanskalkulator og dokumentarkiv",
    ],
    side: "left",
    mockup: <PortfolioMockup />,
  },
];

const FEATURES = [
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
    desc: "Se alle eiendommer og prosjekter på interaktivt kart. Klikk deg inn på analyser uten å miste oversikten.",
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  },
];

const PILLARS = [
  {
    icon: "🇳🇴",
    title: "Alt på norsk",
    desc: "Grensesnitt, søk og AI-svar er tilpasset norsk fagspråk og norske bransjeforhold.",
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative w-full">
        <NeuralNetworkBackground />
        <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28 max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-200 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="h-2 w-2 rounded-full bg-coral-500 inline-block animate-pulse" />
            AI-drevet eiendomsforvaltning og -utvikling
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Slutt med fem systemer.{" "}
            <span style={{ color: "#ff5e3d" }}>Begynn med ett.</span>
          </h1>

          <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mb-10" style={{ color: "rgba(147,183,255,0.75)" }}>
            AI-assistent som svarer fra dine egne driftsdokumenter, komplett vedlikeholdssystem og
            prosjektportefølje med kartvisning — alt på norsk, i én plattform.
          </p>

          <div className="flex gap-4 flex-wrap justify-center mb-12">
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
              className="inline-flex items-center gap-2 border border-white/20 text-white/80 px-8 py-4 rounded-xl text-sm font-semibold hover:bg-white/8 transition-colors"
            >
              Se hva som er bygget
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              ["4", "moduler i ett system"],
              ["100%", "norskspråklig AI"],
              ["0", "installasjon nødvendig"],
              ["Gratis", "å komme i gang"],
            ].map(([val, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">{val}</span>
                <span className="text-sm" style={{ color: "rgba(147,183,255,0.5)" }}>{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── For hvem? ─────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ backgroundColor: "#09101f" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              emoji: "🏢",
              title: "Eiendomsforvaltere",
              items: ["AI søker i dine driftsdokumenter", "Arbeidsordre og eiendelsregister", "Vedlikeholdshistorikk og KPI-er"],
              cta: "For forvaltning",
            },
            {
              emoji: "🏗️",
              title: "Eiendomsutviklere",
              items: ["Prosjektportefølje med kartvisning", "Sol-, støy- og flomanalyser", "Finanskalkulator og dokumentarkiv"],
              cta: "For utvikling",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/8 p-6 flex flex-col gap-4"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{card.emoji}</span>
                <h3 className="font-semibold text-white text-lg">{card.title}</h3>
              </div>
              <ul className="flex flex-col gap-2">
                {card.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    <svg className="h-4 w-4 flex-none text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ──────────────────────────────────────────── */}
      <section className="bg-navy-900 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-coral-400 mb-3">Hva du får</p>
          <h2 className="text-3xl font-bold text-white text-center mb-12">Fire moduler. Én plattform.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
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

      {/* ── Slik fungerer AI-assistenten ──────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-coral-400 mb-3">AI-assistent</p>
          <h2 className="text-3xl font-bold text-white text-center mb-4">I gang på under ett minutt</h2>
          <p className="text-center mb-14 max-w-xl mx-auto" style={{ color: "rgba(147,183,255,0.6)" }}>
            Ingen oppsett, ingen integrering mot eksterne systemer. Last opp dokumentene dine og start å spørre.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-none w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,94,61,0.12)", color: "#ff8a6b" }}>
                    {step.icon}
                  </div>
                  <span className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.1)" }}>{step.step}</span>
                </div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(147,183,255,0.65)" }}>{step.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-6 -translate-x-3 z-10">
                    <svg className="h-5 w-5" style={{ color: "rgba(255,255,255,0.2)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deep feature sections ─────────────────────────────────── */}
      {DEEP_FEATURES.map((f, i) => (
        <section
          key={f.tag}
          className={`py-20 px-6 ${i % 2 === 1 ? "bg-navy-900" : ""}`}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className={`flex-1 ${f.side === "right" ? "md:order-2" : ""}`}>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${f.tagColor}`}>{f.tag}</span>
              <h2 className="text-2xl font-bold text-white mt-4 mb-4">{f.headline}</h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "rgba(147,183,255,0.7)" }}>{f.body}</p>
              <ul className="flex flex-col gap-2 mb-8">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-coral-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-coral-400 hover:text-coral-300 transition-colors"
              >
                Prøv gratis
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className={`flex-1 w-full ${f.side === "right" ? "md:order-1" : ""}`}>
              {f.mockup}
            </div>
          </div>
        </section>
      ))}

      {/* ── Pillars ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-navy-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Hvorfor Bygghjerne?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 text-center">
                <span className="text-4xl">{p.icon}</span>
                <p className="font-semibold text-white">{p.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-coral-400">Kom i gang</p>
          <h2 className="text-4xl font-bold text-white">Klar til å prøve?</h2>
          <p className="max-w-md text-lg" style={{ color: "rgba(147,183,255,0.7)" }}>
            Opprett en gratis konto, last opp ditt første dokument og still ditt første spørsmål. Det tar under ett minutt.
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
              Logg inn her
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 text-sm"
        style={{
          backgroundColor: "#06091a",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-semibold text-white/50">Bygghjerne</span>
            <span className="ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/om-oss" className="hover:text-white/60 transition-colors">Om oss</Link>
            <Link href="/teknologi" className="hover:text-white/60 transition-colors">Teknologi</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Logg inn</Link>
            <Link
              href="/login"
              className="border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-4 py-1.5 rounded-lg transition-colors text-xs font-medium"
            >
              Prøv gratis
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
