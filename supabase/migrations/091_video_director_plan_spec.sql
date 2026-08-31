-- Phase 5: Director plan spec + idempotency (additive on video_plans).
-- Legacy blueprint remains read-only. No new project root table.

alter table public.video_plans
  add column if not exists spec jsonb not null default '{}'::jsonb,
  add column if not exists idempotency_key text;

comment on column public.video_plans.spec is
  'Director VideoPlan document (audience, narrative, audioPlan, catalogs, variants, hints). Core columns stay typed.';
comment on column public.video_plans.idempotency_key is
  'Stable hash of project + planning request. Duplicate Director calls reuse the row.';

create unique index if not exists video_plans_project_idempotency_key
  on public.video_plans (project_id, idempotency_key)
  where idempotency_key is not null;
