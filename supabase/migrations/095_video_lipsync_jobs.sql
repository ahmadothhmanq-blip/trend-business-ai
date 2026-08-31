-- Phase 8: Lip-sync jobs (HeyGen). Artifacts stay in video_media.
-- Isolated from video_provider_jobs so the clip worker cannot poll these rows.

create table if not exists public.video_lipsync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.video_generations (id) on delete cascade,
  source_artifact_id text references public.video_media (id) on delete set null,
  audio_artifact_id text references public.video_media (id) on delete set null,
  result_artifact_id text references public.video_media (id) on delete set null,
  provider text not null default 'heygen',
  status text not null default 'queued',
  attempt integer not null default 1,
  idempotency_key text not null,
  estimated_cost numeric,
  actual_cost numeric,
  speaker text,
  language text,
  start_sec numeric,
  end_sec numeric,
  external_job_id text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint video_lipsync_jobs_status_check check (
    status in ('queued', 'submitted', 'processing', 'succeeded', 'failed', 'cancelled')
  ),
  constraint video_lipsync_jobs_attempt_positive check (attempt >= 1),
  constraint video_lipsync_jobs_idempotency_key_key unique (idempotency_key)
);

alter table public.video_lipsync_jobs enable row level security;

drop policy if exists "Users can view own video lipsync jobs" on public.video_lipsync_jobs;
create policy "Users can view own video lipsync jobs"
  on public.video_lipsync_jobs for select using (((select auth.uid()) = user_id));
drop policy if exists "Users can insert own video lipsync jobs" on public.video_lipsync_jobs;
create policy "Users can insert own video lipsync jobs"
  on public.video_lipsync_jobs for insert with check (((select auth.uid()) = user_id));
drop policy if exists "Users can update own video lipsync jobs" on public.video_lipsync_jobs;
create policy "Users can update own video lipsync jobs"
  on public.video_lipsync_jobs for update
  using (((select auth.uid()) = user_id)) with check (((select auth.uid()) = user_id));
drop policy if exists "Users can delete own video lipsync jobs" on public.video_lipsync_jobs;
create policy "Users can delete own video lipsync jobs"
  on public.video_lipsync_jobs for delete using (((select auth.uid()) = user_id));

create index if not exists idx_video_lipsync_jobs_project_status
  on public.video_lipsync_jobs (project_id, status);

grant select, insert, update, delete on table public.video_lipsync_jobs to authenticated, service_role;
