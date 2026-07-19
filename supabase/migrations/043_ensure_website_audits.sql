-- Migration 043: Ensure public.website_audits exists (SEO / quality / design / conversion)
-- Idempotent: safe if 037 already applied or table was never created.

create table if not exists public.website_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  website_generation_id uuid references public.website_generations (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  status text not null default 'completed',
  design_score integer not null default 0,
  seo_score integer not null default 0,
  ux_score integer not null default 0,
  performance_score integer not null default 0,
  conversion_score integer not null default 0,
  quality_score integer not null default 0,
  overall_score integer not null default 0,
  issues jsonb not null default '[]'::jsonb,
  missing_sections jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  seo_results jsonb not null default '{}'::jsonb,
  quality_results jsonb not null default '{}'::jsonb,
  design_results jsonb not null default '{}'::jsonb,
  conversion_results jsonb not null default '{}'::jsonb,
  audit_json jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade path when 037 created a thinner table
alter table public.website_audits
  add column if not exists project_id uuid references public.projects (id) on delete set null;

alter table public.website_audits
  add column if not exists conversion_score integer not null default 0;

alter table public.website_audits
  add column if not exists quality_score integer not null default 0;

alter table public.website_audits
  add column if not exists seo_results jsonb not null default '{}'::jsonb;

alter table public.website_audits
  add column if not exists quality_results jsonb not null default '{}'::jsonb;

alter table public.website_audits
  add column if not exists design_results jsonb not null default '{}'::jsonb;

alter table public.website_audits
  add column if not exists conversion_results jsonb not null default '{}'::jsonb;

alter table public.website_audits
  add column if not exists audit_json jsonb not null default '{}'::jsonb;

alter table public.website_audits
  add column if not exists updated_at timestamptz not null default now();

-- Ensure companion optimizer tables exist (persist.ts depends on them)
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.optimization_reports
  add column if not exists updated_at timestamptz not null default now();

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.improvement_history
  add column if not exists updated_at timestamptz not null default now();

create index if not exists website_audits_user_idx
  on public.website_audits (user_id, created_at desc);
create index if not exists website_audits_generation_idx
  on public.website_audits (website_generation_id);
create index if not exists website_audits_project_idx
  on public.website_audits (project_id);
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

drop policy if exists "website_audits_owner_update" on public.website_audits;
create policy "website_audits_owner_update"
  on public.website_audits for update
  using (auth.uid() = user_id)
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
