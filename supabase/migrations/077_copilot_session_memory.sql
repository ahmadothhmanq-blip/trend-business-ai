-- Phase 5 — Copilot session memory

create table if not exists public.copilot_session_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  generation_id uuid not null,
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  command text,
  summary text,
  capability text,
  created_at timestamptz not null default now()
);

create index if not exists idx_copilot_session_memory_lookup
  on public.copilot_session_memory (user_id, product_id, generation_id, session_id, created_at desc);

alter table public.copilot_session_memory enable row level security;

drop policy if exists "Users can view own copilot session memory"
  on public.copilot_session_memory;
create policy "Users can view own copilot session memory"
  on public.copilot_session_memory for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own copilot session memory"
  on public.copilot_session_memory;
create policy "Users can insert own copilot session memory"
  on public.copilot_session_memory for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own copilot session memory"
  on public.copilot_session_memory;
create policy "Users can delete own copilot session memory"
  on public.copilot_session_memory for delete
  using (auth.uid() = user_id);

comment on table public.copilot_session_memory is
  'Copilot multi-turn session memory (Phase 5).';
