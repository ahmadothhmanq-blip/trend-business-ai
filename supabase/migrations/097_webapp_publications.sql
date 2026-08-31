-- App Builder public publications (static HTML host at /w/app/[slug]).
-- Mirrors website_publications pattern — no npm build on the platform (D-004).

create table if not exists public.webapp_publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generation_id uuid not null references public.webapp_generations (id) on delete cascade,
  slug text not null,
  title text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'unpublished', 'failed')),
  public_path text not null,
  planned_public_url text,
  preview_html text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint webapp_publications_slug_format check (slug ~ '^[a-z0-9-]{2,80}$'),
  constraint webapp_publications_slug_key unique (slug),
  constraint webapp_publications_generation_key unique (generation_id)
);

comment on table public.webapp_publications is
  'Public App Builder HTML hosts served at /w/app/[slug]. Full Next.js deploy remains ZIP + customer Node host.';

alter table public.webapp_publications enable row level security;

drop policy if exists "Users can view own webapp publications" on public.webapp_publications;
create policy "Users can view own webapp publications"
  on public.webapp_publications for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own webapp publications" on public.webapp_publications;
create policy "Users can insert own webapp publications"
  on public.webapp_publications for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own webapp publications" on public.webapp_publications;
create policy "Users can update own webapp publications"
  on public.webapp_publications for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own webapp publications" on public.webapp_publications;
create policy "Users can delete own webapp publications"
  on public.webapp_publications for delete
  using (((select auth.uid()) = user_id));

drop policy if exists "Anyone can view published webapp publications" on public.webapp_publications;
create policy "Anyone can view published webapp publications"
  on public.webapp_publications for select
  using (status = 'published');

create index if not exists idx_webapp_publications_user
  on public.webapp_publications (user_id, created_at desc);
create index if not exists idx_webapp_publications_status
  on public.webapp_publications (status);
