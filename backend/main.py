import io
import os
from datetime import datetime, timezone

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


# ─── Chat ─────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    building_id: str


@app.post("/chat")
def chat(request: ChatRequest, user=Depends(get_current_user)):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Spørsmål kan ikke være tomt.")

    assert_user_owns_building(user.id, request.building_id)

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
        system=(
            "Du er Serv24, en AI-driftsassistent for bygget. "
            "Svar alltid på norsk og bruk informasjonen fra den gitte konteksten til å svare på spørsmål om bygget, "
            "tekniske installasjoner, drift og vedlikehold. "
            "Hvis svaret ikke finnes i konteksten, si det tydelig. "
            "Vær presis og konkret."
        ),
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
