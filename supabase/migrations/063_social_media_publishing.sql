-- Social Media Manager Phase 2: publishing infrastructure

-- Upgrade social_accounts for production OAuth
alter table public.social_accounts
  add column if not exists account_id text not null default '',
  add column if not exists status text,
  add column if not exists access_token_encrypted text not null default '',
  add column if not exists refresh_token_encrypted text not null default '',
  add column if not exists expires_at timestamptz;

-- Migrate legacy columns
update public.social_accounts
set
  access_token_encrypted = case when access_token_encrypted = '' then encrypted_token else access_token_encrypted end,
  expires_at = coalesce(expires_at, token_expires_at),
  status = coalesce(status, connection_status)
where encrypted_token is not null or connection_status is not null;

alter table public.social_accounts
  alter column status set default 'disconnected';

update public.social_accounts set status = 'disconnected' where status is null;

alter table public.social_accounts drop constraint if exists social_accounts_status_check;
alter table public.social_accounts add constraint social_accounts_status_check
  check (status in ('connected', 'disconnected', 'expired', 'error', 'revoked'));

create index if not exists idx_social_accounts_account_id on public.social_accounts(account_id);
create index if not exists idx_social_accounts_status on public.social_accounts(status);

-- Analytics: clicks
alter table public.social_analytics
  add column if not exists clicks integer not null default 0;

-- Publishing jobs queue
create table if not exists public.social_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.social_posts(id) on delete cascade,
  account_id uuid references public.social_accounts(id) on delete set null,
  platform text not null,
  status text not null default 'pending' check (
    status in ('pending', 'queued', 'processing', 'published', 'failed', 'cancelled')
  ),
  scheduled_at timestamptz not null default now(),
  published_at timestamptz,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  error text not null default '',
  platform_post_id text not null default '',
  platform_response jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_publish_jobs enable row level security;

create policy "Users can view own social publish jobs"
  on public.social_publish_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own social publish jobs"
  on public.social_publish_jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own social publish jobs"
  on public.social_publish_jobs for update using (auth.uid() = user_id);
create policy "Users can delete own social publish jobs"
  on public.social_publish_jobs for delete using (auth.uid() = user_id);

create index if not exists idx_social_publish_jobs_user_id on public.social_publish_jobs(user_id);
create index if not exists idx_social_publish_jobs_post_id on public.social_publish_jobs(post_id);
create index if not exists idx_social_publish_jobs_status on public.social_publish_jobs(status);
create index if not exists idx_social_publish_jobs_scheduled_at on public.social_publish_jobs(scheduled_at);
create index if not exists idx_social_publish_jobs_platform on public.social_publish_jobs(platform);

-- Webhook events log
create table if not exists public.social_webhook_events (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  event_type text not null default '',
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.social_webhook_events enable row level security;

-- Webhooks are system-level; no user policies (service role inserts only)
create policy "Deny public webhook event access"
  on public.social_webhook_events for select using (false);

create index if not exists idx_social_webhook_events_platform on public.social_webhook_events(platform);
create index if not exists idx_social_webhook_events_created_at on public.social_webhook_events(created_at desc);
