-- Phase 6D: async provider jobs — poll/resume fields.
-- Additive only. Does not rewrite blueprint JSON.

alter table public.video_provider_jobs
  add column if not exists retry_count integer not null default 0,
  add column if not exists next_poll_at timestamptz,
  add column if not exists started_at timestamptz;

alter table public.video_provider_jobs drop constraint if exists video_provider_jobs_retry_count_nonneg;
alter table public.video_provider_jobs
  add constraint video_provider_jobs_retry_count_nonneg check (retry_count >= 0);

create index if not exists idx_video_provider_jobs_poll
  on public.video_provider_jobs (status, next_poll_at)
  where status in ('queued', 'submitted', 'processing');

comment on column public.video_provider_jobs.retry_count is
  'Provider-side retries for the same scene. Distinct from user regenerateScene attempts.';
comment on column public.video_provider_jobs.next_poll_at is
  'Earliest time the background worker may poll this job. Null means due immediately.';
comment on column public.video_provider_jobs.started_at is
  'When provider submission started. Used for stale-job timeout after poll eligibility.';
