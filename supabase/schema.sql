-- Enable pgvector extension
create extension if not exists vector;

-- Documents table
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  created_at timestamptz default now()
);

-- Chunks table with embeddings (voyage-multilingual-2 = 1024 dims)
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  embedding vector(1024),
  chunk_index int not null,
  created_at timestamptz default now()
);

-- IVFFlat index for fast cosine similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC function used by the chat endpoint
create or replace function match_chunks(
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
returns table(
  id uuid,
  document_id uuid,
  content text,
  filename text,
  similarity float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    d.filename,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
