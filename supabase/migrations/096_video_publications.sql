-- P0-5: Hosted public Video Studio publications (not social campaigns).
-- One public slug per project. Artifacts stay in video_media; this table stores the publish target only.

create table if not exists public.video_publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  artifact_id text not null references public.video_media (id) on delete restrict,
  slug text not null,
  title text not null default '',
  description text not null default '',
  mime_type text not null,
  duration_sec numeric not null,
  platform text not null default 'web',
  status text not null default 'draft',
  published_at timestamptz,
  unpublished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_publications_slug_format check (slug ~ '^[a-z0-9-]{2,80}$'),
  constraint video_publications_slug_key unique (slug),
  constraint video_publications_project_key unique (project_id),
  constraint video_publications_platform_check check (platform = 'web'),
  constraint video_publications_status_check check (
    status in ('draft', 'publishing', 'published', 'unpublished', 'failed')
  ),
  constraint video_publications_mime_check check (
    lower(split_part(mime_type, ';', 1)) in ('video/mp4', 'video/webm')
  ),
  constraint video_publications_duration_positive check (duration_sec > 0)
);

comment on table public.video_publications is
  'Public Video Studio publish targets. storage_path is never stored here.';

alter table public.video_publications enable row level security;

drop policy if exists "Users can view own video publications" on public.video_publications;
create policy "Users can view own video publications"
  on public.video_publications for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own video publications" on public.video_publications;
create policy "Users can insert own video publications"
  on public.video_publications for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own video publications" on public.video_publications;
create policy "Users can update own video publications"
  on public.video_publications for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own video publications" on public.video_publications;
create policy "Users can delete own video publications"
  on public.video_publications for delete
  using (((select auth.uid()) = user_id));

-- Public page reads published rows only. No storage path column exists on this table.
drop policy if exists "Public can view published video pages" on public.video_publications;
create policy "Public can view published video pages"
  on public.video_publications for select
  using (status = 'published');

create index if not exists idx_video_publications_status
  on public.video_publications (status);
create index if not exists idx_video_publications_user_id
  on public.video_publications (user_id);

drop trigger if exists trg_video_publications_updated_at on public.video_publications;
create trigger trg_video_publications_updated_at
  before update on public.video_publications
  for each row execute function public.set_updated_at();

drop trigger if exists trg_video_publications_sync_owner on public.video_publications;
create trigger trg_video_publications_sync_owner
  before insert or update of project_id, user_id
  on public.video_publications
  for each row execute function public.video_studio_sync_child_owner();

grant select, insert, update, delete on table public.video_publications to authenticated, service_role;
grant select on table public.video_publications to anon;
