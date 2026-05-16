# Bygghjerne

AI-drevet plattform for eiendomsforvaltning og eiendomsutvikling. To moduler i ett system: et komplett drifts- og vedlikeholdssystem (CMMS) med AI-assistent, og en prosjektportefølje for utviklingsprosjekter med kartvisning og analyseverktøy.

---

## Funksjoner

### Drift og forvaltning

| Funksjon | Beskrivelse |
|---|---|
| **AI-dokumentassistent** | Last opp PDF-er (driftshåndbøker, servicerapporter, tegninger). Still spørsmål på norsk og få svar med kildehenvisninger. |
| **Dashboard** | KPI-er per bygg: antall eiendeler, åpne arbeidsordre, forfalt vedlikehold og aktivitetslogg. |
| **Eiendelsregister** | Registrer tekniske installasjoner med kategori, tilstand og neste vedlikeholdsdato. Tilstandstrend og mønsteranalyse over tid. |
| **Arbeidsordre** | Opprett, tildel og følg opp oppgaver med prioritet (lav / medium / høy / kritisk), forfallsdato og status. |
| **Tilstandsrapporter** | Logg inspeksjoner og tilstandsvurderinger per eiendel. |
| **Bygg og organisasjon** | Multi-bygg per organisasjon. Administrer team med roller (admin / medlem) og inviter kollegaer via lenke. |

### Eiendomsutvikling

| Funksjon | Beskrivelse |
|---|---|
| **Prosjektportefølje** | Oversikt over alle utviklingsprosjekter med KPI-er: total BRA, antall enheter, samlet investering. |
| **Prosjektfaser** | Følg hvert prosjekt gjennom fasene mulighetsstudie → regulering → prosjektering → salg. |
| **Analyser** | Score per prosjekt for solforhold, støy, flomrisiko og fjernvirkning. |
| **Kartvisning** | Alle prosjekter på interaktivt kart (Leaflet + OpenStreetMap). Klikk for detaljer og analyser direkte i kartet. |
| **3D-bygningsmodell** | Three.js-basert prinsippmodell generert fra prosjektdata (etasjer, BRA). Roterbar og zoombar i nettleseren — ingen plugins nødvendig. |
| **Finanskalkulator** | Kalkuler lønnsomhet med justerbare parametre for pris per kvm, byggekostnad, tomtekostnad og rentabilitet. |
| **Dokumentarkiv per prosjekt** | Last opp PDF-er og chat med AI direkte om det aktuelle prosjektet. |
| **Søk og filtrering** | Filtrer prosjekter på status, by og fritekst. Kommandopanel (⌘K) for rask navigering. |

---

## Arkitektur

```
frontend/    Next.js 16 (App Router) + Tailwind CSS
backend/     Python FastAPI
database     Supabase (PostgreSQL + pgvector)
AI (chat)    Anthropic claude-sonnet-4-6
AI (embed)   Voyage AI voyage-multilingual-2
3D           Three.js (WebGL, ingen plugins)
Kart         Leaflet + CartoDB dark tiles
Deploy       Render (Docker, ett container)
```

### Mappeoversikt

```
Bygghjerne/
├── backend/
│   ├── main.py              # FastAPI-app, alle endepunkter
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js App Router-sider
│   │   ├── hjem/            # Valgside etter innlogging
│   │   ├── dashboard/       # Driftsoversikt per bygg
│   │   ├── bygninger/       # Bygg-administrasjon
│   │   ├── eiendeler/       # Eiendelsregister
│   │   ├── arbeidsordre/    # Arbeidsordre
│   │   ├── rapporter/       # Tilstandsrapporter
│   │   ├── assistent/       # AI-dokumentassistent
│   │   ├── prosjekter/      # Prosjektportefølje
│   │   ├── projects/[id]/   # Prosjektdetaljer
│   │   ├── map/             # Kartvisning
│   │   ├── innstillinger/   # Team og organisasjon
│   │   ├── login/           # Innlogging og registrering
│   │   ├── onboarding/      # Oppsett av organisasjon
│   │   └── join/            # Bli med via invitasjon
│   ├── components/          # Delte komponenter
│   └── utils/               # API-klient, mock-data, Supabase
├── supabase/
│   └── schema.sql           # Tabeller, indekser, RPC-funksjoner
├── Dockerfile
├── render.yaml
└── start.sh
```

---

## Kom i gang (lokalt)

### Forutsetninger

- Node.js 20+
- Python 3.11+
- Et [Supabase](https://supabase.com)-prosjekt
- En [Anthropic](https://console.anthropic.com) API-nøkkel
- En [Voyage AI](https://dash.voyageai.com) API-nøkkel

### 1. Database

Åpne Supabase-prosjektet → **SQL Editor**, lim inn og kjør `supabase/schema.sql`.

Dette oppretter alle tabeller, IVFFlat-indeks for vektorsøk og `match_chunks` RPC-funksjonen.

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Opprett `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...
SUPABASE_URL=https://din-prosjekt-id.supabase.co
SUPABASE_KEY=din-anon-nøkkel
FRONTEND_URL=http://localhost:3000
```

```bash
uvicorn main:app --reload
```

API-et kjører på `http://localhost:8000`.

### 3. Frontend

```bash
cd frontend
npm install
```

Opprett `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://din-prosjekt-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-nøkkel
```

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

---

## API-endepunkter

### Autentisering

Alle endepunkter (unntatt `GET /`, `HEAD /`, `GET /health` og `GET /projects`) krever `Authorization: Bearer <supabase-access-token>`.

### Oversikt

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| `GET` | `/health` | Helsesjekk |
| **Organisasjon** | | |
| `POST` | `/orgs` | Opprett organisasjon |
| `GET` | `/orgs/me` | Hent egen organisasjon og rolle |
| `PATCH` | `/orgs/me` | Oppdater organisasjonsnavn |
| `GET` | `/orgs/members` | List medlemmer |
| `POST` | `/orgs/invite` | Generer invitasjonslenke (7 dager) |
| `GET` | `/orgs/invite/{token}` | Hent info om invitasjon |
| `POST` | `/orgs/join` | Bli med via token |
| **Bygg** | | |
| `GET` | `/buildings` | List bygg for organisasjonen |
| `POST` | `/buildings` | Opprett bygg |
| `PATCH` | `/buildings/{id}` | Oppdater bygg |
| `DELETE` | `/buildings/{id}` | Slett bygg |
| **Dokumenter** | | |
| `POST` | `/upload` | Last opp PDF (chunking + embedding) |
| `GET` | `/documents` | List dokumenter per bygg/prosjekt |
| `DELETE` | `/documents/{id}` | Slett dokument og tilhørende chunks |
| `POST` | `/chat` | RAG-spørsmål mot dokumenter |
| **Eiendeler** | | |
| `GET` | `/assets` | List eiendeler per bygg |
| `POST` | `/assets` | Opprett eiendel |
| `GET` | `/assets/{id}` | Hent eiendel med detaljer |
| `PATCH` | `/assets/{id}` | Oppdater eiendel |
| `DELETE` | `/assets/{id}` | Slett eiendel |
| `GET` | `/assets/{id}/condition-trend` | Tilstandstrend over tid |
| `GET` | `/assets/{id}/pattern-analysis` | AI-basert mønsteranalyse |
| **Arbeidsordre** | | |
| `GET` | `/work-orders` | List arbeidsordre per bygg |
| `POST` | `/work-orders` | Opprett arbeidsordre |
| `GET` | `/work-orders/{id}` | Hent arbeidsordre |
| `PATCH` | `/work-orders/{id}` | Oppdater status, prioritet, m.m. |
| `DELETE` | `/work-orders/{id}` | Slett arbeidsordre |
| **Tilstandsrapporter** | | |
| `GET` | `/inspection-reports` | List rapporter per bygg/eiendel |
| `POST` | `/inspection-reports` | Opprett rapport |
| `GET` | `/inspection-reports/{id}` | Hent rapport |
| `PATCH` | `/inspection-reports/{id}` | Oppdater rapport |
| `DELETE` | `/inspection-reports/{id}` | Slett rapport |
| **Dashboard** | | |
| `GET` | `/dashboard/{building_id}` | KPI-er, aktive arbeidsordre og kommende vedlikehold |
| `GET` | `/activity-log` | Aktivitetslogg per bygg |
| **Prosjekter** | | |
| `GET` | `/projects` | List alle prosjekter (åpent) |
| `POST` | `/projects` | Opprett prosjekt |
| `GET` | `/projects/{id}` | Prosjektdetaljer med dokumenter |
| `POST` | `/projects/{id}/unreal/status` | Oppdater Unreal stream-status |
| `PATCH` | `/projects/{id}/unreal/config` | Konfigurer Unreal modell-ID og BIM-URL |
| `GET` | `/projects/{id}/scene-params` | Hent scene-parametre |
| `POST` | `/reports/generate-form` | Generer rapportskjema |

---

## Deploy på Render

Prosjektet deployes som ett Docker-image med både frontend og backend i samme container.

### Oppsett

1. Koble GitHub-repoet til Render
2. Render bruker `render.yaml` og `Dockerfile` automatisk
3. Sett følgende **Environment Variables** i Render-dashbordet:

| Variabel | Hvor |
|---|---|
| `ANTHROPIC_API_KEY` | Environment Variables |
| `VOYAGE_API_KEY` | Environment Variables |
| `SUPABASE_URL` | Environment Variables |
| `SUPABASE_KEY` | Environment Variables |
| `NEXT_PUBLIC_SUPABASE_URL` | **Også** Docker Build Arguments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Også** Docker Build Arguments |

> `NEXT_PUBLIC_*`-variabler bakes inn i Next.js-bundelen ved build-tid og må derfor ligge under **Docker Build Arguments** i Render — ikke bare under Environment Variables.

### Viktig om Supabase free tier

Supabase pauser prosjekter etter 1 ukes inaktivitet. Repoet inneholder en GitHub Action (`.github/workflows/supabase-keepalive.yml`) som pinger databasen ukentlig.

For at den skal virke, legg til i **GitHub → Settings → Secrets and variables → Actions**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Miljøvariabler — fullstendig oversikt

### Backend (`backend/.env`)

| Variabel | Beskrivelse |
|---|---|
| `ANTHROPIC_API_KEY` | Nøkkel fra console.anthropic.com |
| `VOYAGE_API_KEY` | Nøkkel fra dash.voyageai.com |
| `SUPABASE_URL` | `https://<id>.supabase.co` |
| `SUPABASE_KEY` | Supabase `anon` eller `service_role`-nøkkel |
| `FRONTEND_URL` | Tillatt CORS-opprinnelse (standard: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variabel | Beskrivelse |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base-URL til FastAPI-backend |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<id>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon-nøkkel |
