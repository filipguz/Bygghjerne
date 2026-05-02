-- Enable pgvector extension
create extension if not exists vector;

-- ─── Tenant tables ────────────────────────────────────────────────────────────

create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

create table if not exists buildings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz default now()
);

-- ─── Document tables ──────────────────────────────────────────────────────────

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id) on delete cascade,
  filename text not null,
  created_at timestamptz default now()
);

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

create table if not exists org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  token uuid not null default gen_random_uuid() unique,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days')
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table orgs enable row level security;
create policy "org members can read their org"
  on orgs for select
  using (id in (select org_id from org_members where user_id = auth.uid()));

alter table org_members enable row level security;
create policy "users see own memberships"
  on org_members for select
  using (user_id = auth.uid());

alter table buildings enable row level security;
create policy "org members see their buildings"
  on buildings for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

alter table org_invites enable row level security;
create policy "admins can manage invites"
  on org_invites for all
  using (org_id in (
    select org_id from org_members where user_id = auth.uid() and role = 'admin'
  ));

-- Documents and chunks are only accessible via the backend (service role).
-- Deny all direct client SDK access.
alter table documents enable row level security;
create policy "deny direct client access to documents"
  on documents for all using (false);

alter table document_chunks enable row level security;
create policy "deny direct client access to chunks"
  on document_chunks for all using (false);

-- ─── RPC ──────────────────────────────────────────────────────────────────────

create or replace function match_chunks(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  p_building_id uuid
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
  where d.building_id = p_building_id
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
