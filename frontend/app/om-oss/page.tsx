import Image from "next/image";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const founders = [
  {
    name: "Christian Widerø",
    role: "Grunder",
    photo: "/profil2.jpeg",
    bio: "Christian er serviceleder hos Bravida Norge og har i over fire år jobbet tett på drift og vedlikehold av store tekniske anlegg. Han kjenner utfordringene på kroppen — og bygget Serv24 for å løse dem.",
  },
  {
    name: "Filip Gustavsen",
    role: "Med-grunder & Utvikler",
    photo: "/profil1.jpeg",
    bio: "Filip er selvlært utvikler med bakgrunn fra leirskole- og opplevelsesbransjen. Han vet hva det vil si å jobbe i felt med begrenset tid og ressurser — og bygger Serv24 slik at det faktisk fungerer for folk i den hverdagen.",
  },
];

const roadmap = [
  {
    phase: "Fase 1",
    title: "MVP — Kunnskap i kjernen",
    status: "live",
    items: [
      "Last opp driftsdokumenter som PDF",
      "AI-chat som svarer fra dine egne dokumenter",
      "Dokumentoversikt med slettefunksjon",
      "Norskspråklig søk og svar",
    ],
  },
  {
    phase: "Fase 2",
    title: "Brukerkontoer og tilgangsstyring",
    status: "next",
    items: [
      "Innlogging med e-post",
      "Separate dokumentbaser per organisasjon",
      "Inviter kolleger til samme bygg",
      "Rollebasert tilgang (admin / leser)",
    ],
  },
  {
    phase: "Fase 3",
    title: "Smarte varsler og flere formater",
    status: "planned",
    items: [
      "Støtte for Word og Excel i tillegg til PDF",
      "Automatiske påminnelser om vedlikeholdsfrister",
      "Servicerapport-historikk per komponent",
      "Integrasjon med FDV-systemer",
    ],
  },
  {
    phase: "Fase 4",
    title: "Skalerbar plattform",
    status: "planned",
    items: [
      "Mobilvennlig app for driftsrunder",
      "Flerspråklig støtte",
      "API for integrasjon mot BMS / SD-anlegg",
      "Automatisk rapportgenerering",
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
        <h1 className="text-4xl font-bold text-white mb-4">Ideen bak Serv24</h1>
        <p className="text-lg leading-relaxed mb-4" style={{ color: "rgba(147,183,255,0.75)" }}>
          Store bygg — svømmehaller, skoler, kommunale bygg — inneholder enorme mengder teknisk kunnskap.
          Driftshåndbøker, servicerapporter, tegninger og instrukser er spredt over hundrevis av filer,
          og den viktigste kunnskapen lever ofte bare i hodet på erfarne driftsoperatører.
        </p>
        <p className="text-lg leading-relaxed" style={{ color: "rgba(147,183,255,0.75)" }}>
          Når de slutter, forsvinner kunnskapen med dem. Serv24 er bygget for å fikse nettopp det —
          ved å gjøre all dokumentasjon søkbar og tilgjengelig for hele driftsteamet, på et naturlig norsk språk.
        </p>
      </section>

      {/* Founders */}
      <section className="bg-navy-900 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Menneskene bak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {founders.map((f) => (
              <div
                key={f.name}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center gap-4"
              >
                <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-white/20">
                  <Image src={f.photo} alt={f.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{f.name}</p>
                  <p className="text-sm font-medium text-coral-400">{f.role}</p>
                </div>
              </div>
            ))}
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
            href="/assistent"
            className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ boxShadow: "0 0 24px rgba(255,94,61,0.3)" }}
          >
            Åpne Serv24
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
          <span>© 2026 Serv24</span>
          <Link href="/om-oss" className="hover:text-white/60 transition-colors">Om oss</Link>
          <Link href="/teknologi" className="hover:text-white/60 transition-colors">Teknologi</Link>
        </div>
      </footer>
    </div>
  );
}
