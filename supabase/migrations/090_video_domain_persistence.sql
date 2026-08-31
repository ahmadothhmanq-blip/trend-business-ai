-- Phase 2: Video Studio domain persistence (additive, backward compatible).
-- Project root remains public.video_generations (unsafe to split from live JSONB rows).
-- Playable file storage remains public.video_media (no duplicate blob table).
-- Legacy video_generations.blueprint is NOT dropped.

-- ---------------------------------------------------------------------------
-- 0) Helpers
-- ---------------------------------------------------------------------------

create or replace function public.video_studio_playable_artifact_exists(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.video_media m
    where m.generation_id = p_project_id
      and lower(split_part(coalesce(m.mime_type, ''), ';', 1)) in ('video/mp4', 'video/webm')
      and coalesce(m.duration_sec, 0) > 0
      and lower(coalesce(m.provider, '')) not in ('preview', 'preview-stub')
      and lower(coalesce(m.mime_type, '')) not like '%svg%'
      and coalesce(m.storage_path, '') <> ''
  );
$$;

comment on function public.video_studio_playable_artifact_exists(uuid) is
  'True when the generation has a stored playable video/mp4 or video/webm artifact with duration > 0.';

-- ---------------------------------------------------------------------------
-- 1) video_generations is the project root — additive columns only
-- ---------------------------------------------------------------------------

alter table public.video_generations
  add column if not exists domain_state text,
  add column if not exists workflow text,
  add column if not exists language text,
  add column if not exists active_plan_id uuid;

comment on column public.video_generations.project_id is
  'Optional workspace/business project link. Domain video project id is video_generations.id.';
comment on column public.video_generations.domain_state is
  'Frozen Video Studio state machine. Null on unread legacy rows until backfill.';
comment on column public.video_generations.blueprint is
  'Legacy JSONB storyboard. Kept for read compatibility. Do not delete.';

alter table public.video_generations
  drop constraint if exists video_generations_domain_state_check;
alter table public.video_generations
  add constraint video_generations_domain_state_check
  check (
    domain_state is null
    or domain_state in (
      'draft',
      'planning',
      'storyboard_ready',
      'generating',
      'processing',
      'quality_check',
      'assembling',
      'video_rendered',
      'published',
      'failed',
      'cancelled'
    )
  );

alter table public.video_generations
  drop constraint if exists video_generations_status_check;
alter table public.video_generations
  add constraint video_generations_status_check
  check (status in (
    'pending',
    'generating',
    'storyboard_ready',
    'video_rendered',
    'completed',
    'failed',
    'draft',
    'planning',
    'processing',
    'quality_check',
    'assembling',
    'published',
    'cancelled'
  ));

create index if not exists idx_video_generations_domain_state
  on public.video_generations (domain_state);
create index if not exists idx_video_generations_workflow
  on public.video_generations (workflow);

-- Evidence-based backfill only: map existing status → domain_state.
update public.video_generations
set domain_state = case status
  when 'pending' then 'draft'
  when 'generating' then 'generating'
  when 'storyboard_ready' then 'storyboard_ready'
  when 'video_rendered' then 'video_rendered'
  when 'failed' then 'failed'
  when 'completed' then 'storyboard_ready'
  else coalesce(domain_state, 'draft')
end
where domain_state is null;

-- ---------------------------------------------------------------------------
-- 2) video_plans
-- ---------------------------------------------------------------------------

create table if not exists public.video_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  version integer not null default 1,
  objective text not null default '',
  language text not null default 'en',
  aspect_ratio text not null default '16:9',
  duration_sec numeric not null default 0,
  style text not null default '',
  budget_credits numeric,
  pacing text not null default '',
  preferred_provider text not null default 'auto',
  created_at timestamptz not null default now(),
  constraint video_plans_version_positive check (version >= 1),
  constraint video_plans_preferred_provider_check check (
    preferred_provider in ('veo', 'kling', 'runway', 'heygen', 'auto')
  ),
  constraint video_plans_project_version_key unique (project_id, version)
);

alter table public.video_plans enable row level security;

drop policy if exists "Users can view own video plans" on public.video_plans;
create policy "Users can view own video plans"
  on public.video_plans for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own video plans" on public.video_plans;
create policy "Users can insert own video plans"
  on public.video_plans for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own video plans" on public.video_plans;
create policy "Users can update own video plans"
  on public.video_plans for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own video plans" on public.video_plans;
create policy "Users can delete own video plans"
  on public.video_plans for delete
  using (((select auth.uid()) = user_id));

create index if not exists idx_video_plans_user_id on public.video_plans (user_id);
create index if not exists idx_video_plans_created_at on public.video_plans (created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'video_generations_active_plan_id_fkey'
  ) then
    alter table public.video_generations
      add constraint video_generations_active_plan_id_fkey
      foreign key (active_plan_id) references public.video_plans (id) on delete set null;
  end if;
end $$;

create index if not exists idx_video_generations_active_plan_id
  on public.video_generations (active_plan_id);

-- ---------------------------------------------------------------------------
-- 3) video_scenes
-- ---------------------------------------------------------------------------

create table if not exists public.video_scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  plan_id uuid references public.video_plans (id) on delete set null,
  scene_order integer not null,
  duration_sec numeric not null,
  prompt text not null,
  camera jsonb not null default '{}'::jsonb,
  visual_style text not null default '',
  scene_references jsonb not null default '[]'::jsonb,
  characters jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  dialogue jsonb not null default '{}'::jsonb,
  audio jsonb not null default '{}'::jsonb,
  transition text not null default 'cut',
  provider_preference text not null default 'auto',
  fallback_provider text,
  status text not null default 'planned',
  quality_score numeric,
  artifact_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_scenes_order_nonnegative check (scene_order >= 0),
  constraint video_scenes_duration_positive check (duration_sec > 0),
  constraint video_scenes_provider_preference_check check (
    provider_preference in ('veo', 'kling', 'runway', 'heygen', 'auto')
  ),
  constraint video_scenes_fallback_provider_check check (
    fallback_provider is null
    or fallback_provider in ('veo', 'kling', 'runway', 'heygen', 'external')
  ),
  constraint video_scenes_status_check check (
    status in ('draft', 'planned', 'generating', 'processing', 'ready', 'failed', 'cancelled')
  ),
  constraint video_scenes_quality_score_check check (
    quality_score is null or (quality_score >= 0 and quality_score <= 100)
  ),
  constraint video_scenes_ready_requires_artifact check (
    status <> 'ready' or coalesce(artifact_id, '') <> ''
  ),
  constraint video_scenes_project_order_key unique (project_id, scene_order) deferrable initially deferred
);

alter table public.video_scenes enable row level security;

drop policy if exists "Users can view own video scenes" on public.video_scenes;
create policy "Users can view own video scenes"
  on public.video_scenes for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own video scenes" on public.video_scenes;
create policy "Users can insert own video scenes"
  on public.video_scenes for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own video scenes" on public.video_scenes;
create policy "Users can update own video scenes"
  on public.video_scenes for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own video scenes" on public.video_scenes;
create policy "Users can delete own video scenes"
  on public.video_scenes for delete
  using (((select auth.uid()) = user_id));

create index if not exists idx_video_scenes_project_status
  on public.video_scenes (project_id, status);
create index if not exists idx_video_scenes_plan_id
  on public.video_scenes (plan_id);
create index if not exists idx_video_scenes_created_at
  on public.video_scenes (created_at desc);

drop trigger if exists trg_video_scenes_updated_at on public.video_scenes;
create trigger trg_video_scenes_updated_at
  before update on public.video_scenes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Evolve video_media into the artifact store (no duplicate storage)
-- ---------------------------------------------------------------------------

alter table public.video_media
  add column if not exists scene_id uuid,
  add column if not exists sha256 text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists fps numeric,
  add column if not exists codec text,
  add column if not exists qc_score numeric;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'video_media_scene_id_fkey'
  ) then
    alter table public.video_media
      add constraint video_media_scene_id_fkey
      foreign key (scene_id) references public.video_scenes (id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'video_scenes_artifact_id_fkey'
  ) then
    alter table public.video_scenes
      add constraint video_scenes_artifact_id_fkey
      foreign key (artifact_id) references public.video_media (id) on delete set null;
  end if;
end $$;

create index if not exists idx_video_media_generation_kind
  on public.video_media (generation_id, kind);
create index if not exists idx_video_media_scene_id
  on public.video_media (scene_id);
create index if not exists idx_video_media_created_at
  on public.video_media (created_at desc);

create or replace view public.video_artifacts
with (security_invoker = true) as
select
  m.id,
  m.user_id,
  m.generation_id as project_id,
  m.scene_id,
  case
    when m.kind = 'clip' then 'scene_clip'
    else m.kind
  end as kind,
  m.storage_path,
  m.mime_type,
  m.sha256,
  m.size_bytes,
  m.width,
  m.height,
  m.duration_sec,
  m.fps,
  m.codec,
  m.qc_score,
  m.created_at
from public.video_media m;

comment on view public.video_artifacts is
  'Domain read alias over video_media. Writes go to video_media so storage is not duplicated.';

-- ---------------------------------------------------------------------------
-- 5) video_provider_jobs
-- ---------------------------------------------------------------------------

create table if not exists public.video_provider_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  scene_id uuid not null references public.video_scenes (id) on delete cascade,
  provider text not null,
  external_job_id text,
  status text not null default 'queued',
  attempt integer not null default 1,
  idempotency_key text not null,
  estimated_cost numeric,
  actual_cost numeric,
  error_code text,
  error_message text,
  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint video_provider_jobs_attempt_positive check (attempt >= 1),
  constraint video_provider_jobs_provider_check check (
    provider in ('veo', 'kling', 'runway', 'heygen', 'external')
  ),
  constraint video_provider_jobs_status_check check (
    status in ('queued', 'submitted', 'processing', 'succeeded', 'failed', 'cancelled')
  ),
  constraint video_provider_jobs_idempotency_key_key unique (idempotency_key),
  constraint video_provider_jobs_scene_provider_key unique (project_id, scene_id, provider, idempotency_key)
);

alter table public.video_provider_jobs enable row level security;

drop policy if exists "Users can view own video provider jobs" on public.video_provider_jobs;
create policy "Users can view own video provider jobs"
  on public.video_provider_jobs for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own video provider jobs" on public.video_provider_jobs;
create policy "Users can insert own video provider jobs"
  on public.video_provider_jobs for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own video provider jobs" on public.video_provider_jobs;
create policy "Users can update own video provider jobs"
  on public.video_provider_jobs for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own video provider jobs" on public.video_provider_jobs;
create policy "Users can delete own video provider jobs"
  on public.video_provider_jobs for delete
  using (((select auth.uid()) = user_id));

create index if not exists idx_video_provider_jobs_project_status
  on public.video_provider_jobs (project_id, status);
create index if not exists idx_video_provider_jobs_scene_status
  on public.video_provider_jobs (scene_id, status);
create index if not exists idx_video_provider_jobs_created_at
  on public.video_provider_jobs (created_at desc);

-- idx on idempotency_key is provided by UNIQUE (idempotency_key)

-- ---------------------------------------------------------------------------
-- 6) video_quality_reports
-- ---------------------------------------------------------------------------

create table if not exists public.video_quality_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  scene_id uuid references public.video_scenes (id) on delete set null,
  artifact_id text references public.video_media (id) on delete set null,
  score numeric not null default 0,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint video_quality_reports_score_check check (score >= 0 and score <= 100)
);

alter table public.video_quality_reports enable row level security;

drop policy if exists "Users can view own video quality reports" on public.video_quality_reports;
create policy "Users can view own video quality reports"
  on public.video_quality_reports for select
  using (((select auth.uid()) = user_id));

drop policy if exists "Users can insert own video quality reports" on public.video_quality_reports;
create policy "Users can insert own video quality reports"
  on public.video_quality_reports for insert
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can update own video quality reports" on public.video_quality_reports;
create policy "Users can update own video quality reports"
  on public.video_quality_reports for update
  using (((select auth.uid()) = user_id))
  with check (((select auth.uid()) = user_id));

drop policy if exists "Users can delete own video quality reports" on public.video_quality_reports;
create policy "Users can delete own video quality reports"
  on public.video_quality_reports for delete
  using (((select auth.uid()) = user_id));

create index if not exists idx_video_quality_reports_project_id
  on public.video_quality_reports (project_id);
create index if not exists idx_video_quality_reports_scene_id
  on public.video_quality_reports (scene_id);
create index if not exists idx_video_quality_reports_artifact_id
  on public.video_quality_reports (artifact_id);
create index if not exists idx_video_quality_reports_created_at
  on public.video_quality_reports (created_at desc);

-- ---------------------------------------------------------------------------
-- 7) video_render_jobs → project / scene / artifact
-- ---------------------------------------------------------------------------

alter table public.video_render_jobs
  add column if not exists scene_id uuid,
  add column if not exists artifact_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'video_render_jobs_scene_id_fkey'
  ) then
    alter table public.video_render_jobs
      add constraint video_render_jobs_scene_id_fkey
      foreign key (scene_id) references public.video_scenes (id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'video_render_jobs_artifact_id_fkey'
  ) then
    alter table public.video_render_jobs
      add constraint video_render_jobs_artifact_id_fkey
      foreign key (artifact_id) references public.video_media (id) on delete set null;
  end if;
end $$;

create index if not exists idx_video_render_jobs_scene_id
  on public.video_render_jobs (scene_id);
create index if not exists idx_video_render_jobs_artifact_id
  on public.video_render_jobs (artifact_id);
create index if not exists idx_video_render_jobs_created_at
  on public.video_render_jobs (created_at desc);

do $$
begin
  if exists (
    select 1
    from public.video_render_jobs
    where status in ('queued', 'processing', 'rendering')
    group by generation_id, mode
    having count(*) > 1
  ) then
    raise notice 'Skipping unique active render index; duplicate active jobs exist';
  else
    create unique index if not exists video_render_jobs_one_active_per_mode
      on public.video_render_jobs (generation_id, mode)
      where status in ('queued', 'processing', 'rendering');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 8) Ownership sync + state / MIME guards
-- ---------------------------------------------------------------------------

create or replace function public.video_studio_sync_child_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
begin
  select g.user_id into owner
  from public.video_generations g
  where g.id = new.project_id;

  if owner is null then
    raise exception 'Video domain row must reference an existing video_generations project'
      using errcode = '23503';
  end if;

  new.user_id := owner;
  return new;
end;
$$;

drop trigger if exists trg_video_plans_sync_owner on public.video_plans;
create trigger trg_video_plans_sync_owner
  before insert or update of project_id, user_id
  on public.video_plans
  for each row execute function public.video_studio_sync_child_owner();

drop trigger if exists trg_video_scenes_sync_owner on public.video_scenes;
create trigger trg_video_scenes_sync_owner
  before insert or update of project_id, user_id
  on public.video_scenes
  for each row execute function public.video_studio_sync_child_owner();

drop trigger if exists trg_video_provider_jobs_sync_owner on public.video_provider_jobs;
create trigger trg_video_provider_jobs_sync_owner
  before insert or update of project_id, user_id
  on public.video_provider_jobs
  for each row execute function public.video_studio_sync_child_owner();

drop trigger if exists trg_video_quality_reports_sync_owner on public.video_quality_reports;
create trigger trg_video_quality_reports_sync_owner
  before insert or update of project_id, user_id
  on public.video_quality_reports
  for each row execute function public.video_studio_sync_child_owner();

create or replace function public.video_studio_guard_generation_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  playable boolean;
  status_transitioning_to_rendered boolean;
  domain_transitioning_to_rendered boolean;
  domain_transitioning_to_published boolean;
begin
  if new.status = 'completed'
     and (tg_op = 'INSERT' or coalesce(old.status, '') is distinct from 'completed') then
    raise exception 'Legacy status "completed" cannot be written for new Video Studio projects'
      using errcode = '23514';
  end if;

  status_transitioning_to_rendered :=
    new.status = 'video_rendered'
    and (
      tg_op = 'INSERT'
      or coalesce(old.status, '') is distinct from 'video_rendered'
    );

  domain_transitioning_to_rendered :=
    new.domain_state = 'video_rendered'
    and (
      tg_op = 'INSERT'
      or coalesce(old.domain_state, '') is distinct from 'video_rendered'
    )
    and coalesce(old.status, '') is distinct from 'video_rendered';

  domain_transitioning_to_published :=
    new.domain_state = 'published'
    and (
      tg_op = 'INSERT'
      or coalesce(old.domain_state, '') is distinct from 'published'
    );

  if new.domain_state = 'published'
     and coalesce(new.status, '') not in ('video_rendered', 'published')
     and coalesce(old.status, '') is distinct from 'video_rendered' then
    raise exception 'published requires a prior video_rendered project status'
      using errcode = '23514';
  end if;

  if status_transitioning_to_rendered
     or domain_transitioning_to_rendered
     or domain_transitioning_to_published then
    playable := public.video_studio_playable_artifact_exists(new.id);
    if not playable then
      raise exception 'video_rendered/published requires a playable video/mp4 or video/webm artifact with duration > 0'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_video_generations_guard_state on public.video_generations;
create trigger trg_video_generations_guard_state
  before insert or update of status, domain_state
  on public.video_generations
  for each row execute function public.video_studio_guard_generation_state();

create or replace function public.video_studio_guard_media_artifact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mime text;
begin
  mime := lower(split_part(coalesce(new.mime_type, ''), ';', 1));

  if new.kind in ('clip', 'composite', 'scene_clip') then
    if mime like '%svg%' or mime in ('image/svg+xml', 'text/html') then
      raise exception 'SVG/preview documents are not playable video artifacts'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_video_media_guard_artifact on public.video_media;
create trigger trg_video_media_guard_artifact
  before insert or update of mime_type, kind
  on public.video_media
  for each row execute function public.video_studio_guard_media_artifact();

-- ---------------------------------------------------------------------------
-- 9) Grants (Supabase roles)
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on table public.video_plans to authenticated, service_role;
grant select, insert, update, delete on table public.video_scenes to authenticated, service_role;
grant select, insert, update, delete on table public.video_provider_jobs to authenticated, service_role;
grant select, insert, update, delete on table public.video_quality_reports to authenticated, service_role;
grant select on table public.video_artifacts to authenticated, service_role;
grant execute on function public.video_studio_playable_artifact_exists(uuid) to authenticated, service_role;
