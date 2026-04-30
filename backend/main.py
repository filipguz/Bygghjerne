import io
import os

import anthropic
import voyageai
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from supabase import create_client

load_dotenv()

app = FastAPI(title="Bygghjerne API")

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
EMBEDDING_MODEL = "voyage-multilingual-2"   # 1024 dims, støtter norsk
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
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

    doc_result = supabase_client.table("documents").insert({"filename": file.filename}).execute()
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


class ChatRequest(BaseModel):
    question: str


@app.post("/chat")
def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Spørsmål kan ikke være tomt.")

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
            "Du er Bygghjerne, en AI-driftsassistent for bygget. "
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
