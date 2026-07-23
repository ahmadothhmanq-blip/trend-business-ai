-- Business Intelligence Platform

create table if not exists public.bi_data_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  name text not null default 'Data Source',
  source_type text not null default 'custom' check (source_type in ('crm','erp','marketing','social','business_manager','website','billing','custom')),
  connection_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_data_sources enable row level security;
create policy "Users manage own bi data sources" on public.bi_data_sources for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_data_sources_user_id on public.bi_data_sources(user_id);

create table if not exists public.bi_datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  data_source_id uuid references public.bi_data_sources(id) on delete set null,
  name text not null default 'Dataset',
  description text not null default '',
  schema_definition jsonb not null default '{}'::jsonb,
  row_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_datasets enable row level security;
create policy "Users manage own bi datasets" on public.bi_datasets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_datasets_user_id on public.bi_datasets(user_id);
create index if not exists idx_bi_datasets_source on public.bi_datasets(data_source_id);

create table if not exists public.bi_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  dataset_id uuid references public.bi_datasets(id) on delete set null,
  name text not null default 'Model',
  model_type text not null default 'semantic',
  definition jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_models enable row level security;
create policy "Users manage own bi models" on public.bi_models for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_models_user_id on public.bi_models(user_id);

create table if not exists public.bi_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  dataset_id uuid references public.bi_datasets(id) on delete set null,
  key text not null default '',
  label text not null default 'Metric',
  formula text not null default '',
  unit text not null default '',
  aggregation text not null default 'sum',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

alter table public.bi_metrics enable row level security;
create policy "Users manage own bi metrics" on public.bi_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_metrics_user_id on public.bi_metrics(user_id);

create table if not exists public.bi_dimensions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  dataset_id uuid references public.bi_datasets(id) on delete set null,
  key text not null default '',
  label text not null default 'Dimension',
  data_type text not null default 'string',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_dimensions enable row level security;
create policy "Users manage own bi dimensions" on public.bi_dimensions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_dimensions_user_id on public.bi_dimensions(user_id);

create table if not exists public.bi_kpis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  metric_id uuid references public.bi_metrics(id) on delete set null,
  name text not null default 'KPI',
  target_value numeric not null default 0,
  current_value numeric not null default 0,
  unit text not null default '',
  period text not null default 'monthly',
  trend_direction text not null default 'flat' check (trend_direction in ('up','down','flat')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_kpis enable row level security;
create policy "Users manage own bi kpis" on public.bi_kpis for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_kpis_user_id on public.bi_kpis(user_id);

create table if not exists public.bi_dashboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  name text not null default 'Dashboard',
  description text not null default '',
  layout jsonb not null default '{}'::jsonb,
  filters jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_dashboards enable row level security;
create policy "Users manage own bi dashboards" on public.bi_dashboards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_dashboards_user_id on public.bi_dashboards(user_id);

create table if not exists public.bi_widgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  dashboard_id uuid not null references public.bi_dashboards(id) on delete cascade,
  title text not null default 'Widget',
  widget_type text not null default 'kpi' check (widget_type in ('kpi','line','bar','table','trend')),
  metric_key text not null default '',
  config jsonb not null default '{}'::jsonb,
  position jsonb not null default '{"x":0,"y":0,"w":4,"h":2}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_widgets enable row level security;
create policy "Users manage own bi widgets" on public.bi_widgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_widgets_dashboard on public.bi_widgets(dashboard_id);

create table if not exists public.bi_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  title text not null default 'Report',
  report_type text not null default 'custom',
  payload jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_reports enable row level security;
create policy "Users manage own bi reports" on public.bi_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_reports_user_id on public.bi_reports(user_id);

create table if not exists public.bi_scheduled_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  report_id uuid references public.bi_reports(id) on delete set null,
  title text not null default 'Scheduled Report',
  frequency text not null default 'weekly' check (frequency in ('daily','weekly','monthly')),
  next_run_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_scheduled_reports enable row level security;
create policy "Users manage own bi scheduled reports" on public.bi_scheduled_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_scheduled_reports_user_id on public.bi_scheduled_reports(user_id);

create table if not exists public.bi_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  name text not null default 'Query',
  query_text text not null default '',
  dataset_id uuid references public.bi_datasets(id) on delete set null,
  result_cache jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_queries enable row level security;
create policy "Users manage own bi queries" on public.bi_queries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_queries_user_id on public.bi_queries(user_id);

create table if not exists public.bi_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  metric_key text not null default '',
  name text not null default 'Alert',
  condition text not null default 'gt',
  threshold numeric not null default 0,
  status text not null default 'active' check (status in ('active','paused','triggered')),
  last_triggered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bi_alerts enable row level security;
create policy "Users manage own bi alerts" on public.bi_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_alerts_user_id on public.bi_alerts(user_id);

create table if not exists public.bi_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  action text not null default '',
  entity_type text not null default '',
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.bi_audit_log enable row level security;
create policy "Users manage own bi audit log" on public.bi_audit_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_bi_audit_log_user_id on public.bi_audit_log(user_id);
