import io
import json
import os
from datetime import date, datetime, timedelta, timezone

import anthropic
import voyageai
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from supabase import create_client

load_dotenv()

app = FastAPI(title="Serv24 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
voyage_client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
supabase_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
EMBEDDING_MODEL = "voyage-multilingual-2"
CHAT_MODEL = "claude-sonnet-4-6"
MATCH_THRESHOLD = 0.1
MATCH_COUNT = 5


def chunk_text(text: str) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - CHUNK_OVERLAP
    return chunks


# ─── Auth ─────────────────────────────────────────────────────────────────────

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Ugyldig token.")
    token = authorization.removeprefix("Bearer ")
    try:
        response = supabase_client.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=401, detail="Ikke autentisert.")
        return response.user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Ikke autentisert.")


def _get_user_org(user_id: str) -> dict | None:
    result = supabase_client.table("org_members").select(
        "role, orgs(id, name)"
    ).eq("user_id", user_id).execute()
    if not result.data:
        return None
    row = result.data[0]
    return {"role": row["role"], "id": row["orgs"]["id"], "name": row["orgs"]["name"]}


def assert_user_owns_building(user_id: str, building_id: str):
    building = supabase_client.table("buildings").select("org_id").eq("id", building_id).execute()
    if not building.data:
        raise HTTPException(status_code=404, detail="Bygget finnes ikke.")
    org_id = building.data[0]["org_id"]
    membership = supabase_client.table("org_members").select("id").eq("user_id", user_id).eq("org_id", org_id).execute()
    if not membership.data:
        raise HTTPException(status_code=403, detail="Ingen tilgang til dette bygget.")


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ─── Org ──────────────────────────────────────────────────────────────────────

class CreateOrgRequest(BaseModel):
    name: str


@app.post("/orgs")
def create_org(body: CreateOrgRequest, user=Depends(get_current_user)):
    existing = _get_user_org(user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Du er allerede med i en organisasjon.")
    org = supabase_client.table("orgs").insert({"name": body.name}).execute()
    org_id = org.data[0]["id"]
    supabase_client.table("org_members").insert({
        "org_id": org_id,
        "user_id": user.id,
        "role": "admin",
    }).execute()
    return org.data[0]


@app.get("/orgs/me")
def get_my_org(user=Depends(get_current_user)):
    return _get_user_org(user.id)


# ─── Buildings ────────────────────────────────────────────────────────────────

class CreateBuildingRequest(BaseModel):
    name: str
    address: str | None = None


@app.post("/buildings")
def create_building(body: CreateBuildingRequest, user=Depends(get_current_user)):
    org = _get_user_org(user.id)
    if not org:
        raise HTTPException(status_code=403, detail="Du tilhører ingen organisasjon.")
    if org["role"] != "admin":
        raise HTTPException(status_code=403, detail="Kun admins kan opprette bygg.")
    building = supabase_client.table("buildings").insert({
        "org_id": org["id"],
        "name": body.name,
        "address": body.address,
    }).execute()
    return building.data[0]


@app.get("/buildings")
def list_buildings(user=Depends(get_current_user)):
    org = _get_user_org(user.id)
    if not org:
        return []
    result = supabase_client.table("buildings").select(
        "id, name, address, created_at"
    ).eq("org_id", org["id"]).order("name").execute()
    return result.data


class UpdateBuildingRequest(BaseModel):
    name: str
    address: str | None = None


@app.patch("/buildings/{building_id}")
def update_building(building_id: str, body: UpdateBuildingRequest, user=Depends(get_current_user)):
    org = _get_user_org(user.id)
    if not org or org["role"] != "admin":
        raise HTTPException(status_code=403, detail="Kun admins kan redigere bygg.")
    assert_user_owns_building(user.id, building_id)
    result = supabase_client.table("buildings").update({
        "name": body.name,
        "address": body.address,
    }).eq("id", building_id).execute()
    return result.data[0]


@app.delete("/buildings/{building_id}")
def delete_building(building_id: str, user=Depends(get_current_user)):
    org = _get_user_org(user.id)
    if not org or org["role"] != "admin":
        raise HTTPException(status_code=403, detail="Kun admins kan slette bygg.")
    assert_user_owns_building(user.id, building_id)
    supabase_client.table("buildings").delete().eq("id", building_id).execute()
    return {"ok": True}


# ─── Invites ──────────────────────────────────────────────────────────────────

@app.post("/orgs/invite")
def create_invite(user=Depends(get_current_user)):
    org = _get_user_org(user.id)
    if not org or org["role"] != "admin":
        raise HTTPException(status_code=403, detail="Kun admins kan invitere.")
    result = supabase_client.table("org_invites").insert({
        "org_id": org["id"],
        "created_by": user.id,
    }).execute()
    return {"token": result.data[0]["token"]}


@app.get("/orgs/invite/{token}")
def preview_invite(token: str):
    result = supabase_client.table("org_invites").select(
        "expires_at, orgs(name)"
    ).eq("token", token).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Ugyldig invitasjonslenke.")
    row = result.data[0]
    if row["expires_at"] < datetime.now(timezone.utc).isoformat():
        raise HTTPException(status_code=410, detail="Invitasjonslenken er utløpt.")
    return {"org_name": row["orgs"]["name"]}


@app.post("/orgs/join")
def join_org(token: str, user=Depends(get_current_user)):
    existing = _get_user_org(user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Du er allerede med i en organisasjon.")
    result = supabase_client.table("org_invites").select(
        "org_id, expires_at"
    ).eq("token", token).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Ugyldig invitasjonslenke.")
    row = result.data[0]
    if row["expires_at"] < datetime.now(timezone.utc).isoformat():
        raise HTTPException(status_code=410, detail="Invitasjonslenken er utløpt.")
    supabase_client.table("org_members").insert({
        "org_id": row["org_id"],
        "user_id": user.id,
        "role": "member",
    }).execute()
    org = supabase_client.table("orgs").select("id, name").eq("id", row["org_id"]).execute()
    return org.data[0]


# ─── Documents ────────────────────────────────────────────────────────────────

@app.get("/documents")
def list_documents(building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    docs = supabase_client.table("documents").select(
        "id, filename, created_at"
    ).eq("building_id", building_id).order("created_at", desc=True).execute()
    result = []
    for doc in docs.data:
        count_result = supabase_client.table("document_chunks").select(
            "id", count="exact"
        ).eq("document_id", doc["id"]).execute()
        result.append({
            "id": doc["id"],
            "filename": doc["filename"],
            "created_at": doc.get("created_at"),
            "chunks": count_result.count or 0,
        })
    return result


@app.delete("/documents/{document_id}")
def delete_document(document_id: str, building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    doc = supabase_client.table("documents").select("id").eq("id", document_id).eq("building_id", building_id).execute()
    if not doc.data:
        raise HTTPException(status_code=404, detail="Dokument ikke funnet.")
    supabase_client.table("document_chunks").delete().eq("document_id", document_id).execute()
    supabase_client.table("documents").delete().eq("id", document_id).execute()
    return {"ok": True}


@app.post("/upload")
async def upload_document(
    building_id: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    assert_user_owns_building(user.id, building_id)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Kun PDF-filer støttes.")

    content = await file.read()
    try:
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Kunne ikke lese PDF: {e}")

    text = text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="PDF inneholder ingen lesbar tekst.")

    doc_result = supabase_client.table("documents").insert({
        "filename": file.filename,
        "building_id": building_id,
    }).execute()
    document_id = doc_result.data[0]["id"]

    chunks = chunk_text(text)
    embeddings = voyage_client.embed(chunks, model=EMBEDDING_MODEL, input_type="document").embeddings
    rows = [
        {
            "document_id": document_id,
            "content": chunk,
            "embedding": embedding,
            "chunk_index": i,
        }
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]
    supabase_client.table("document_chunks").insert(rows).execute()

    return {
        "document_id": document_id,
        "filename": file.filename,
        "chunks": len(chunks),
    }


# ─── Chat (simple RAG) ────────────────────────────────────────────────────────

RAG_SYSTEM_PROMPT = (
    "Du er Serv24, en AI-driftsassistent for bygget. "
    "Svar alltid på norsk og bruk informasjonen fra den gitte konteksten til å svare på spørsmål om bygget, "
    "tekniske installasjoner, drift og vedlikehold. "
    "Hvis svaret ikke finnes i konteksten, si det tydelig. "
    "Vær presis og konkret."
)


class ChatRequest(BaseModel):
    question: str
    building_id: str
    mode: str = "simple"  # "simple" = RAG only | "enhanced" = tool-calling


@app.post("/chat")
def chat(request: ChatRequest, user=Depends(get_current_user)):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Spørsmål kan ikke være tomt.")

    assert_user_owns_building(user.id, request.building_id)

    if request.mode == "enhanced":
        return chat_with_tools(request.question, request.building_id, user.id)

    # Simple RAG path (existing behaviour)
    question_result = voyage_client.embed(
        [request.question], model=EMBEDDING_MODEL, input_type="query"
    )
    question_embedding = question_result.embeddings[0]

    result = supabase_client.rpc(
        "match_chunks",
        {
            "query_embedding": "[" + ",".join(str(x) for x in question_embedding) + "]",
            "match_threshold": MATCH_THRESHOLD,
            "match_count": MATCH_COUNT,
            "p_building_id": request.building_id,
        },
    ).execute()

    chunks = result.data or []

    if not chunks:
        return {
            "answer": "Fant ingen relevante dokumenter for dette spørsmålet. Last opp relevante dokumenter og prøv igjen.",
            "sources": [],
        }

    context = "\n\n---\n\n".join(c["content"] for c in chunks)

    message = anthropic_client.messages.create(
        model=CHAT_MODEL,
        max_tokens=1024,
        system=RAG_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Kontekst fra bygningsdokumenter:\n\n{context}\n\nSpørsmål: {request.question}",
            }
        ],
    )

    answer = message.content[0].text
    sources = [
        {
            "filename": c["filename"],
            "document_id": c["document_id"],
            "excerpt": c["content"][:300].strip(),
            "similarity": round(c["similarity"], 3),
        }
        for c in chunks
    ]
    return {"answer": answer, "sources": sources}


# ═══════════════════════════════════════════════════════════════════════════════
# CMMS — Assets, Work Orders, Dashboard, AI Tool Layer
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Activity log helper ──────────────────────────────────────────────────────

def log_activity(
    building_id: str,
    action: str,
    details: dict,
    user_id: str | None = None,
    asset_id: str | None = None,
    work_order_id: str | None = None,
):
    row: dict = {"building_id": building_id, "action": action, "details": details}
    if user_id:
        row["user_id"] = user_id
    if asset_id:
        row["asset_id"] = asset_id
    if work_order_id:
        row["work_order_id"] = work_order_id
    try:
        supabase_client.table("activity_log").insert(row).execute()
    except Exception:
        pass  # non-critical


# ─── Assets ───────────────────────────────────────────────────────────────────

class CreateAssetRequest(BaseModel):
    building_id: str
    name: str
    category: str = "other"
    location_floor: str | None = None
    location_room: str | None = None
    installation_date: str | None = None
    maintenance_interval_days: int | None = None
    last_maintenance_date: str | None = None
    metadata: dict = {}


class UpdateAssetRequest(BaseModel):
    name: str | None = None
    category: str | None = None
    location_floor: str | None = None
    location_room: str | None = None
    installation_date: str | None = None
    maintenance_interval_days: int | None = None
    last_maintenance_date: str | None = None
    metadata: dict | None = None


@app.get("/assets")
def list_assets(building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    return supabase_client.table("assets").select("*").eq("building_id", building_id).order("name").execute().data or []


@app.post("/assets")
def create_asset(body: CreateAssetRequest, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, body.building_id)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    data.setdefault("metadata", {})
    asset = supabase_client.table("assets").insert(data).execute().data[0]
    log_activity(body.building_id, "asset_created", {"name": body.name, "category": body.category},
                 user_id=user.id, asset_id=asset["id"])
    return asset


@app.get("/assets/{asset_id}")
def get_asset(asset_id: str, building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    result = supabase_client.table("assets").select("*").eq("id", asset_id).eq("building_id", building_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Eiendel ikke funnet.")
    return result.data[0]


@app.patch("/assets/{asset_id}")
def update_asset(asset_id: str, building_id: str, body: UpdateAssetRequest, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="Ingen felt å oppdatere.")
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = supabase_client.table("assets").update(data).eq("id", asset_id).eq("building_id", building_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Eiendel ikke funnet.")
    log_activity(building_id, "asset_updated", {"fields": list(data.keys())}, user_id=user.id, asset_id=asset_id)
    return result.data[0]


@app.delete("/assets/{asset_id}")
def delete_asset(asset_id: str, building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    supabase_client.table("assets").delete().eq("id", asset_id).eq("building_id", building_id).execute()
    return {"ok": True}


# ─── Work Orders ──────────────────────────────────────────────────────────────

class CreateWorkOrderRequest(BaseModel):
    building_id: str
    title: str
    description: str | None = None
    asset_id: str | None = None
    priority: str = "medium"
    due_date: str | None = None


class UpdateWorkOrderRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    asset_id: str | None = None
    status: str | None = None
    priority: str | None = None
    due_date: str | None = None


@app.get("/work-orders")
def list_work_orders(
    building_id: str,
    status: str | None = None,
    priority: str | None = None,
    user=Depends(get_current_user),
):
    assert_user_owns_building(user.id, building_id)
    q = (supabase_client.table("work_orders")
         .select("id, title, description, status, priority, due_date, created_at, updated_at, asset_id, assets(name, category)")
         .eq("building_id", building_id)
         .order("created_at", desc=True))
    if status:
        q = q.eq("status", status)
    if priority:
        q = q.eq("priority", priority)
    return q.execute().data or []


@app.post("/work-orders")
def create_work_order_route(body: CreateWorkOrderRequest, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, body.building_id)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    data["created_by"] = user.id
    wo = supabase_client.table("work_orders").insert(data).execute().data[0]
    log_activity(body.building_id, "work_order_created",
                 {"title": body.title, "priority": body.priority},
                 user_id=user.id, work_order_id=wo["id"], asset_id=body.asset_id)
    return wo


@app.get("/work-orders/{wo_id}")
def get_work_order(wo_id: str, building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    result = supabase_client.table("work_orders").select(
        "*, assets(name, category, location_floor, location_room)"
    ).eq("id", wo_id).eq("building_id", building_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Arbeidsordre ikke funnet.")
    wo = result.data[0]
    activity = (supabase_client.table("activity_log")
                .select("action, details, created_at")
                .eq("work_order_id", wo_id)
                .order("created_at", desc=True)
                .execute().data or [])
    return {**wo, "activity": activity}


@app.patch("/work-orders/{wo_id}")
def update_work_order(wo_id: str, building_id: str, body: UpdateWorkOrderRequest, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="Ingen felt å oppdatere.")
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    if data.get("status") == "completed" and "completed_at" not in data:
        data["completed_at"] = datetime.now(timezone.utc).isoformat()
    result = supabase_client.table("work_orders").update(data).eq("id", wo_id).eq("building_id", building_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Arbeidsordre ikke funnet.")
    extra = {"new_status": data["status"]} if "status" in data else {}
    log_activity(building_id, "work_order_updated",
                 {"fields": list(data.keys()), **extra},
                 user_id=user.id, work_order_id=wo_id)
    return result.data[0]


@app.delete("/work-orders/{wo_id}")
def delete_work_order(wo_id: str, building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    supabase_client.table("work_orders").delete().eq("id", wo_id).eq("building_id", building_id).execute()
    return {"ok": True}


# ─── Dashboard ────────────────────────────────────────────────────────────────

@app.get("/dashboard/{building_id}")
def get_dashboard(building_id: str, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    today = date.today().isoformat()

    total_assets = supabase_client.table("assets").select("id", count="exact").eq("building_id", building_id).execute().count or 0
    open_orders = supabase_client.table("work_orders").select("id", count="exact").eq("building_id", building_id).neq("status", "completed").execute().count or 0
    overdue = supabase_client.table("work_orders").select("id", count="exact").eq("building_id", building_id).neq("status", "completed").lt("due_date", today).execute().count or 0

    recent = (supabase_client.table("work_orders")
              .select("id, title, status, priority, due_date, created_at, assets(name)")
              .eq("building_id", building_id)
              .neq("status", "completed")
              .order("created_at", desc=True)
              .limit(8)
              .execute().data or [])

    upcoming = supabase_client.rpc("get_upcoming_maintenance", {
        "p_building_id": building_id, "p_days_ahead": 90
    }).execute().data or []

    return {
        "kpis": {
            "total_assets": total_assets,
            "open_work_orders": open_orders,
            "overdue_maintenance": overdue,
        },
        "recent_work_orders": recent,
        "upcoming_maintenance": upcoming[:6],
    }


# ─── Activity Log ─────────────────────────────────────────────────────────────

@app.get("/activity-log")
def get_activity_log(building_id: str, limit: int = 50, user=Depends(get_current_user)):
    assert_user_owns_building(user.id, building_id)
    return (supabase_client.table("activity_log")
            .select("id, action, details, created_at, asset_id, work_order_id")
            .eq("building_id", building_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute().data or [])


# ═══════════════════════════════════════════════════════════════════════════════
# AI Tool Layer — enhanced chat with structured data access
# ═══════════════════════════════════════════════════════════════════════════════

CMMS_SYSTEM_PROMPT = """Du er Serv24, en AI-driftsassistent for bygningsforvaltning.

Du har tilgang til verktøy for å hente sanntidsdata om byggets eiendeler, arbeidsordre og dokumenter.

Regler:
- Svar alltid på norsk
- Vær konkret og handlingsorientert — gi tydelige prioriteringer og anbefalinger
- Henvis til spesifikke arbeidsordre-titler, eiendelsnavn og dokumenter når relevant
- Når du oppretter en arbeidsordre, bekreft alltid hva du opprettet (tittel og prioritet)
- Prioriter alltid kritiske og forfalne oppgaver
- Kombiner data fra arbeidsordre OG dokumenter når det gir bedre svar"""

CMMS_TOOLS = [
    {
        "name": "get_building_summary",
        "description": "Hent statusoversikt: antall eiendeler, åpne/kritiske/forfalne arbeidsordre.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_open_work_orders",
        "description": "Hent åpne, pågående eller ventende arbeidsordre. Kan filtreres på prioritet.",
        "input_schema": {
            "type": "object",
            "properties": {
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "critical"],
                    "description": "Filtrer på prioritet (valgfritt)",
                }
            },
            "required": [],
        },
    },
    {
        "name": "get_overdue_work_orders",
        "description": "Hent arbeidsordre der forfallsdato er passert og som ikke er fullført.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_upcoming_maintenance",
        "description": "Hent eiendeler som trenger vedlikehold innen et antall dager.",
        "input_schema": {
            "type": "object",
            "properties": {
                "days": {"type": "integer", "description": "Dager fremover (standard: 90)"}
            },
            "required": [],
        },
    },
    {
        "name": "get_asset_history",
        "description": "Hent historikk (arbeidsordre, hendelser) for et spesifikt utstyr.",
        "input_schema": {
            "type": "object",
            "properties": {
                "asset_id": {"type": "string", "description": "Utstyrets UUID"}
            },
            "required": ["asset_id"],
        },
    },
    {
        "name": "create_work_order",
        "description": "Opprett en ny arbeidsordre. Bruk dette når brukeren ber om å registrere en vedlikeholdsoppgave.",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "description": {"type": "string"},
                "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                "asset_id": {"type": "string", "description": "Utstyrets UUID (valgfritt)"},
                "due_date": {"type": "string", "description": "YYYY-MM-DD (valgfritt)"},
            },
            "required": ["title", "priority"],
        },
    },
    {
        "name": "search_documents",
        "description": "Søk i byggets tekniske dokumenter (driftshåndbøker, servicerapporter, tegninger).",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"}
            },
            "required": ["query"],
        },
    },
]


def _tool_get_building_summary(building_id: str) -> dict:
    today = date.today().isoformat()
    total = supabase_client.table("assets").select("id", count="exact").eq("building_id", building_id).execute().count or 0
    open_c = supabase_client.table("work_orders").select("id", count="exact").eq("building_id", building_id).neq("status", "completed").execute().count or 0
    overdue_c = supabase_client.table("work_orders").select("id", count="exact").eq("building_id", building_id).neq("status", "completed").lt("due_date", today).execute().count or 0
    critical_c = supabase_client.table("work_orders").select("id", count="exact").eq("building_id", building_id).eq("priority", "critical").neq("status", "completed").execute().count or 0
    return {"total_assets": total, "open_work_orders": open_c, "overdue_work_orders": overdue_c, "critical_work_orders": critical_c, "as_of": today}


def _tool_get_open_work_orders(building_id: str, priority: str | None = None) -> list:
    q = (supabase_client.table("work_orders")
         .select("id, title, description, priority, status, due_date, assets(name, category)")
         .eq("building_id", building_id)
         .neq("status", "completed")
         .order("created_at", desc=True))
    if priority:
        q = q.eq("priority", priority)
    return q.execute().data or []


def _tool_get_overdue_work_orders(building_id: str) -> list:
    today = date.today().isoformat()
    return (supabase_client.table("work_orders")
            .select("id, title, description, priority, status, due_date, assets(name, category)")
            .eq("building_id", building_id)
            .neq("status", "completed")
            .lt("due_date", today)
            .order("due_date")
            .execute().data or [])


def _tool_get_upcoming_maintenance(building_id: str, days: int = 90) -> list:
    return supabase_client.rpc(
        "get_upcoming_maintenance", {"p_building_id": building_id, "p_days_ahead": days}
    ).execute().data or []


def _tool_get_asset_history(asset_id: str, building_id: str) -> dict:
    asset = supabase_client.table("assets").select("*").eq("id", asset_id).eq("building_id", building_id).execute()
    if not asset.data:
        return {"error": "Eiendel ikke funnet"}
    orders = (supabase_client.table("work_orders")
              .select("id, title, status, priority, due_date, completed_at, created_at")
              .eq("asset_id", asset_id).order("created_at", desc=True).limit(10).execute().data or [])
    activity = (supabase_client.table("activity_log")
                .select("action, details, created_at")
                .eq("asset_id", asset_id).order("created_at", desc=True).limit(20).execute().data or [])
    return {"asset": asset.data[0], "work_orders": orders, "activity": activity}


def _tool_create_work_order(building_id: str, user_id: str, title: str, priority: str,
                             description: str | None, asset_id: str | None, due_date: str | None) -> dict:
    data: dict = {"building_id": building_id, "title": title, "priority": priority,
                  "status": "open", "created_by": user_id}
    if description:
        data["description"] = description
    if asset_id:
        data["asset_id"] = asset_id
    if due_date:
        data["due_date"] = due_date
    wo = supabase_client.table("work_orders").insert(data).execute().data[0]
    log_activity(building_id, "work_order_created",
                 {"title": title, "priority": priority, "created_by_ai": True},
                 user_id=user_id, work_order_id=wo["id"])
    return {"success": True, "work_order": wo}


def _tool_search_documents(query: str, building_id: str) -> list:
    emb = voyage_client.embed([query], model=EMBEDDING_MODEL, input_type="query").embeddings[0]
    result = supabase_client.rpc("match_chunks", {
        "query_embedding": "[" + ",".join(str(x) for x in emb) + "]",
        "match_threshold": MATCH_THRESHOLD,
        "match_count": MATCH_COUNT,
        "p_building_id": building_id,
    }).execute()
    chunks = result.data or []
    return [{"filename": c["filename"], "content": c["content"][:600], "similarity": round(c["similarity"], 3)} for c in chunks]


def _execute_tool(name: str, inputs: dict, building_id: str, user_id: str) -> dict:
    if name == "get_building_summary":
        return _tool_get_building_summary(building_id)
    if name == "get_open_work_orders":
        return {"work_orders": _tool_get_open_work_orders(building_id, inputs.get("priority"))}
    if name == "get_overdue_work_orders":
        return {"work_orders": _tool_get_overdue_work_orders(building_id)}
    if name == "get_upcoming_maintenance":
        return {"maintenance": _tool_get_upcoming_maintenance(building_id, inputs.get("days", 90))}
    if name == "get_asset_history":
        return _tool_get_asset_history(inputs["asset_id"], building_id)
    if name == "create_work_order":
        return _tool_create_work_order(
            building_id, user_id,
            inputs["title"], inputs["priority"],
            inputs.get("description"), inputs.get("asset_id"), inputs.get("due_date"),
        )
    if name == "search_documents":
        docs = _tool_search_documents(inputs["query"], building_id)
        return {"results": docs}
    return {"error": f"Ukjent verktøy: {name}"}


MAX_TOOL_ROUNDS = 5


def chat_with_tools(question: str, building_id: str, user_id: str) -> dict:
    messages: list[dict] = [{"role": "user", "content": question}]
    tools_used: list[str] = []
    actions_taken: list[dict] = []
    doc_sources: list[dict] = []

    for _ in range(MAX_TOOL_ROUNDS):
        response = anthropic_client.messages.create(
            model=CHAT_MODEL,
            max_tokens=2048,
            system=CMMS_SYSTEM_PROMPT,
            tools=CMMS_TOOLS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            answer = next((b.text for b in response.content if hasattr(b, "text")), "")
            return {
                "answer": answer,
                "sources": doc_sources,
                "tools_used": list(dict.fromkeys(tools_used)),  # deduplicated, order-preserving
                "actions_taken": actions_taken,
            }

        if response.stop_reason != "tool_use":
            break

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []

        for block in response.content:
            if block.type != "tool_use":
                continue
            tools_used.append(block.name)
            result = _execute_tool(block.name, block.input, building_id, user_id)

            if block.name == "search_documents":
                doc_sources.extend(
                    {"filename": r["filename"], "excerpt": r.get("content", "")[:300], "similarity": r.get("similarity", 0)}
                    for r in result.get("results", [])
                )
            if block.name == "create_work_order" and result.get("success"):
                actions_taken.append({"type": "work_order_created", "work_order": result["work_order"]})

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result, ensure_ascii=False, default=str),
            })

        messages.append({"role": "user", "content": tool_results})

    return {
        "answer": "Beklager, kunne ikke fullføre analysen. Prøv igjen.",
        "sources": [],
        "tools_used": tools_used,
        "actions_taken": actions_taken,
    }
