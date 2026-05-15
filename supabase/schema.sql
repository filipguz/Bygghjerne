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

-- ═══════════════════════════════════════════════════════════════════════════════
-- CMMS MIGRATION — run once after initial schema
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Assets ───────────────────────────────────────────────────────────────────

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  name text not null,
  category text not null default 'other'
    check (category in ('hvac', 'fire_safety', 'electrical', 'plumbing', 'elevator', 'other')),
  location_floor text,
  location_room text,
  installation_date date,
  maintenance_interval_days int,
  last_maintenance_date date,
  metadata jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Work Orders ──────────────────────────────────────────────────────────────

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'waiting', 'completed')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  due_date date,
  completed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists work_orders_building_status_idx
  on work_orders(building_id, status);

create index if not exists work_orders_due_date_idx
  on work_orders(due_date) where status != 'completed';

-- ─── Activity Log (append-only) ───────────────────────────────────────────────

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  work_order_id uuid references work_orders(id) on delete set null,
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ─── RLS (backend-only access via service role) ───────────────────────────────

alter table assets enable row level security;
create policy "deny direct client access to assets"
  on assets for all using (false);

alter table work_orders enable row level security;
create policy "deny direct client access to work_orders"
  on work_orders for all using (false);

alter table activity_log enable row level security;
create policy "deny direct client access to activity_log"
  on activity_log for all using (false);

-- ─── RPC: upcoming maintenance ────────────────────────────────────────────────

create or replace function get_upcoming_maintenance(
  p_building_id uuid,
  p_days_ahead int default 90
)
returns table(
  id uuid,
  name text,
  category text,
  location_floor text,
  location_room text,
  last_maintenance_date date,
  maintenance_interval_days int,
  next_maintenance_date date,
  days_until_due int
)
language sql stable
as $$
  select
    id, name, category, location_floor, location_room,
    last_maintenance_date,
    maintenance_interval_days,
    (
      coalesce(last_maintenance_date, installation_date, current_date)
      + (maintenance_interval_days || ' days')::interval
    )::date as next_maintenance_date,
    (
      (
        coalesce(last_maintenance_date, installation_date, current_date)
        + (maintenance_interval_days || ' days')::interval
      )::date - current_date
    )::int as days_until_due
  from assets
  where building_id = p_building_id
    and maintenance_interval_days is not null
    and (
      coalesce(last_maintenance_date, installation_date, current_date)
      + (maintenance_interval_days || ' days')::interval
    )::date <= current_date + (p_days_ahead || ' days')::interval
  order by next_maintenance_date asc;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SELF-LEARNING INTELLIGENCE MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Inspection Reports ───────────────────────────────────────────────────────

create table if not exists inspection_reports (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  asset_id uuid references assets(id) on delete set null,
  report_type text not null default 'service'
    check (report_type in ('annual_inspection', 'service', 'incident', 'routine_check')),
  performed_by text not null,
  performed_by_user_id uuid references auth.users(id),
  report_date date not null default current_date,
  condition_score int not null check (condition_score between 1 and 5),
  observed_issues text,
  actions_taken text,
  recommended_actions text,
  next_inspection_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists inspection_reports_building_idx
  on inspection_reports(building_id, report_date desc);

create index if not exists inspection_reports_asset_idx
  on inspection_reports(asset_id, report_date desc);

alter table inspection_reports enable row level security;
create policy "deny direct client access to inspection_reports"
  on inspection_reports for all using (false);

-- ─── RPC: condition trend for a single asset ──────────────────────────────────

create or replace function get_condition_trend(p_asset_id uuid, p_limit int default 12)
returns table(
  report_date date,
  condition_score int,
  report_type text,
  performed_by text,
  observed_issues text,
  recommended_actions text
)
language sql stable
as $$
  select report_date, condition_score, report_type, performed_by, observed_issues, recommended_actions
  from inspection_reports
  where asset_id = p_asset_id
  order by report_date desc
  limit p_limit;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PROJECTS MIGRATION — Vizbo merge
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists projects (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  location         text,
  address          text,
  status           text default 'mulighetsstudie',
  bra_m2           int,
  units            int,
  floors           int,
  lat              float,
  lng              float,
  description      text,
  completion_year  int,
  investment_mnok  float,
  zoning_status    text,
  zoning_code      text,
  analysis         jsonb,
  created_at       timestamptz default now()
);

alter table documents add column if not exists project_id uuid references projects(id);
alter table document_chunks add column if not exists project_id uuid references projects(id);

-- Replace match_chunks to support both building_id and project_id filters
create or replace function match_chunks(
  query_embedding  vector(1024),
  match_threshold  float,
  match_count      int,
  p_building_id    uuid default null,
  p_project_id     uuid default null
)
returns table(
  id           uuid,
  document_id  uuid,
  content      text,
  filename     text,
  similarity   float
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
  where (
    (p_building_id is not null and d.building_id = p_building_id) or
    (p_project_id  is not null and d.project_id  = p_project_id)
  )
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Seed projects
insert into projects (name, location, address, status, bra_m2, units, floors, lat, lng, description, completion_year, investment_mnok, zoning_status, zoning_code, analysis)
values
  (
    'Storgata 12', 'Oslo', 'Storgata 12, 0155 Oslo',
    'prosjektering', 8400, 72, 9,
    59.9127, 10.7461,
    'Transformasjon av kontorbygg til bolig med næring i 1. etasje. Moderne arkitektur med fokus på bærekraft.',
    2026, 245.0, 'Offentlig ettersyn', 'S-5432',
    '{"sol": {"score": 82, "label": "Solforhold", "description": "Gode solforhold mot sør og vest."}, "støy": {"score": 55, "label": "Støy", "description": "Noe trafikkstøy fra Storgata."}, "flom": {"score": 90, "label": "Flomrisiko", "description": "Lavt flomrisikoområde."}, "fjernvirkning": {"score": 78, "label": "Fjernvirkning", "description": "Positiv fjernvirkning, god byform."}}'::jsonb
  ),
  (
    'Havneparken Kristiansand', 'Kristiansand', 'Vestre Strandgate 22, 4611 Kristiansand',
    'regulering', 12600, 110, 7,
    58.1467, 7.9956,
    'Transformasjon av havnearealer til blandede boliger og næring. Unikt beliggenhet med sjøutsikt.',
    2027, 380.0, 'Reguleringsplan', 'KR-2341',
    '{"sol": {"score": 91, "label": "Solforhold", "description": "Eksepsjonelle solforhold mot sør."}, "støy": {"score": 48, "label": "Støy", "description": "Havneaktivitet gir noe bakgrunnsstøy."}, "flom": {"score": 62, "label": "Flomrisiko", "description": "Moderat risiko ved ekstremvær."}, "fjernvirkning": {"score": 88, "label": "Fjernvirkning", "description": "Ikonisk sjøfront."}}'::jsonb
  ),
  (
    'Torvet Lillestrøm', 'Lillestrøm', 'Torvet 3, 2000 Lillestrøm',
    'mulighetsstudie', 5200, 44, 6,
    59.9554, 11.0496,
    'Sentrumsnær utvikling nær jernbanestasjonen. Attraktivt for pendlere og unge voksne.',
    2028, 142.0, 'Reguleringsplan', 'LS-1122',
    '{"sol": {"score": 68, "label": "Solforhold", "description": "Gode solforhold om sommeren."}, "støy": {"score": 42, "label": "Støy", "description": "Jernbanestøy er en utfordring."}, "flom": {"score": 75, "label": "Flomrisiko", "description": "Naumdalselva i nærheten."}, "fjernvirkning": {"score": 72, "label": "Fjernvirkning", "description": "Positiv bidrag til sentrum."}}'::jsonb
  ),
  (
    'Bergenhus Kvartal', 'Bergen', 'Strandkaien 1, 5013 Bergen',
    'salg', 18900, 165, 11,
    60.3958, 5.3219,
    'Prestisjeutbygging i Bergens historiske havnekvarter. Luksus og bærekraft i kombinasjon.',
    2025, 720.0, 'Vedtatt', 'BG-9981',
    '{"sol": {"score": 59, "label": "Solforhold", "description": "Fjordene gir noe skyggefulle perioder."}, "støy": {"score": 70, "label": "Støy", "description": "Godt støyskjermet fra havnetrafikk."}, "flom": {"score": 55, "label": "Flomrisiko", "description": "Stormflo er relevant."}, "fjernvirkning": {"score": 95, "label": "Fjernvirkning", "description": "Fremtredende posisjon i bybildet."}}'::jsonb
  )
on conflict do nothing;


-- ═══════════════════════════════════════════════════════════════════════════════
-- UNREAL ENGINE / PIXEL STREAMING — columns
-- ═══════════════════════════════════════════════════════════════════════════════

alter table projects add column if not exists unreal_stream_url text;
alter table projects add column if not exists unreal_model_id   text;
alter table projects add column if not exists bim_file_url      text;
