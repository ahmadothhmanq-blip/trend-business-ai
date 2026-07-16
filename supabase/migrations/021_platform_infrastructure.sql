-- ============================================================
-- PLATFORM INFRASTRUCTURE
-- Organizations, Teams, Roles, API Keys, Notifications,
-- Activity Log, Usage Tracking, Webhooks, Feature Flags
-- ============================================================

-- Required for gen_random_bytes() defaults (team_invitations, webhooks)
create extension if not exists pgcrypto with schema extensions;

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  plan text not null default 'free' check (plan in ('free','starter','pro','enterprise')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
drop policy if exists "Org members can view their org" on public.organizations;
drop policy if exists "Org members and owners can view" on public.organizations;
drop policy if exists "Users can create organizations" on public.organizations;
drop policy if exists "Org owners can update" on public.organizations;
-- Owner update policy only (no org_members reference yet — that table is created next)
create policy "Org owners can update" on public.organizations
  for update using (owner_id = auth.uid());

-- Organization members
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

alter table public.org_members enable row level security;
drop policy if exists "Members can view org members" on public.org_members;
drop policy if exists "Admins can manage members" on public.org_members;
drop policy if exists "Admins can update members" on public.org_members;
drop policy if exists "Admins can delete members" on public.org_members;
drop policy if exists "Admins can insert members" on public.org_members;
drop policy if exists "Owners can join as first member" on public.org_members;
create policy "Members can view org members" on public.org_members
  for select using (organization_id in (select organization_id from public.org_members om where om.user_id = auth.uid()));
create policy "Admins can manage members" on public.org_members
  for all using (organization_id in (select organization_id from public.org_members om where om.user_id = auth.uid() and om.role in ('owner','admin')));

create index if not exists idx_org_members_user on public.org_members(user_id);
create index if not exists idx_org_members_org on public.org_members(organization_id);

-- Organizations SELECT policy requires org_members (created above)
create policy "Org members can view their org" on public.organizations
  for select using (id in (select organization_id from public.org_members where user_id = auth.uid()));

-- Team invitations
create table if not exists public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','expired')),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

alter table public.team_invitations enable row level security;
drop policy if exists "Org admins can manage invitations" on public.team_invitations;
create policy "Org admins can manage invitations" on public.team_invitations
  for all using (organization_id in (select organization_id from public.org_members where user_id = auth.uid() and role in ('owner','admin')));

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'info' check (type in ('info','success','warning','error','invite','system')),
  title text not null,
  message text not null default '',
  link text,
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
drop policy if exists "Users see own notifications" on public.notifications;
drop policy if exists "Users update own notifications" on public.notifications;
drop policy if exists "System can insert notifications" on public.notifications;
drop policy if exists "Service role inserts notifications" on public.notifications;
create policy "Users see own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications
  for insert with check (true);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_created on public.notifications(created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

-- Activity / Audit log
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete cascade,
  action text not null,
  resource_type text not null default '',
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;
drop policy if exists "Users see own activity" on public.activity_log;
create policy "Users see own activity" on public.activity_log
  for select using (auth.uid() = user_id or organization_id in (select organization_id from public.org_members where user_id = auth.uid() and role in ('owner','admin')));

create index if not exists idx_activity_log_user on public.activity_log(user_id);
create index if not exists idx_activity_log_org on public.activity_log(organization_id);
create index if not exists idx_activity_log_created on public.activity_log(created_at desc);

-- API Keys
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  scopes jsonb not null default '["read"]'::jsonb,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;
drop policy if exists "Users manage own keys" on public.api_keys;
create policy "Users manage own keys" on public.api_keys
  for all using (auth.uid() = user_id);

create index if not exists idx_api_keys_user on public.api_keys(user_id);
create index if not exists idx_api_keys_prefix on public.api_keys(key_prefix);

-- Webhooks
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  url text not null,
  events jsonb not null default '["generation.completed"]'::jsonb,
  secret text not null default encode(gen_random_bytes(32), 'hex'),
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  failure_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.webhooks enable row level security;
drop policy if exists "Users manage own webhooks" on public.webhooks;
create policy "Users manage own webhooks" on public.webhooks
  for all using (auth.uid() = user_id);

-- Usage tracking
create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  resource text not null,
  tokens_used integer not null default 0,
  generations_count integer not null default 1,
  provider text,
  period_start date not null default current_date,
  period_end date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.usage_records enable row level security;
drop policy if exists "Users see own usage" on public.usage_records;
drop policy if exists "System inserts usage" on public.usage_records;
create policy "Users see own usage" on public.usage_records
  for select using (auth.uid() = user_id);
create policy "System inserts usage" on public.usage_records
  for insert with check (true);

create index if not exists idx_usage_records_user on public.usage_records(user_id);
create index if not exists idx_usage_records_period on public.usage_records(period_start, period_end);

-- Feature flags
create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null default '',
  is_enabled boolean not null default false,
  target_plans jsonb not null default '["enterprise"]'::jsonb,
  target_users jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;
drop policy if exists "Anyone can read flags" on public.feature_flags;
create policy "Anyone can read flags" on public.feature_flags
  for select using (true);

-- Subscription plans (reference table)
create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  description text not null default '',
  price_monthly numeric(10,2) not null default 0,
  price_yearly numeric(10,2) not null default 0,
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.subscription_plans enable row level security;
drop policy if exists "Anyone can read plans" on public.subscription_plans;
create policy "Anyone can read plans" on public.subscription_plans
  for select using (true);

-- Seed default plans
insert into public.subscription_plans (id, name, description, price_monthly, price_yearly, features, limits, sort_order) values
  ('free', 'Free', 'Get started with AI-powered business tools', 0, 0, '["5 generations/day","1 workspace","Basic AI models","Community support"]'::jsonb, '{"generations_per_day":5,"workspaces":1,"team_members":1}'::jsonb, 0),
  ('starter', 'Starter', 'For growing businesses and creators', 29, 290, '["50 generations/day","3 workspaces","All AI models","Email support","Export to PDF","Content Calendar"]'::jsonb, '{"generations_per_day":50,"workspaces":3,"team_members":3}'::jsonb, 1),
  ('pro', 'Pro', 'For teams and professional use', 79, 790, '["Unlimited generations","10 workspaces","Priority AI models","Priority support","API access","Team collaboration","Custom branding","Advanced analytics"]'::jsonb, '{"generations_per_day":999,"workspaces":10,"team_members":10}'::jsonb, 2),
  ('enterprise', 'Enterprise', 'For organizations at scale', 199, 1990, '["Unlimited everything","Unlimited workspaces","Dedicated AI resources","24/7 support","Custom integrations","SSO/SAML","Audit logs","SLA guarantee"]'::jsonb, '{"generations_per_day":9999,"workspaces":999,"team_members":999}'::jsonb, 3)
on conflict (id) do nothing;
