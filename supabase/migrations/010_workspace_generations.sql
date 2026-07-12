-- Migration 010: AI workspace generations (brand, content, marketing, etc.)
create table if not exists public.workspace_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  workspace_type text not null check (
    workspace_type in (
      'brand',
      'creative',
      'content',
      'business',
      'manager',
      'marketing',
      'social',
      'audit'
    )
  ),
  title text not null,
  brief text not null,
  template text,
  language text not null default 'English',
  theme text not null default 'Gold',
  features text[] not null default '{}',
  output jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_generations_user_id
  on public.workspace_generations (user_id);

create index if not exists idx_workspace_generations_created_at
  on public.workspace_generations (created_at desc);

create index if not exists idx_workspace_generations_type
  on public.workspace_generations (workspace_type);

create index if not exists idx_workspace_generations_favorite
  on public.workspace_generations (user_id, is_favorite);

alter table public.workspace_generations enable row level security;

drop policy if exists "Users can view own workspace generations" on public.workspace_generations;
create policy "Users can view own workspace generations"
  on public.workspace_generations for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own workspace generations" on public.workspace_generations;
create policy "Users can insert own workspace generations"
  on public.workspace_generations for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own workspace generations" on public.workspace_generations;
create policy "Users can update own workspace generations"
  on public.workspace_generations for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own workspace generations" on public.workspace_generations;
create policy "Users can delete own workspace generations"
  on public.workspace_generations for delete using (auth.uid() = user_id);

alter table public.favorites drop constraint if exists favorites_item_type_check;
alter table public.favorites add constraint favorites_item_type_check
  check (
    item_type in (
      'business_idea',
      'market_analysis',
      'report',
      'website_generation',
      'workspace_generation'
    )
  );
