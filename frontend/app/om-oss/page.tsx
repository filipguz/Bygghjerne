import Image from "next/image";
import Link from "next/link";

const founders = [
  {
    name: "Christian Widerø",
    role: "Grunder",
    photo: "/profil2.jpeg",
    bio: "Christian er serviceleder hos Bravida Norge og har i over fire år jobbet tett på drift og vedlikehold av store tekniske anlegg. Han kjenner utfordringene på kroppen — og bygget Bygghjerne for å løse dem.",
  },
  {
    name: "Filip Gustavsen",
    role: "Utvikler",
    photo: "/profil1.jpeg",
    bio: "Filip er selvlært utvikler med bakgrunn fra leirskole- og opplevelsesbransjen. Han vet hva det vil si å jobbe i felt med begrenset tid og ressurser — og bygger Bygghjerne slik at det faktisk fungerer for folk i den hverdagen.",
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
  live: "bg-green-100 text-green-700",
  next: "bg-brand-100 text-brand-700",
  planned: "bg-slate-100 text-slate-500",
};

const statusLabel: Record<string, string> = {
  live: "Live nå",
  next: "Neste",
  planned: "Planlagt",
};

export default function OmOss() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-bold text-brand-900 text-lg">Bygghjerne</span>
        </Link>
        <Link href="/assistent"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          Åpne appen
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Ideen bak Bygghjerne</h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Store bygg — svømmehaller, skoler, kommunale bygg — inneholder enorme mengder teknisk kunnskap.
          Driftshåndbøker, servicerapporter, tegninger og instrukser er spredt over hundrevis av filer,
          og den viktigste kunnskapen lever ofte bare i hodet på erfarne driftsoperatører.
        </p>
        <p className="text-lg text-slate-500 leading-relaxed mt-4">
          Når de slutter, forsvinner kunnskapen med dem. Bygghjerne er bygget for å fikse nettopp det —
          ved å gjøre all dokumentasjon søkbar og tilgjengelig for hele driftsteamet, på et naturlig norsk språk.
        </p>
      </section>

      {/* Founders */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">Menneskene bak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {founders.map((f) => (
              <div key={f.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4">
                <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-brand-100">
                  <Image src={f.photo} alt={f.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">{f.name}</p>
                  <p className="text-sm text-brand-600 font-medium">{f.role}</p>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{f.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Veikart</h2>
          <p className="text-slate-500 text-center mb-10">Hva vi har bygget og hva som kommer</p>
          <div className="flex flex-col gap-6">
            {roadmap.map((phase) => (
              <div key={phase.phase} className="border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[phase.status]}`}>
                    {statusLabel[phase.status]}
                  </span>
                  <div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{phase.phase}</span>
                    <h3 className="font-semibold text-slate-800">{phase.title}</h3>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${phase.status === "live" ? "bg-green-500" : "bg-slate-300"}`} />
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
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Kom i gang</p>
          <h2 className="text-3xl font-bold text-slate-900">Klar til å prøve?</h2>
          <p className="text-slate-500 max-w-md">
            Last opp driftsdokumentene dine og still ditt første spørsmål — det tar under ett minutt.
          </p>
          <Link href="/assistent"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm">
            Åpne Bygghjerne
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-slate-400">
        © 2026 Bygghjerne
      </footer>
    </div>
  );
}
