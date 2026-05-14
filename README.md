# Bygghjerne

AI-drevet driftsassistent og prosjektportefølje for eiendomsforvaltning. Last opp PDF-dokumenter om bygninger og prosjekter, still spørsmål på norsk, og hold oversikt over vedlikehold, arbeidsordre og eiendeler.

## Arkitektur

```
frontend/   Next.js 14 (App Router) + Tailwind CSS
backend/    Python FastAPI
database    Supabase (PostgreSQL + pgvector)
AI          Anthropic claude-sonnet-4-6 (chat) + Voyage AI voyage-multilingual-2 (embeddings)
```

## Forutsetninger

- Node.js 18+
- Python 3.11+
- Et [Supabase](https://supabase.com)-prosjekt
- En [Anthropic](https://console.anthropic.com) API-nøkkel
- En [Voyage AI](https://dash.voyageai.com) API-nøkkel

---

## 1. Supabase-oppsett

1. Åpne Supabase-prosjektet ditt → **SQL Editor**
2. Lim inn og kjør innholdet i `supabase/schema.sql`

Dette oppretter alle tabeller, indekser og `match_chunks` RPC-funksjonen.

---

## 2. Backend

```bash
cd backend
cp .env.example .env
# Fyll inn ANTHROPIC_API_KEY, VOYAGE_API_KEY, SUPABASE_URL, SUPABASE_KEY
```

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API-et kjører på `http://localhost:8000`.

### Endepunkter

| Metode | Endepunkt | Beskrivelse |
|---|---|---|
| `GET` | `/health` | Helsesjekk |
| `POST` | `/upload` | Last opp PDF (`building_id` eller `project_id`) |
| `POST` | `/chat` | Still spørsmål til dokumentene |
| `GET/POST` | `/buildings` | Bygg – liste og opprett |
| `PATCH/DELETE` | `/buildings/{id}` | Bygg – oppdater og slett |
| `GET/POST` | `/projects` | Prosjekter – liste og opprett |
| `GET` | `/projects/{id}` | Prosjektdetaljer med dokumenter |
| `GET/POST` | `/assets` | Eiendeler |
| `GET/POST` | `/work-orders` | Arbeidsordre |
| `GET/POST` | `/inspection-reports` | Tilstandsrapporter |
| `GET` | `/dashboard/{building_id}` | Dashbord-data |
| `GET/POST` | `/orgs` | Organisasjoner |
| `POST` | `/orgs/invite` | Generer invitasjonslenke |
| `POST` | `/orgs/join` | Bli med via invitasjon |

---

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Sett NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

### Sider

| Rute | Beskrivelse |
|---|---|
| `/dashboard` | Oversikt med KPI-er og aktivitetslogg |
| `/assistent` | AI-chat mot bygningsdokumenter |
| `/bygninger` | Administrer bygg |
| `/eiendeler` | Tekniske installasjoner og utstyr |
| `/arbeidsordre` | Opprett og følg opp arbeidsordre |
| `/rapporter` | Tilstandsrapporter |
| `/map` | Kart over prosjektporteføljen |
| `/projects/[id]` | Prosjektdetaljer med analyse og dokumenter |
| `/innstillinger` | Organisasjon, medlemmer og invitasjoner |

---

## Miljøvariabler

### Backend (`backend/.env`)

| Variabel | Beskrivelse |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API-nøkkel |
| `VOYAGE_API_KEY` | Voyage AI API-nøkkel |
| `SUPABASE_URL` | Supabase prosjekt-URL |
| `SUPABASE_KEY` | Supabase `anon` eller `service_role`-nøkkel |
| `FRONTEND_URL` | Tillatt CORS-opprinnelse (standard: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variabel | Beskrivelse |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base-URL til FastAPI-backend |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase prosjekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon-nøkkel |
