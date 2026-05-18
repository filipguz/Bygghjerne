import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const ragSteps = [
  {
    number: "01",
    title: "Du laster opp en PDF",
    description:
      "Bygghjerne-serveren leser PDF-en med pypdf og trekker ut all tekst. Støtter driftshåndbøker, servicerapporter, tegningsbeskrivelser, reguleringsplaner og andre tekniske dokumenter.",
    detail: "Filen lagres ikke i sin opprinnelige form — bare den ekstraherte teksten brukes videre.",
  },
  {
    number: "02",
    title: "Teksten deles opp i overlappende biter",
    description:
      "Teksten deles inn i biter på 1 000 tegn med 200 tegns overlapp. Overlappet sikrer at setninger og avsnitt ikke kuttes midt i en viktig sammenheng.",
    detail: "Et dokument på 10 sider gir typisk 30–60 tekstbiter.",
  },
  {
    number: "03",
    title: "Voyage AI lager vektorrepresentasjoner",
    description:
      "Hver tekstbit sendes til Voyage AI sin modell voyage-multilingual-2, som oversetter teksten til en tallvektor med 1 024 dimensjoner. Vektoren representerer tekstens mening — ikke bare ord.",
    detail: "voyage-multilingual-2 er trent på norsk og forstår fagterminologi fra bygningsdrift og eiendomsutvikling.",
  },
  {
    number: "04",
    title: "Vektorene lagres i Supabase pgvector",
    description:
      "Tekstbiter og vektorer lagres i PostgreSQL med pgvector-utvidelsen. IVFFlat-indeksering gjør cosinus-likhetssøk raskt selv med tusenvis av biter. Alle data er isolert per organisasjon.",
    detail: "Støtter dokumenter knyttet til både bygg (drift) og prosjekter (utvikling).",
  },
  {
    number: "05",
    title: "Spørsmålet ditt vektoriseres og matches",
    description:
      "Når du stiller et spørsmål, sendes det gjennom den samme Voyage AI-modellen. Spørsmålets vektor sammenlignes med alle lagrede biter via cosinus-likhet — kun fra ditt bygg eller prosjekt.",
    detail: "De 5 mest relevante bitene hentes ut og brukes som kontekst.",
  },
  {
    number: "06",
    title: "Claude svarer basert på dine dokumenter",
    description:
      "De relevante tekstbitene sendes som kontekst til Claude Sonnet. Claude instrueres til å svare kun fra konteksten, svare på norsk, og si tydelig fra hvis svaret ikke finnes i dokumentene.",
    detail: "Du ser alltid hvilke dokumenter svaret er hentet fra, med likhetsprosent per kilde.",
  },
];

const geodataSteps = [
  {
    number: "01",
    title: "Adressesøk med geokoding",
    description:
      "Når du oppretter et prosjekt, søker du etter adresse via Kartverkets adresse-API. Velger du et forslag fylles koordinater (lat/lng), by og kommunenavn automatisk inn.",
    detail: "Ingen manuell koordinatinntasting — adressen er kilden til sannhet.",
  },
  {
    number: "02",
    title: "Matrikkeloppslag fra Kartverket",
    description:
      "For hvert prosjekt med koordinater slår backend opp Kartverkets matrikkel-API med lat/lng. Kommunenavn, matrikkelnummer (gnr/bnr), matrikkelenhetstype og tomteareal hentes automatisk.",
    detail: "Data vises i Oversikt-fanen på prosjektsiden og oppdateres i sanntid.",
  },
  {
    number: "03",
    title: "Reguleringsplaner fra Geonorge WFS",
    description:
      "Backend spør Geonorge WFS arealplaner2 med en BBOX rundt prosjektets koordinater. Returnerer reguleringsplaner innenfor ~500 m med plannavn, plantype, planstatus og ikrafttredelsesdato.",
    detail: "Detaljreguleringer vises øverst. Planstatus fargekodet: grønn = vedtatt, gul = under behandling.",
  },
  {
    number: "04",
    title: "WMS-overlay på kartet",
    description:
      "I kartvisningen kan du slå på Geonorge WMS-laget «reguleringsplanomrade». Dette legger faktiske reguleringssonegrenser som halvgjennomsiktig overlay oppå basemapet.",
    detail: "Knappen «Reguleringsplaner» øverst til høyre i kartet skrur laget av og på.",
  },
];

const stack = [
  {
    name: "Anthropic Claude",
    model: "claude-sonnet-4-6",
    role: "Språkmodell",
    description:
      "Claude formulerer svar i dokumentassistenten og eiendomschatten. Får kun relevante dokumentutdrag som kontekst og instrueres til å ikke svare utenfor disse.",
    color: "bg-orange-500/10 border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-300",
  },
  {
    name: "Voyage AI",
    model: "voyage-multilingual-2",
    role: "Embedding",
    description:
      "Konverterer tekst til 1 024-dimensjonale vektorer. Trent på norsk og forstår fagterminologi fra bygg, drift og eiendomsutvikling.",
    color: "bg-violet-500/10 border-violet-500/20",
    badge: "bg-violet-500/20 text-violet-300",
  },
  {
    name: "Supabase",
    model: "PostgreSQL + pgvector",
    role: "Database og auth",
    description:
      "Lagrer alle dokumentbiter, vektorer, prosjekter, enheter, eiendeler og arbeidsordre. Row Level Security sørger for full isolasjon per organisasjon på databasenivå.",
    color: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
  {
    name: "Kartverket",
    model: "Adresse-API · Matrikkel-API",
    role: "Eiendomsdata",
    description:
      "Kartverkets åpne APIer brukes til adresseautofyll med geokoding og matrikkeloppslag (gnr/bnr, tomteareal, kommunenavn) basert på koordinater.",
    color: "bg-red-500/10 border-red-500/20",
    badge: "bg-red-500/20 text-red-300",
  },
  {
    name: "Geonorge",
    model: "WFS arealplaner2 · WMS",
    role: "Reguleringsdata",
    description:
      "Geonorge WFS henter reguleringsplaner rundt et prosjekt. WMS-laget «reguleringsplanomrade» vises som kartoverlay og gir visuell oversikt over soneplaner.",
    color: "bg-green-500/10 border-green-500/20",
    badge: "bg-green-500/20 text-green-300",
  },
  {
    name: "FastAPI",
    model: "Python 3.11 · httpx",
    role: "Backend-API",
    description:
      "Alle operasjoner — embedding, søk, CRUD og eksternt API-kall — går gjennom FastAPI med autentiserings- og tilgangsstyring på hvert endepunkt. ~50 endepunkter totalt.",
    color: "bg-cyan-500/10 border-cyan-500/20",
    badge: "bg-cyan-500/20 text-cyan-300",
  },
  {
    name: "Next.js",
    model: "v16 · App Router",
    role: "Frontend",
    description:
      "Grensesnittet er bygget med Next.js App Router, Tailwind CSS og Framer Motion. Dynamiske importer sikrer at Three.js og Leaflet kun lastes ved behov.",
    color: "bg-slate-500/10 border-slate-500/20",
    badge: "bg-slate-500/20 text-slate-300",
  },
  {
    name: "Three.js",
    model: "WebGL · r170",
    role: "3D-visualisering",
    description:
      "Prosjektsiden viser en roterbar 3D-prinsippmodell generert fra prosjektdata (etasjer og BRA). Kjører direkte i nettleseren via WebGL — ingen plugins.",
    color: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-300",
  },
  {
    name: "Leaflet",
    model: "react-leaflet · CartoDB + Geonorge WMS",
    role: "Kartvisning",
    description:
      "Interaktivt kart med prosjektmarkører fargekodet etter fase. Støtter WMS-overlay fra Geonorge for reguleringssonegrenser og automatisk tilpasning til prosjektenes koordinater.",
    color: "bg-teal-500/10 border-teal-500/20",
    badge: "bg-teal-500/20 text-teal-300",
  },
];

const modules = [
  {
    tag: "Drift og forvaltning",
    tagColor: "bg-cyan-500/20 text-cyan-300",
    items: [
      { title: "Dashboard", desc: "KPI-er per bygg: eiendeler, åpne arbeidsordre og forfalt vedlikehold — alt på ett blikk." },
      { title: "Eiendelsregister", desc: "Registrer tekniske installasjoner med kategori, tilstand og vedlikeholdsintervall. Tilstandstrend og mønsteranalyse over tid." },
      { title: "Arbeidsordre", desc: "Opprett og tildel oppgaver med prioritet (lav / medium / høy / kritisk), forfallsdato, ansvarlig og status." },
      { title: "Tilstandsrapporter", desc: "Logg inspeksjoner og tilstandsvurderinger per eiendel. Fullstendig historikk med score 1–5." },
      { title: "AI-dokumentassistent", desc: "Last opp PDF-er og still spørsmål på norsk. Svar med kildehenvisninger fra dine egne dokumenter via RAG." },
      { title: "Team og invitasjon", desc: "Multi-bygg per org. Administrer roller (admin/member) og inviter kollegaer via lenke med 7 dagers gyldighet." },
    ],
  },
  {
    tag: "Eiendomsutvikling",
    tagColor: "bg-blue-500/20 text-blue-300",
    items: [
      { title: "Prosjektportefølje", desc: "Oversikt over alle prosjekter med KPI-er: total BRA, enheter, samlet investering og faseprogresjon." },
      { title: "Boligvelger", desc: "Interaktiv etasjevis enhetsvelger med status ledig / reservert / solgt. Klikk enhet for detaljer, pris og rask statusbytte." },
      { title: "Kartverket-integrasjon", desc: "Adresseautofyll med automatisk geokoding. Matrikkeldata (gnr/bnr, kommunenavn, tomteareal) hentes direkte fra Kartverket." },
      { title: "Geonorge reguleringsdata", desc: "Reguleringsplaner innen 500 m hentes fra Geonorge WFS. Kart-overlay viser faktiske sonegrenser fra Geonorge WMS." },
      { title: "Analysescorer", desc: "Score per prosjekt for solforhold, støy, flomrisiko og fjernvirkning — i liste, radardiagram og kartpanel." },
      { title: "3D-bygningsmodell og finanskalkulator", desc: "Roterbar WebGL-modell fra prosjektdata. Finanskalkulator med justerbare parametre for pris, byggekost og avkastning." },
    ],
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
        <h1 className="text-4xl font-bold text-white mb-4">Slik fungerer Bygghjerne</h1>
        <p className="text-lg leading-relaxed" style={{ color: "rgba(147,183,255,0.75)" }}>
          Bygghjerne kombinerer AI-drevet dokumentsøk, offentlige eiendomsdata fra Kartverket og Geonorge,
          og interaktive visualiseringer i én plattform — for både daglig bygnindrift og eiendomsutvikling.
        </p>
      </section>

      {/* RAG Pipeline */}
      <section className="bg-navy-900 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            AI-dokumentassistent
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Fra PDF til presist svar</h2>
          <p className="mb-12 text-sm" style={{ color: "rgba(147,183,255,0.55)" }}>
            Retrieval-Augmented Generation — seks steg fra opplasting til svar forankret i dine egne dokumenter
          </p>

          <div className="flex flex-col gap-6">
            {ragSteps.map((step) => (
              <div key={step.number} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#ff5e3d" }}>
                    <span className="text-white text-xs font-bold">{step.number}</span>
                  </div>
                  <div className="w-px flex-1 mt-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                </div>
                <div className="pb-8 min-w-0">
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>{step.description}</p>
                  <p className="text-xs rounded-lg px-3 py-2 inline-block bg-white/5 border border-white/10" style={{ color: "rgba(147,183,255,0.6)" }}>
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geodata Pipeline */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Offentlige eiendomsdata
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Fra koordinat til reguleringsplan</h2>
          <p className="mb-12 text-sm" style={{ color: "rgba(147,183,255,0.55)" }}>
            Kartverket og Geonorge er åpne, norske APIer — ingen API-nøkkel kreves
          </p>

          <div className="flex flex-col gap-6">
            {geodataSteps.map((step) => (
              <div key={step.number} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#22c55e" }}>
                    <span className="text-white text-xs font-bold">{step.number}</span>
                  </div>
                  <div className="w-px flex-1 mt-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                </div>
                <div className="pb-8 min-w-0">
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>{step.description}</p>
                  <p className="text-xs rounded-lg px-3 py-2 inline-block bg-white/5 border border-white/10" style={{ color: "rgba(147,183,255,0.6)" }}>
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-navy-900 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Hva du kan gjøre</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "rgba(147,183,255,0.55)" }}>
            To moduler — én plattform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modules.map((mod) => (
              <div key={mod.tag}>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${mod.tagColor} inline-block mb-5`}>
                  {mod.tag}
                </span>
                <div className="flex flex-col gap-4">
                  {mod.items.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-coral-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Teknologistakken</h2>
          <p className="text-center mb-10 text-sm" style={{ color: "rgba(147,183,255,0.55)" }}>
            Verktøyene Bygghjerne er bygget på
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stack.map((s) => (
              <div key={s.name} className={`rounded-2xl border p-5 ${s.color}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-white">{s.name}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.model}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>{s.role}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{s.description}</p>
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
            Dine dokumenter og prosjektdata tilhører deg
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: "Isolert per organisasjon",
                body: "Row Level Security i Supabase sørger for at ingen andre organisasjoner kan lese dine dokumenter, prosjekter eller enheter — hverken via frontend eller direkte databasetilgang.",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
              },
              {
                title: "Validert på hvert kall",
                body: "Alle API-kall verifiserer at innlogget bruker tilhører den organisasjonen som eier ressursen. Det er ikke mulig å hente data fra et annet prosjekt eller bygg ved å endre en URL-parameter.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                title: "Ikke brukt til AI-trening",
                body: "Dokumentene og samtalene dine brukes ikke til å trene opp AI-modellene. Innholdet sendes kun som kontekst for den aktuelle forespørselen, og lagres ikke hos Anthropic eller Voyage AI.",
                icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
              },
            ].map(({ title, body, icon }) => (
              <div key={title} className="flex flex-col gap-2">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm">{title}</h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-white">Klar til å prøve?</h2>
          <p className="max-w-md" style={{ color: "rgba(147,183,255,0.7)" }}>
            Opprett et prosjekt, søk opp adressen og se reguleringsplaner og matrikkledata automatisk hentes inn — eller last opp et dokument og still ditt første spørsmål.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ boxShadow: "0 0 24px rgba(255,94,61,0.3)" }}
            >
              Kom i gang
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
        style={{ backgroundColor: "#06091a", borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
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
