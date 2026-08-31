-- Phase 7: Audio engine persistence (jobs, tracks, mix metadata).
-- Artifacts live in video_media. Additive only.

create table if not exists public.video_audio_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  plan_id uuid references public.video_plans (id) on delete set null,
  language text not null default 'en',
  voice_script text not null default '',
  target_duration_sec numeric not null default 8,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_audio_plans_status_check check (
    status in ('queued', 'submitted', 'processing', 'succeeded', 'failed', 'cancelled')
  )
);

alter table public.video_audio_plans enable row level security;

drop policy if exists "Users can view own video audio plans" on public.video_audio_plans;
create policy "Users can view own video audio plans"
  on public.video_audio_plans for select using (((select auth.uid()) = user_id));
drop policy if exists "Users can insert own video audio plans" on public.video_audio_plans;
create policy "Users can insert own video audio plans"
  on public.video_audio_plans for insert with check (((select auth.uid()) = user_id));
drop policy if exists "Users can update own video audio plans" on public.video_audio_plans;
create policy "Users can update own video audio plans"
  on public.video_audio_plans for update
  using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
drop policy if exists "Users can delete own video audio plans" on public.video_audio_plans;
create policy "Users can delete own video audio plans"
  on public.video_audio_plans for delete using (((select auth.uid()) = user_id));

create index if not exists idx_video_audio_plans_project on public.video_audio_plans (project_id);

create table if not exists public.video_audio_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  audio_plan_id uuid not null references public.video_audio_plans (id) on delete cascade,
  kind text not null,
  metadata jsonb not null default '{}'::jsonb,
  artifact_id text references public.video_media (id) on delete set null,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  constraint video_audio_tracks_kind_check check (kind in ('voice', 'music', 'sfx')),
  constraint video_audio_tracks_status_check check (
    status in ('queued', 'submitted', 'processing', 'succeeded', 'failed', 'cancelled')
  )
);

alter table public.video_audio_tracks enable row level security;
drop policy if exists "Users can view own video audio tracks" on public.video_audio_tracks;
create policy "Users can view own video audio tracks"
  on public.video_audio_tracks for select using (((select auth.uid()) = user_id));
drop policy if exists "Users can insert own video audio tracks" on public.video_audio_tracks;
create policy "Users can insert own video audio tracks"
  on public.video_audio_tracks for insert with check (((select auth.uid()) = user_id));
drop policy if exists "Users can update own video audio tracks" on public.video_audio_tracks;
create policy "Users can update own video audio tracks"
  on public.video_audio_tracks for update
  using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
drop policy if exists "Users can delete own video audio tracks" on public.video_audio_tracks;
create policy "Users can delete own video audio tracks"
  on public.video_audio_tracks for delete using (((select auth.uid()) = user_id));

create index if not exists idx_video_audio_tracks_plan on public.video_audio_tracks (audio_plan_id, kind);

create table if not exists public.video_audio_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  audio_plan_id uuid references public.video_audio_plans (id) on delete set null,
  track_id uuid references public.video_audio_tracks (id) on delete set null,
  kind text not null,
  provider text not null,
  status text not null default 'queued',
  attempt integer not null default 1,
  idempotency_key text not null,
  estimated_cost numeric,
  actual_cost numeric,
  error_code text,
  error_message text,
  artifact_id text references public.video_media (id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint video_audio_jobs_kind_check check (kind in ('tts', 'music', 'sfx', 'mix')),
  constraint video_audio_jobs_status_check check (
    status in ('queued', 'submitted', 'processing', 'succeeded', 'failed', 'cancelled')
  ),
  constraint video_audio_jobs_attempt_positive check (attempt >= 1),
  constraint video_audio_jobs_idempotency_key_key unique (idempotency_key)
);

alter table public.video_audio_jobs enable row level security;
drop policy if exists "Users can view own video audio jobs" on public.video_audio_jobs;
create policy "Users can view own video audio jobs"
  on public.video_audio_jobs for select using (((select auth.uid()) = user_id));
drop policy if exists "Users can insert own video audio jobs" on public.video_audio_jobs;
create policy "Users can insert own video audio jobs"
  on public.video_audio_jobs for insert with check (((select auth.uid()) = user_id));
drop policy if exists "Users can update own video audio jobs" on public.video_audio_jobs;
create policy "Users can update own video audio jobs"
  on public.video_audio_jobs for update
  using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
drop policy if exists "Users can delete own video audio jobs" on public.video_audio_jobs;
create policy "Users can delete own video audio jobs"
  on public.video_audio_jobs for delete using (((select auth.uid()) = user_id));

create index if not exists idx_video_audio_jobs_project_status
  on public.video_audio_jobs (project_id, status);

grant select, insert, update, delete on table public.video_audio_plans to authenticated, service_role;
grant select, insert, update, delete on table public.video_audio_tracks to authenticated, service_role;
grant select, insert, update, delete on table public.video_audio_jobs to authenticated, service_role;
