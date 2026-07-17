-- Migration 031: Website Builder safe publish preparation (static HTML hosting architecture)

create table if not exists public.website_publications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  generation_id uuid references public.website_generations on delete cascade not null,
  project_id uuid references public.projects on delete set null,
  slug text not null,
  status text not null default 'prepared'
    check (status in ('prepared', 'published', 'unpublished')),
  public_path text not null,
  planned_public_url text,
  title text not null,
  preview_html text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (generation_id),
  unique (slug)
);

create index if not exists idx_website_publications_user
  on public.website_publications (user_id, created_at desc);

create index if not exists idx_website_publications_status
  on public.website_publications (status);

alter table public.website_publications enable row level security;

drop policy if exists "Users can view own website publications" on public.website_publications;
create policy "Users can view own website publications"
  on public.website_publications for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own website publications" on public.website_publications;
create policy "Users can insert own website publications"
  on public.website_publications for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own website publications" on public.website_publications;
create policy "Users can update own website publications"
  on public.website_publications for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own website publications" on public.website_publications;
create policy "Users can delete own website publications"
  on public.website_publications for delete using (auth.uid() = user_id);

-- Public hosted URL reads (only published rows; gated in app by WEBSITE_PUBLISH_ENABLED)
drop policy if exists "Anyone can view published website publications" on public.website_publications;
create policy "Anyone can view published website publications"
  on public.website_publications for select
  using (status = 'published');
