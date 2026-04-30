# Bygghjerne

AI-powered building management assistant. Upload PDF documents about your building (manuals, maintenance logs, technical specs) and ask questions in Norwegian.

## Architecture

```
frontend/   Next.js 14 (App Router) + Tailwind CSS
backend/    Python FastAPI
database    Supabase (PostgreSQL + pgvector)
AI          Anthropic claude-sonnet-4-6 (chat) + Voyage AI voyage-multilingual-2 (embeddings)
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Voyage AI](https://dash.voyageai.com) API key

---

## 1. Supabase setup

1. Open your Supabase project → **SQL Editor**
2. Paste and run the contents of `supabase/schema.sql`

This creates the `documents` and `document_chunks` tables, an IVFFlat index on the embedding column, and the `match_chunks` RPC function.

---

## 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, VOYAGE_API_KEY, SUPABASE_URL, SUPABASE_KEY
```

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`.

| Endpoint | Description |
|---|---|
| `GET /health` | Health check |
| `POST /upload` | Upload a PDF (multipart/form-data `file` field) |
| `POST /chat` | Ask a question (`{"question": "..."}`) |

---

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 (default)
```

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

1. Upload one or more PDFs using the left panel — they are chunked, embedded, and stored in Supabase automatically.
2. Type a question in Norwegian in the chat panel and press Enter.
3. The answer appears with source excerpts and similarity scores below it.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic secret key |
| `VOYAGE_API_KEY` | Voyage AI secret key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase `anon` or `service_role` key |
| `FRONTEND_URL` | Allowed CORS origin (default: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend |