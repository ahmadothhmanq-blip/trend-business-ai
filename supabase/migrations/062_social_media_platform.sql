-- Social Media Manager platform tables

-- Connected accounts (OAuth foundation — tokens stored encrypted at app layer)
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (
    platform in ('facebook', 'instagram', 'whatsapp', 'messenger', 'linkedin', 'x', 'tiktok')
  ),
  account_name text not null default '',
  account_handle text not null default '',
  connection_status text not null default 'disconnected' check (
    connection_status in ('connected', 'disconnected', 'expired', 'error')
  ),
  encrypted_token text not null default '',
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_accounts enable row level security;

create policy "Users can view own social accounts"
  on public.social_accounts for select using (auth.uid() = user_id);
create policy "Users can insert own social accounts"
  on public.social_accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own social accounts"
  on public.social_accounts for update using (auth.uid() = user_id);
create policy "Users can delete own social accounts"
  on public.social_accounts for delete using (auth.uid() = user_id);

create index if not exists idx_social_accounts_user_id on public.social_accounts(user_id);
create index if not exists idx_social_accounts_platform on public.social_accounts(platform);

-- Campaigns
create table if not exists public.social_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Campaign',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  platforms jsonb not null default '[]'::jsonb,
  start_date date,
  end_date date,
  goals jsonb not null default '[]'::jsonb,
  brand_identity_id uuid,
  is_favorite boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_campaigns enable row level security;

create policy "Users can view own social campaigns"
  on public.social_campaigns for select using (auth.uid() = user_id);
create policy "Users can insert own social campaigns"
  on public.social_campaigns for insert with check (auth.uid() = user_id);
create policy "Users can update own social campaigns"
  on public.social_campaigns for update using (auth.uid() = user_id);
create policy "Users can delete own social campaigns"
  on public.social_campaigns for delete using (auth.uid() = user_id);

create index if not exists idx_social_campaigns_user_id on public.social_campaigns(user_id);
create index if not exists idx_social_campaigns_status on public.social_campaigns(status);
create index if not exists idx_social_campaigns_is_favorite on public.social_campaigns(is_favorite);

-- Posts
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.social_campaigns(id) on delete set null,
  platform text not null check (
    platform in ('facebook', 'instagram', 'linkedin', 'x', 'tiktok')
  ),
  status text not null default 'draft' check (
    status in ('draft', 'scheduled', 'published', 'failed', 'archived')
  ),
  title text not null default '',
  post_text text not null default '',
  caption text not null default '',
  hashtags text[] not null default '{}',
  cta text not null default '',
  content_angle text not null default '',
  tone text not null default 'Professional',
  language text not null default 'English',
  recommended_post_time text not null default '',
  media_url text,
  media_width integer,
  media_height integer,
  template_id text,
  brand_identity_id uuid,
  image_generation_id uuid,
  workspace_generation_id uuid,
  is_favorite boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_posts enable row level security;

create policy "Users can view own social posts"
  on public.social_posts for select using (auth.uid() = user_id);
create policy "Users can insert own social posts"
  on public.social_posts for insert with check (auth.uid() = user_id);
create policy "Users can update own social posts"
  on public.social_posts for update using (auth.uid() = user_id);
create policy "Users can delete own social posts"
  on public.social_posts for delete using (auth.uid() = user_id);

create index if not exists idx_social_posts_user_id on public.social_posts(user_id);
create index if not exists idx_social_posts_campaign_id on public.social_posts(campaign_id);
create index if not exists idx_social_posts_platform on public.social_posts(platform);
create index if not exists idx_social_posts_status on public.social_posts(status);
create index if not exists idx_social_posts_is_favorite on public.social_posts(is_favorite);
create index if not exists idx_social_posts_updated_at on public.social_posts(updated_at desc);

-- Schedules
create table if not exists public.social_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.social_posts(id) on delete cascade,
  account_id uuid references public.social_accounts(id) on delete set null,
  scheduled_at timestamptz not null,
  timezone text not null default 'UTC',
  status text not null default 'pending' check (
    status in ('pending', 'queued', 'published', 'failed', 'cancelled')
  ),
  publish_attempts integer not null default 0,
  last_error text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_schedules enable row level security;

create policy "Users can view own social schedules"
  on public.social_schedules for select using (auth.uid() = user_id);
create policy "Users can insert own social schedules"
  on public.social_schedules for insert with check (auth.uid() = user_id);
create policy "Users can update own social schedules"
  on public.social_schedules for update using (auth.uid() = user_id);
create policy "Users can delete own social schedules"
  on public.social_schedules for delete using (auth.uid() = user_id);

create index if not exists idx_social_schedules_user_id on public.social_schedules(user_id);
create index if not exists idx_social_schedules_post_id on public.social_schedules(post_id);
create index if not exists idx_social_schedules_scheduled_at on public.social_schedules(scheduled_at);
create index if not exists idx_social_schedules_status on public.social_schedules(status);

-- Analytics
create table if not exists public.social_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.social_posts(id) on delete cascade,
  campaign_id uuid references public.social_campaigns(id) on delete set null,
  platform text not null,
  recorded_at timestamptz not null default now(),
  impressions integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  engagement_rate numeric(8, 4) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.social_analytics enable row level security;

create policy "Users can view own social analytics"
  on public.social_analytics for select using (auth.uid() = user_id);
create policy "Users can insert own social analytics"
  on public.social_analytics for insert with check (auth.uid() = user_id);
create policy "Users can update own social analytics"
  on public.social_analytics for update using (auth.uid() = user_id);
create policy "Users can delete own social analytics"
  on public.social_analytics for delete using (auth.uid() = user_id);

create index if not exists idx_social_analytics_user_id on public.social_analytics(user_id);
create index if not exists idx_social_analytics_post_id on public.social_analytics(post_id);
create index if not exists idx_social_analytics_campaign_id on public.social_analytics(campaign_id);
create index if not exists idx_social_analytics_recorded_at on public.social_analytics(recorded_at desc);
