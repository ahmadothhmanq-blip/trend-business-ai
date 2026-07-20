-- App Builder deployments (preview + production environments)
create table if not exists public.webapp_deployments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references public.webapp_generations(id) on delete cascade,
  environment text not null check (environment in ('preview', 'production')),
  status text not null default 'queued',
  url text not null default '',
  env jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.webapp_deployments enable row level security;

drop policy if exists "Users can view own app deployments" on public.webapp_deployments;
create policy "Users can view own app deployments"
  on public.webapp_deployments for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own app deployments" on public.webapp_deployments;
create policy "Users can insert own app deployments"
  on public.webapp_deployments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own app deployments" on public.webapp_deployments;
create policy "Users can update own app deployments"
  on public.webapp_deployments for update using (auth.uid() = user_id);

create index if not exists idx_webapp_deployments_user on public.webapp_deployments(user_id);
create index if not exists idx_webapp_deployments_generation on public.webapp_deployments(generation_id);
