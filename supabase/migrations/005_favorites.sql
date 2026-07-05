-- Migration 005: Unified favorites
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_type text not null check (item_type in ('business_idea', 'market_analysis', 'report')),
  item_id uuid not null,
  created_at timestamptz default now() not null,
  unique (user_id, item_type, item_id)
);

create index if not exists idx_favorites_user_id on public.favorites (user_id);
create index if not exists idx_favorites_item on public.favorites (item_type, item_id);

alter table public.favorites enable row level security;

drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
  on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);
