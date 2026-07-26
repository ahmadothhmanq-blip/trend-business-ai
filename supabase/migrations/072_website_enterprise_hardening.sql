-- Migration 072: Website Builder enterprise hardening
-- - Restrict public domain resolution (hide verification_token)
-- - Tighten analytics insert policy to published sites only
-- - Index for resume/running generation queries

-- Public domain routing view (no secrets)
create or replace view public.website_active_domains_public as
select
  id,
  generation_id,
  hostname,
  kind,
  status,
  ssl_status,
  created_at,
  updated_at
from public.website_domains
where status = 'active';

grant select on public.website_active_domains_public to anon, authenticated;

drop policy if exists "Anyone can resolve active website domains" on public.website_domains;

create policy "Owners read own website domains"
  on public.website_domains for select
  using (auth.uid() = user_id);

-- Analytics: only allow inserts for published generations
drop policy if exists "Anyone can insert website analytics" on public.website_analytics_events;

create policy "Insert analytics for published websites"
  on public.website_analytics_events for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.website_publications wp
      where wp.generation_id = website_analytics_events.generation_id
        and wp.status = 'published'
    )
  );

create index if not exists idx_website_generations_user_status
  on public.website_generations (user_id, status);
