-- ═══════════════════════════════════════════════════════════════════════════════
-- CMMS MIGRATION — run this in Supabase SQL Editor
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
do $$ begin
  create policy "deny direct client access to assets" on assets for all using (false);
exception when duplicate_object then null;
end $$;

alter table work_orders enable row level security;
do $$ begin
  create policy "deny direct client access to work_orders" on work_orders for all using (false);
exception when duplicate_object then null;
end $$;

alter table activity_log enable row level security;
do $$ begin
  create policy "deny direct client access to activity_log" on activity_log for all using (false);
exception when duplicate_object then null;
end $$;

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
do $$ begin
  create policy "deny direct client access to inspection_reports" on inspection_reports for all using (false);
exception when duplicate_object then null;
end $$;

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
