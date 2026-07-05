-- Migration 002: Business ideas
create table if not exists public.business_ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text not null,
  industry text not null,
  target_market text not null,
  revenue_model text not null,
  is_favorite boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_business_ideas_user_id on public.business_ideas (user_id);
create index if not exists idx_business_ideas_user_favorite on public.business_ideas (user_id, is_favorite);
create index if not exists idx_business_ideas_created_at on public.business_ideas (created_at desc);

alter table public.business_ideas enable row level security;

drop policy if exists "Users can view own business ideas" on public.business_ideas;
create policy "Users can view own business ideas"
  on public.business_ideas for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own business ideas" on public.business_ideas;
create policy "Users can insert own business ideas"
  on public.business_ideas for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own business ideas" on public.business_ideas;
create policy "Users can update own business ideas"
  on public.business_ideas for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own business ideas" on public.business_ideas;
create policy "Users can delete own business ideas"
  on public.business_ideas for delete using (auth.uid() = user_id);
