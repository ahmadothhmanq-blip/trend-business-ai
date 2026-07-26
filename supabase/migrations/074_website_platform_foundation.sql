-- Phase 0 — Website platform foundation (blueprint revisions, idempotency)

alter table public.website_generations
  add column if not exists blueprint_revision integer not null default 0;

comment on column public.website_generations.blueprint_revision is
  'Monotonic revision counter for optimistic concurrency on blueprint mutations.';

create table if not exists public.website_commit_idempotency (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_id uuid not null references public.website_generations (id) on delete cascade,
  idempotency_key text not null,
  operation text not null,
  response jsonb not null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint website_commit_idempotency_unique
    unique (user_id, generation_id, idempotency_key)
);

create index if not exists idx_website_commit_idempotency_created
  on public.website_commit_idempotency (created_at desc);

alter table public.website_commit_idempotency enable row level security;

drop policy if exists "Users can view own website commit idempotency"
  on public.website_commit_idempotency;
create policy "Users can view own website commit idempotency"
  on public.website_commit_idempotency for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own website commit idempotency"
  on public.website_commit_idempotency;
create policy "Users can insert own website commit idempotency"
  on public.website_commit_idempotency for insert
  with check (auth.uid() = user_id);

comment on table public.website_commit_idempotency is
  'Idempotent website blueprint commit responses (Phase 0 platform foundation).';
