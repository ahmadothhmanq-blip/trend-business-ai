-- Migration 041: Website Builder analytics + A/B testing (generation-scoped)

create table if not exists public.website_analytics_events (
  id uuid default gen_random_uuid() primary key,
  generation_id uuid references public.website_generations on delete cascade not null,
  event_name text not null check (
    event_name in (
      'page_view',
      'session_start',
      'button_click',
      'conversion',
      'cta_click',
      'scroll',
      'form_submit'
    )
  ),
  session_id text not null,
  visitor_id text not null,
  page_path text not null default '/',
  referrer text,
  source text not null default 'unknown',
  device text not null default 'desktop' check (
    device in ('desktop', 'tablet', 'mobile')
  ),
  experiment_id text,
  variant_id text,
  target text,
  value_cents integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create index if not exists idx_wae_generation_created
  on public.website_analytics_events (generation_id, created_at desc);
create index if not exists idx_wae_generation_event
  on public.website_analytics_events (generation_id, event_name);
create index if not exists idx_wae_session
  on public.website_analytics_events (session_id);

alter table public.website_analytics_events enable row level security;

drop policy if exists "Anyone can insert website analytics" on public.website_analytics_events;
create policy "Anyone can insert website analytics"
  on public.website_analytics_events for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Owners read website analytics" on public.website_analytics_events;
create policy "Owners read website analytics"
  on public.website_analytics_events for select using (
    generation_id in (
      select id from public.website_generations where user_id = auth.uid()
    )
  );

create table if not exists public.website_experiments (
  id uuid default gen_random_uuid() primary key,
  generation_id uuid references public.website_generations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  hypothesis text not null default '',
  status text not null default 'draft' check (
    status in ('draft', 'running', 'paused', 'completed', 'archived')
  ),
  change_types text[] not null default '{}',
  variants jsonb not null default '[]'::jsonb,
  min_sample_size integer not null default 40,
  confidence_threshold numeric(4,3) not null default 0.900,
  winner_variant_id text,
  winner_declared_at timestamptz,
  winner_reason text,
  started_at timestamptz,
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_website_experiments_generation
  on public.website_experiments (generation_id, status);

alter table public.website_experiments enable row level security;

drop policy if exists "Users manage own website experiments" on public.website_experiments;
create policy "Users manage own website experiments"
  on public.website_experiments for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
