-- Brand assistant chat sessions
create table if not exists public.brand_assistant_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references public.brand_identity_generations(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  credits_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_brand_assistant_sessions_user
  on public.brand_assistant_sessions(user_id);
create index if not exists idx_brand_assistant_sessions_generation
  on public.brand_assistant_sessions(generation_id);

alter table public.brand_assistant_sessions enable row level security;

drop policy if exists "Users manage own brand assistant sessions" on public.brand_assistant_sessions;
create policy "Users manage own brand assistant sessions"
  on public.brand_assistant_sessions for all using (auth.uid() = user_id);
