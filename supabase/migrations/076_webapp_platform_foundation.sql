-- Phase 4 — Webapp platform foundation (revision + idempotency)

alter table public.webapp_generations
  add column if not exists blueprint_revision integer not null default 0;

comment on column public.webapp_generations.blueprint_revision is
  'Monotonic revision counter for optimistic concurrency on app blueprint mutations.';

create table if not exists public.webapp_commit_idempotency (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_id uuid not null references public.webapp_generations (id) on delete cascade,
  idempotency_key text not null,
  operation text not null,
  response jsonb not null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  constraint webapp_commit_idempotency_unique
    unique (user_id, generation_id, idempotency_key)
);

create index if not exists idx_webapp_commit_idempotency_created
  on public.webapp_commit_idempotency (created_at desc);

create index if not exists idx_webapp_commit_idempotency_expires
  on public.webapp_commit_idempotency (expires_at);

alter table public.webapp_commit_idempotency enable row level security;

drop policy if exists "Users can view own webapp commit idempotency"
  on public.webapp_commit_idempotency;
create policy "Users can view own webapp commit idempotency"
  on public.webapp_commit_idempotency for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own webapp commit idempotency"
  on public.webapp_commit_idempotency;
create policy "Users can insert own webapp commit idempotency"
  on public.webapp_commit_idempotency for insert
  with check (auth.uid() = user_id);

comment on table public.webapp_commit_idempotency is
  'Idempotent webapp blueprint commit responses (Phase 4 platform foundation).';
