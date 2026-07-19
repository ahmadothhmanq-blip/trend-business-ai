-- AI Website Optimizer Engine
-- website_audits, optimization_reports, improvement_history

create table if not exists public.website_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  website_generation_id uuid references public.website_generations (id) on delete set null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  status text not null default 'completed',
  design_score integer not null default 0,
  seo_score integer not null default 0,
  ux_score integer not null default 0,
  performance_score integer not null default 0,
  overall_score integer not null default 0,
  issues jsonb not null default '[]'::jsonb,
  missing_sections jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.optimization_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  website_generation_id uuid references public.website_generations (id) on delete set null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  audit_id uuid references public.website_audits (id) on delete set null,
  status text not null default 'ready',
  summary text,
  scores jsonb not null default '{}'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  applied_fixes jsonb not null default '[]'::jsonb,
  report_json jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.improvement_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  website_generation_id uuid references public.website_generations (id) on delete set null,
  parent_generation_id uuid references public.website_generations (id) on delete set null,
  audit_id uuid references public.website_audits (id) on delete set null,
  optimization_report_id uuid references public.optimization_reports (id) on delete set null,
  action text not null default 'optimize',
  category text not null default 'general',
  before_score integer,
  after_score integer,
  instruction text,
  changes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists website_audits_user_idx
  on public.website_audits (user_id, created_at desc);
create index if not exists website_audits_generation_idx
  on public.website_audits (website_generation_id);
create index if not exists optimization_reports_user_idx
  on public.optimization_reports (user_id, created_at desc);
create index if not exists optimization_reports_generation_idx
  on public.optimization_reports (website_generation_id);
create index if not exists improvement_history_user_idx
  on public.improvement_history (user_id, created_at desc);
create index if not exists improvement_history_generation_idx
  on public.improvement_history (website_generation_id);

alter table public.website_audits enable row level security;
alter table public.optimization_reports enable row level security;
alter table public.improvement_history enable row level security;

drop policy if exists "website_audits_owner_select" on public.website_audits;
create policy "website_audits_owner_select"
  on public.website_audits for select
  using (auth.uid() = user_id);

drop policy if exists "website_audits_owner_insert" on public.website_audits;
create policy "website_audits_owner_insert"
  on public.website_audits for insert
  with check (auth.uid() = user_id);

drop policy if exists "optimization_reports_owner_select" on public.optimization_reports;
create policy "optimization_reports_owner_select"
  on public.optimization_reports for select
  using (auth.uid() = user_id);

drop policy if exists "optimization_reports_owner_insert" on public.optimization_reports;
create policy "optimization_reports_owner_insert"
  on public.optimization_reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "improvement_history_owner_select" on public.improvement_history;
create policy "improvement_history_owner_select"
  on public.improvement_history for select
  using (auth.uid() = user_id);

drop policy if exists "improvement_history_owner_insert" on public.improvement_history;
create policy "improvement_history_owner_insert"
  on public.improvement_history for insert
  with check (auth.uid() = user_id);
