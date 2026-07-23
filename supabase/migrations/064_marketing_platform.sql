-- Marketing Intelligence Platform tables (Phase 2)

-- Campaigns
create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Campaign',
  objective text not null default '',
  status text not null default 'draft' check (
    status in ('draft', 'planned', 'active', 'paused', 'completed', 'archived')
  ),
  budget numeric(12, 2),
  channels jsonb not null default '[]'::jsonb,
  start_date date,
  end_date date,
  strategy jsonb not null default '{}'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  kpis jsonb not null default '[]'::jsonb,
  is_favorite boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_campaigns enable row level security;
create policy "Users can view own marketing campaigns" on public.marketing_campaigns for select using (auth.uid() = user_id);
create policy "Users can insert own marketing campaigns" on public.marketing_campaigns for insert with check (auth.uid() = user_id);
create policy "Users can update own marketing campaigns" on public.marketing_campaigns for update using (auth.uid() = user_id);
create policy "Users can delete own marketing campaigns" on public.marketing_campaigns for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_campaigns_user_id on public.marketing_campaigns(user_id);
create index if not exists idx_marketing_campaigns_status on public.marketing_campaigns(status);
create index if not exists idx_marketing_campaigns_dates on public.marketing_campaigns(start_date, end_date);

-- Plans
create table if not exists public.marketing_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  name text not null default 'Marketing Plan',
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  summary text not null default '',
  goals jsonb not null default '[]'::jsonb,
  audience text not null default '',
  offer text not null default '',
  messaging text not null default '',
  channels jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  kpis jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_plans enable row level security;
create policy "Users can view own marketing plans" on public.marketing_plans for select using (auth.uid() = user_id);
create policy "Users can insert own marketing plans" on public.marketing_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own marketing plans" on public.marketing_plans for update using (auth.uid() = user_id);
create policy "Users can delete own marketing plans" on public.marketing_plans for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_plans_user_id on public.marketing_plans(user_id);
create index if not exists idx_marketing_plans_campaign_id on public.marketing_plans(campaign_id);

-- Personas
create table if not exists public.marketing_personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  name text not null default 'Persona',
  title text not null default '',
  summary text not null default '',
  demographics jsonb not null default '{}'::jsonb,
  pain_points jsonb not null default '[]'::jsonb,
  behaviors jsonb not null default '[]'::jsonb,
  motivations jsonb not null default '[]'::jsonb,
  buying_triggers jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_personas enable row level security;
create policy "Users can view own marketing personas" on public.marketing_personas for select using (auth.uid() = user_id);
create policy "Users can insert own marketing personas" on public.marketing_personas for insert with check (auth.uid() = user_id);
create policy "Users can update own marketing personas" on public.marketing_personas for update using (auth.uid() = user_id);
create policy "Users can delete own marketing personas" on public.marketing_personas for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_personas_user_id on public.marketing_personas(user_id);
create index if not exists idx_marketing_personas_campaign_id on public.marketing_personas(campaign_id);

-- Workflows (automation foundation)
create table if not exists public.marketing_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  name text not null default 'Workflow',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  trigger_type text not null default 'manual',
  steps jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_workflows enable row level security;
create policy "Users can view own marketing workflows" on public.marketing_workflows for select using (auth.uid() = user_id);
create policy "Users can insert own marketing workflows" on public.marketing_workflows for insert with check (auth.uid() = user_id);
create policy "Users can update own marketing workflows" on public.marketing_workflows for update using (auth.uid() = user_id);
create policy "Users can delete own marketing workflows" on public.marketing_workflows for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_workflows_user_id on public.marketing_workflows(user_id);
create index if not exists idx_marketing_workflows_campaign_id on public.marketing_workflows(campaign_id);

-- Analytics
create table if not exists public.marketing_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  channel text not null default '',
  recorded_at timestamptz not null default now(),
  impressions integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  leads integer not null default 0,
  revenue numeric(12, 2) not null default 0,
  spend numeric(12, 2) not null default 0,
  roi numeric(8, 2) not null default 0,
  engagement_rate numeric(8, 2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.marketing_analytics enable row level security;
create policy "Users can view own marketing analytics" on public.marketing_analytics for select using (auth.uid() = user_id);
create policy "Users can insert own marketing analytics" on public.marketing_analytics for insert with check (auth.uid() = user_id);
create policy "Users can update own marketing analytics" on public.marketing_analytics for update using (auth.uid() = user_id);
create policy "Users can delete own marketing analytics" on public.marketing_analytics for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_analytics_user_id on public.marketing_analytics(user_id);
create index if not exists idx_marketing_analytics_campaign_id on public.marketing_analytics(campaign_id);
create index if not exists idx_marketing_analytics_channel on public.marketing_analytics(channel);
create index if not exists idx_marketing_analytics_recorded_at on public.marketing_analytics(recorded_at desc);

-- Calendar events
create table if not exists public.marketing_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  title text not null default '',
  event_type text not null default 'task' check (
    event_type in ('campaign', 'content', 'launch', 'task', 'email', 'social', 'ads')
  ),
  scheduled_at timestamptz not null default now(),
  end_at timestamptz,
  status text not null default 'pending',
  source text not null default 'marketing',
  external_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_calendar_events enable row level security;
create policy "Users can view own marketing calendar" on public.marketing_calendar_events for select using (auth.uid() = user_id);
create policy "Users can insert own marketing calendar" on public.marketing_calendar_events for insert with check (auth.uid() = user_id);
create policy "Users can update own marketing calendar" on public.marketing_calendar_events for update using (auth.uid() = user_id);
create policy "Users can delete own marketing calendar" on public.marketing_calendar_events for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_calendar_user_id on public.marketing_calendar_events(user_id);
create index if not exists idx_marketing_calendar_scheduled_at on public.marketing_calendar_events(scheduled_at);

-- Email marketing foundation
create table if not exists public.marketing_email_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Template',
  subject text not null default '',
  body_html text not null default '',
  body_text text not null default '',
  category text not null default 'general',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_email_templates enable row level security;
create policy "Users can view own email templates" on public.marketing_email_templates for select using (auth.uid() = user_id);
create policy "Users can insert own email templates" on public.marketing_email_templates for insert with check (auth.uid() = user_id);
create policy "Users can update own email templates" on public.marketing_email_templates for update using (auth.uid() = user_id);
create policy "Users can delete own email templates" on public.marketing_email_templates for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_email_templates_user_id on public.marketing_email_templates(user_id);

create table if not exists public.marketing_audience_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Audience',
  description text not null default '',
  subscriber_count integer not null default 0,
  tags jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_audience_lists enable row level security;
create policy "Users can view own audience lists" on public.marketing_audience_lists for select using (auth.uid() = user_id);
create policy "Users can insert own audience lists" on public.marketing_audience_lists for insert with check (auth.uid() = user_id);
create policy "Users can update own audience lists" on public.marketing_audience_lists for update using (auth.uid() = user_id);
create policy "Users can delete own audience lists" on public.marketing_audience_lists for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_audience_lists_user_id on public.marketing_audience_lists(user_id);

create table if not exists public.marketing_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  name text not null default 'Email Campaign',
  subject text not null default '',
  status text not null default 'draft' check (
    status in ('draft', 'scheduled', 'sending', 'sent', 'failed')
  ),
  template_id uuid references public.marketing_email_templates(id) on delete set null,
  audience_list_id uuid references public.marketing_audience_lists(id) on delete set null,
  scheduled_at timestamptz,
  body_html text not null default '',
  body_text text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_email_campaigns enable row level security;
create policy "Users can view own email campaigns" on public.marketing_email_campaigns for select using (auth.uid() = user_id);
create policy "Users can insert own email campaigns" on public.marketing_email_campaigns for insert with check (auth.uid() = user_id);
create policy "Users can update own email campaigns" on public.marketing_email_campaigns for update using (auth.uid() = user_id);
create policy "Users can delete own email campaigns" on public.marketing_email_campaigns for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_email_campaigns_user_id on public.marketing_email_campaigns(user_id);

create table if not exists public.marketing_email_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_campaign_id uuid not null references public.marketing_email_campaigns(id) on delete cascade,
  recipient_email text not null default '',
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed', 'cancelled')),
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  error text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_email_queue enable row level security;
create policy "Users can view own email queue" on public.marketing_email_queue for select using (auth.uid() = user_id);
create policy "Users can insert own email queue" on public.marketing_email_queue for insert with check (auth.uid() = user_id);
create policy "Users can update own email queue" on public.marketing_email_queue for update using (auth.uid() = user_id);
create index if not exists idx_marketing_email_queue_status on public.marketing_email_queue(status);
create index if not exists idx_marketing_email_queue_scheduled_at on public.marketing_email_queue(scheduled_at);

-- Ads drafts foundation
create table if not exists public.marketing_ads_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  platform text not null check (platform in ('google_ads', 'meta_ads')),
  name text not null default 'Ad Draft',
  objective text not null default '',
  status text not null default 'draft' check (status in ('draft', 'ready', 'submitted')),
  budget numeric(12, 2),
  audience jsonb not null default '{}'::jsonb,
  creative jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketing_ads_drafts enable row level security;
create policy "Users can view own ads drafts" on public.marketing_ads_drafts for select using (auth.uid() = user_id);
create policy "Users can insert own ads drafts" on public.marketing_ads_drafts for insert with check (auth.uid() = user_id);
create policy "Users can update own ads drafts" on public.marketing_ads_drafts for update using (auth.uid() = user_id);
create policy "Users can delete own ads drafts" on public.marketing_ads_drafts for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_ads_drafts_user_id on public.marketing_ads_drafts(user_id);
create index if not exists idx_marketing_ads_drafts_platform on public.marketing_ads_drafts(platform);

-- Integration connections (OAuth foundation — tokens encrypted at app layer)
create table if not exists public.marketing_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (
    provider in ('google_ads', 'meta_ads', 'sendgrid', 'mailchimp', 'google_analytics')
  ),
  status text not null default 'disconnected' check (
    status in ('connected', 'disconnected', 'expired', 'error', 'revoked')
  ),
  account_name text not null default '',
  access_token_encrypted text not null default '',
  refresh_token_encrypted text not null default '',
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.marketing_integrations enable row level security;
create policy "Users can view own marketing integrations" on public.marketing_integrations for select using (auth.uid() = user_id);
create policy "Users can insert own marketing integrations" on public.marketing_integrations for insert with check (auth.uid() = user_id);
create policy "Users can update own marketing integrations" on public.marketing_integrations for update using (auth.uid() = user_id);
create policy "Users can delete own marketing integrations" on public.marketing_integrations for delete using (auth.uid() = user_id);
create index if not exists idx_marketing_integrations_user_id on public.marketing_integrations(user_id);
