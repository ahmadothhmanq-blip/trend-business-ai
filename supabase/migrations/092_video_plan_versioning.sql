-- Phase 6A: Plan versioning + scene isolation.
-- Evidence: video_scenes_project_order_key unique (project_id, scene_order)
-- makes it impossible for Plan v2 to store scene_order 0 while Plan v1 still has
-- scene_order 0. loadDomainScenes was also project-scoped and mixed versions.

alter table public.video_plans
  add column if not exists status text not null default 'inactive',
  add column if not exists is_active boolean not null default false,
  add column if not exists source_prompt text,
  add column if not exists source_hash text;

update public.video_plans p
set is_active = true,
    status = 'active'
from public.video_generations g
where g.active_plan_id = p.id
  and p.is_active = false;

update public.video_plans p
set is_active = true,
    status = 'active'
where p.is_active = false
  and p.id in (
    select distinct on (project_id) id
    from public.video_plans
    where project_id not in (
      select project_id from public.video_plans where is_active = true
    )
    order by project_id, version desc
  );

alter table public.video_plans drop constraint if exists video_plans_status_check;
alter table public.video_plans
  add constraint video_plans_status_check
  check (status in ('active', 'inactive', 'archived'));

alter table public.video_plans drop constraint if exists video_plans_active_matches_status;
alter table public.video_plans
  add constraint video_plans_active_matches_status
  check (
    (is_active = true and status = 'active')
    or (is_active = false and status in ('inactive', 'archived'))
  );

create unique index if not exists video_plans_one_active_per_project
  on public.video_plans (project_id)
  where is_active = true;

comment on column public.video_plans.status is
  'active | inactive | archived. Only one plan per project may be active.';
comment on column public.video_plans.is_active is
  'True for the single active plan. Rollback requires an explicit activatePlan call.';
comment on column public.video_plans.source_prompt is
  'Prompt that produced this plan version. Not copied onto scenes.';
comment on column public.video_plans.source_hash is
  'Stable planning request hash (Director idempotency key).';

alter table public.video_scenes drop constraint if exists video_scenes_project_order_key;

create unique index if not exists video_scenes_plan_order_key
  on public.video_scenes (plan_id, scene_order)
  where plan_id is not null;

create unique index if not exists video_scenes_legacy_null_plan_order_key
  on public.video_scenes (project_id, scene_order)
  where plan_id is null;
