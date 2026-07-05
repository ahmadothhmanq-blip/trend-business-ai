-- Migration 008: AI website builder generations
create table if not exists public.website_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  project_name text not null,
  website_type text not null,
  business_description text not null,
  target_audience text not null,
  language text not null,
  color_style text not null,
  design_style text not null,
  page_count text not null,
  features text[] not null default '{}',
  blueprint jsonb not null,
  is_favorite boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_website_generations_user_id on public.website_generations (user_id);
create index if not exists idx_website_generations_created_at on public.website_generations (created_at desc);
create index if not exists idx_website_generations_project_name on public.website_generations (project_name);
create index if not exists idx_website_generations_user_favorite on public.website_generations (user_id, is_favorite);

alter table public.website_generations enable row level security;

drop policy if exists "Users can view own website generations" on public.website_generations;
create policy "Users can view own website generations"
  on public.website_generations for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own website generations" on public.website_generations;
create policy "Users can insert own website generations"
  on public.website_generations for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own website generations" on public.website_generations;
create policy "Users can update own website generations"
  on public.website_generations for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own website generations" on public.website_generations;
create policy "Users can delete own website generations"
  on public.website_generations for delete using (auth.uid() = user_id);
