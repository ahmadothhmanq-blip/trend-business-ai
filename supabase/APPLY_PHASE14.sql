-- APPLY_PHASE14.sql
-- Run once in Supabase SQL Editor (or: npm run db:apply -- --only 021,022,023,024)
-- Order: 021 → 022 → 023 → 024. Idempotent where possible.



-- ========== 021_platform_infrastructure.sql ==========

-- ============================================================
-- PLATFORM INFRASTRUCTURE
-- Organizations, Teams, Roles, API Keys, Notifications,
-- Activity Log, Usage Tracking, Webhooks, Feature Flags
-- ============================================================

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
create policy "Org members can view their org" on public.organizations
  for select using (id in (select organization_id from public.org_members where user_id = auth.uid()));
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


-- ========== 022_ai_agents_platform.sql ==========

-- ============================================================
-- AI AGENTS & AUTOMATION PLATFORM
-- Agents, Workflows, Tasks, Executions, Memory, Tools, Prompts
-- ============================================================

-- Agent definitions
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  agent_type text not null default 'custom',
  category text not null default 'general',
  icon text not null default 'bot',
  system_prompt text not null default '',
  tools jsonb not null default '[]'::jsonb,
  capabilities jsonb not null default '[]'::jsonb,
  config jsonb not null default '{}'::jsonb,
  provider text,
  model text,
  temperature numeric(3,2) not null default 0.7,
  max_tokens integer not null default 4096,
  is_template boolean not null default false,
  is_public boolean not null default false,
  is_active boolean not null default true,
  version integer not null default 1,
  parent_agent_id uuid references public.agents(id) on delete set null,
  tags jsonb not null default '[]'::jsonb,
  total_runs integer not null default 0,
  total_tokens_used integer not null default 0,
  avg_run_time_ms integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agents enable row level security;
drop policy if exists "Users manage own agents" on public.agents;
create policy "Users manage own agents" on public.agents
  for all using (auth.uid() = user_id or is_template = true);

create index if not exists idx_agents_user on public.agents(user_id);
create index if not exists idx_agents_type on public.agents(agent_type);
create index if not exists idx_agents_template on public.agents(is_template) where is_template = true;

-- Workflows (multi-step agent orchestration)
create table if not exists public.agent_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  trigger_type text not null default 'manual',
  trigger_config jsonb not null default '{}'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  variables jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_run_at timestamptz,
  total_runs integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_workflows enable row level security;
drop policy if exists "Users manage own workflows" on public.agent_workflows;
create policy "Users manage own workflows" on public.agent_workflows
  for all using (auth.uid() = user_id);

create index if not exists idx_workflows_user on public.agent_workflows(user_id);

-- Task executions
create table if not exists public.agent_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  workflow_id uuid references public.agent_workflows(id) on delete set null,
  task_name text not null default '',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  steps_log jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending','running','completed','failed','cancelled')),
  error_message text,
  provider text,
  model text,
  token_usage jsonb not null default '{"prompt":0,"completion":0,"total":0}'::jsonb,
  execution_time_ms integer not null default 0,
  parent_execution_id uuid references public.agent_executions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.agent_executions enable row level security;
drop policy if exists "Users see own executions" on public.agent_executions;
create policy "Users see own executions" on public.agent_executions
  for all using (auth.uid() = user_id);

create index if not exists idx_executions_user on public.agent_executions(user_id);
create index if not exists idx_executions_agent on public.agent_executions(agent_id);
create index if not exists idx_executions_workflow on public.agent_executions(workflow_id);
create index if not exists idx_executions_status on public.agent_executions(status);
create index if not exists idx_executions_created on public.agent_executions(created_at desc);

-- Agent memory (conversation & context persistence)
create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_type text not null default 'conversation' check (memory_type in ('conversation','fact','context','preference','summary')),
  key text not null default '',
  content text not null,
  embedding_vector text,
  relevance_score numeric(5,4) not null default 1.0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.agent_memory enable row level security;
drop policy if exists "Users manage own memory" on public.agent_memory;
create policy "Users manage own memory" on public.agent_memory
  for all using (auth.uid() = user_id);

create index if not exists idx_memory_agent on public.agent_memory(agent_id);
create index if not exists idx_memory_type on public.agent_memory(memory_type);

-- Prompt library
create table if not exists public.prompt_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  prompt_text text not null,
  variables jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  usage_count integer not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prompt_library enable row level security;
drop policy if exists "Users manage own prompts" on public.prompt_library;
create policy "Users manage own prompts" on public.prompt_library
  for all using (auth.uid() = user_id or is_public = true);

create index if not exists idx_prompts_user on public.prompt_library(user_id);
create index if not exists idx_prompts_category on public.prompt_library(category);

-- Scheduled jobs
create table if not exists public.scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  workflow_id uuid references public.agent_workflows(id) on delete cascade,
  name text not null,
  cron_expression text not null default '0 9 * * 1',
  input jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  total_runs integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.scheduled_jobs enable row level security;
drop policy if exists "Users manage own jobs" on public.scheduled_jobs;
create policy "Users manage own jobs" on public.scheduled_jobs
  for all using (auth.uid() = user_id);

create index if not exists idx_jobs_user on public.scheduled_jobs(user_id);
create index if not exists idx_jobs_next_run on public.scheduled_jobs(next_run_at) where is_active = true;


-- ========== 023_security_hardening.sql ==========

-- Phase 12: Security hardening — RLS policy fixes & missing indexes
-- Idempotent. Requires migration 021 (platform tables) first.

-- 1. Fix notifications INSERT policy (was: WITH CHECK (true))
drop policy if exists "System can insert notifications" on public.notifications;
drop policy if exists "Service role inserts notifications" on public.notifications;
create policy "Service role inserts notifications" on public.notifications
  for insert with check (auth.uid() = user_id);

-- 2. Fix org_members admin policy — split into separate INSERT/UPDATE/DELETE
drop policy if exists "Admins can manage members" on public.org_members;
drop policy if exists "Admins can update members" on public.org_members;
drop policy if exists "Admins can delete members" on public.org_members;
drop policy if exists "Admins can insert members" on public.org_members;

create policy "Admins can update members" on public.org_members
  for update using (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner','admin')
    )
  );

create policy "Admins can delete members" on public.org_members
  for delete using (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner','admin')
    )
  );

create policy "Admins can insert members" on public.org_members
  for insert with check (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner','admin')
    )
    and user_id <> auth.uid()
  );

-- 3. Add missing indexes on webhooks (table from 021)
create index if not exists idx_webhooks_user on public.webhooks(user_id);
create index if not exists idx_webhooks_active on public.webhooks(is_active) where is_active = true;

-- 4. Add updated_at trigger function (reusable)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 5. Add updated_at triggers for tables that have the column
-- NOTE: EXECUTE runs a single statement — drop and create separately.
do $$
declare
  tbl text;
begin
  for tbl in
    select c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'updated_at'
      and c.table_name not in ('profiles')
      and exists (
        select 1 from information_schema.tables t
        where t.table_schema = 'public' and t.table_name = c.table_name
      )
  loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', tbl, tbl);
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      tbl, tbl
    );
  end loop;
end;
$$;

-- 6. Add missing indexes on api_keys
create index if not exists idx_api_keys_user on public.api_keys(user_id);
create index if not exists idx_api_keys_hash on public.api_keys(key_hash);

-- 7. Add missing index on feature_flags
create index if not exists idx_feature_flags_key on public.feature_flags(key);


-- ========== 024_organization_bootstrap.sql ==========

-- Phase 13: Organization bootstrap policies
-- Fixes chicken-and-egg: users could not create orgs or add themselves as owner.

-- 1. Allow authenticated users to create organizations they own
drop policy if exists "Users can create organizations" on public.organizations;
create policy "Users can create organizations" on public.organizations
  for insert with check (owner_id = auth.uid());

-- 2. Allow owners to view orgs even before membership row exists
drop policy if exists "Org members can view their org" on public.organizations;
drop policy if exists "Org members and owners can view" on public.organizations;
create policy "Org members and owners can view" on public.organizations
  for select using (
    owner_id = auth.uid()
    or id in (select organization_id from public.org_members where user_id = auth.uid())
  );

-- 3. Allow org owners to insert themselves as the first member (owner role)
drop policy if exists "Owners can join as first member" on public.org_members;
create policy "Owners can join as first member" on public.org_members
  for insert with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_id = auth.uid()
    )
  );

-- 4. Ensure admins can still invite other members (may already exist from 023)
drop policy if exists "Admins can insert members" on public.org_members;
create policy "Admins can insert members" on public.org_members
  for insert with check (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner', 'admin')
    )
    and user_id <> auth.uid()
  );
