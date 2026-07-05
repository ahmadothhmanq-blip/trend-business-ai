-- Full schema for Supabase SQL Editor (run once on a fresh project).
-- Individual migrations live in supabase/migrations/ and should be applied in order.

-- Migration 001: Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  company text,
  role text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

-- Migration 004: AI reports
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  report_type text not null,
  topic text not null,
  timeframe text not null,
  content text not null,
  insights text[] not null default '{}',
  is_favorite boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_reports_user_id on public.reports (user_id);
create index if not exists idx_reports_user_favorite on public.reports (user_id, is_favorite);
create index if not exists idx_reports_report_type on public.reports (report_type);
create index if not exists idx_reports_created_at on public.reports (created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users can view own reports" on public.reports;
create policy "Users can view own reports"
  on public.reports for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own reports" on public.reports;
create policy "Users can insert own reports"
  on public.reports for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own reports" on public.reports;
create policy "Users can update own reports"
  on public.reports for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own reports" on public.reports;
create policy "Users can delete own reports"
  on public.reports for delete using (auth.uid() = user_id);

-- Migration 005: Unified favorites
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_type text not null check (item_type in ('business_idea', 'market_analysis', 'report', 'website_generation')),
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

-- Migration 006: User preferences
create table if not exists public.user_preferences (
  user_id uuid references auth.users on delete cascade primary key,
  theme text default 'dark' not null check (theme in ('light', 'dark', 'system')),
  email_notifications boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.user_preferences enable row level security;

drop policy if exists "Users can view own preferences" on public.user_preferences;
create policy "Users can view own preferences"
  on public.user_preferences for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences"
  on public.user_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
  on public.user_preferences for update using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Migration 007: Avatar storage
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

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
