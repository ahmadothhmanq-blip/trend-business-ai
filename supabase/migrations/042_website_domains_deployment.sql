-- Migration 042: Custom domains + deployment history for Website Builder publishing

create table if not exists public.website_domains (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  generation_id uuid references public.website_generations on delete cascade not null,
  publication_id uuid references public.website_publications on delete set null,
  hostname text not null,
  slug text,
  kind text not null default 'custom' check (kind in ('subdomain', 'custom')),
  status text not null default 'pending_dns' check (
    status in ('pending_dns', 'verifying', 'active', 'failed', 'removed')
  ),
  verification_token text not null,
  verified_at timestamptz,
  ssl_status text not null default 'not_started' check (
    ssl_status in ('not_started', 'pending', 'provisioning', 'active', 'error')
  ),
  dns_instructions jsonb not null default '[]'::jsonb,
  last_checked_at timestamptz,
  last_check_message text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Prevent duplicate active/pending domain usage across accounts
create unique index if not exists uq_website_domains_hostname_active
  on public.website_domains (hostname)
  where status <> 'removed';

create index if not exists idx_website_domains_generation
  on public.website_domains (generation_id, status);

create index if not exists idx_website_domains_user
  on public.website_domains (user_id);

alter table public.website_domains enable row level security;

drop policy if exists "Users manage own website domains" on public.website_domains;
create policy "Users manage own website domains"
  on public.website_domains for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public resolve for active custom domains (host routing)
drop policy if exists "Anyone can resolve active website domains" on public.website_domains;
create policy "Anyone can resolve active website domains"
  on public.website_domains for select
  using (status = 'active');

create table if not exists public.website_deployment_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  generation_id uuid references public.website_generations on delete cascade not null,
  kind text not null check (
    kind in (
      'prepared',
      'published',
      'republished',
      'unpublished',
      'archived',
      'domain_added',
      'domain_verified',
      'domain_removed',
      'ssl_ready'
    )
  ),
  message text not null default '',
  url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create index if not exists idx_website_deployment_events_generation
  on public.website_deployment_events (generation_id, created_at desc);

alter table public.website_deployment_events enable row level security;

drop policy if exists "Users manage own deployment events" on public.website_deployment_events;
create policy "Users manage own deployment events"
  on public.website_deployment_events for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
