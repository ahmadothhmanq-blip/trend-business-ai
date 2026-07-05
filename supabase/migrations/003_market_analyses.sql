-- Migration 003: Market analyses
create table if not exists public.market_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  industry text not null,
  region text not null,
  target_audience text not null,
  market_size text not null,
  growth_rate text not null,
  competitors text[] not null default '{}',
  opportunities text[] not null default '{}',
  risks text[] not null default '{}',
  summary text not null,
  is_favorite boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_market_analyses_user_id on public.market_analyses (user_id);
create index if not exists idx_market_analyses_user_favorite on public.market_analyses (user_id, is_favorite);
create index if not exists idx_market_analyses_industry on public.market_analyses (industry);
create index if not exists idx_market_analyses_created_at on public.market_analyses (created_at desc);

alter table public.market_analyses enable row level security;

drop policy if exists "Users can view own market analyses" on public.market_analyses;
create policy "Users can view own market analyses"
  on public.market_analyses for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own market analyses" on public.market_analyses;
create policy "Users can insert own market analyses"
  on public.market_analyses for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own market analyses" on public.market_analyses;
create policy "Users can update own market analyses"
  on public.market_analyses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own market analyses" on public.market_analyses;
create policy "Users can delete own market analyses"
  on public.market_analyses for delete using (auth.uid() = user_id);
