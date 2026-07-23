-- AI Agents Platform upgrade (enterprise orchestration)

-- Fix template RLS on legacy agents table
drop policy if exists "Users manage own agents" on public.agents;
create policy "Users can view own agents and templates" on public.agents
  for select using (auth.uid() = user_id or is_template = true);
create policy "Users insert own agents" on public.agents
  for insert with check (auth.uid() = user_id);
create policy "Users update own agents" on public.agents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own agents" on public.agents
  for delete using (auth.uid() = user_id);

-- Tool registry
create table if not exists public.agent_tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  tool_key text not null,
  label text not null default 'Tool',
  description text not null default '',
  category text not null default 'general',
  kind text not null default 'read' check (kind in ('read','write','action')),
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  requires_permission boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tool_key)
);

alter table public.agent_tools enable row level security;
create policy "Users manage own agent tools" on public.agent_tools for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_tools_user_id on public.agent_tools(user_id);

-- Agent versions
create table if not exists public.agent_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid not null references public.agents(id) on delete cascade,
  version integer not null default 1,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.agent_versions enable row level security;
create policy "Users manage own agent versions" on public.agent_versions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_versions_agent on public.agent_versions(agent_id);

-- Knowledge bases
create table if not exists public.agent_knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid references public.agents(id) on delete set null,
  name text not null default 'Knowledge Base',
  description text not null default '',
  document_count integer not null default 0,
  indexing_status text not null default 'pending' check (indexing_status in ('pending','ready','failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_knowledge_bases enable row level security;
create policy "Users manage own agent knowledge bases" on public.agent_knowledge_bases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_knowledge_bases_user on public.agent_knowledge_bases(user_id);

create table if not exists public.agent_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  knowledge_base_id uuid not null references public.agent_knowledge_bases(id) on delete cascade,
  title text not null default 'Document',
  content text not null default '',
  source_type text not null default 'text',
  embedding_ready boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_knowledge_documents enable row level security;
create policy "Users manage own agent knowledge documents" on public.agent_knowledge_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_knowledge_docs_kb on public.agent_knowledge_documents(knowledge_base_id);

-- Memory entries (platform)
create table if not exists public.agent_memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid not null references public.agents(id) on delete cascade,
  memory_type text not null default 'context' check (memory_type in ('conversation','fact','context','preference','summary')),
  key text not null default '',
  content text not null default '',
  relevance_score numeric(5,4) not null default 1.0,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_memory_entries enable row level security;
create policy "Users manage own agent memory entries" on public.agent_memory_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_memory_entries_agent on public.agent_memory_entries(agent_id);

-- Runs & steps
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid references public.agents(id) on delete set null,
  workflow_id uuid references public.agent_workflows(id) on delete set null,
  execution_id uuid references public.agent_executions(id) on delete set null,
  task_name text not null default '',
  status text not null default 'pending' check (status in ('pending','running','completed','failed','cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  provider text,
  model text,
  token_usage jsonb not null default '{"prompt":0,"completion":0,"total":0}'::jsonb,
  execution_time_ms integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.agent_runs enable row level security;
create policy "Users manage own agent runs" on public.agent_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_runs_user on public.agent_runs(user_id);
create index if not exists idx_agent_runs_agent on public.agent_runs(agent_id);

create table if not exists public.agent_run_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.agent_runs(id) on delete cascade,
  step_index integer not null default 0,
  step_name text not null default '',
  step_type text not null default 'agent',
  status text not null default 'pending' check (status in ('pending','running','completed','failed','skipped')),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  tool_key text,
  duration_ms integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.agent_run_steps enable row level security;
create policy "Users manage own agent run steps" on public.agent_run_steps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_run_steps_run on public.agent_run_steps(run_id);

-- Workflow runs
create table if not exists public.agent_workflow_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  workflow_id uuid not null references public.agent_workflows(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','running','completed','failed','cancelled')),
  steps_log jsonb not null default '[]'::jsonb,
  error_message text,
  execution_time_ms integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.agent_workflow_runs enable row level security;
create policy "Users manage own agent workflow runs" on public.agent_workflow_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_workflow_runs_wf on public.agent_workflow_runs(workflow_id);

-- Schedules
create table if not exists public.agent_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid references public.agents(id) on delete set null,
  workflow_id uuid references public.agent_workflows(id) on delete set null,
  name text not null default 'Schedule',
  cron_expression text not null default '0 9 * * 1',
  input jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  total_runs integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_schedules enable row level security;
create policy "Users manage own agent schedules" on public.agent_schedules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_schedules_user on public.agent_schedules(user_id);
create index if not exists idx_agent_schedules_next on public.agent_schedules(next_run_at) where is_active = true;

-- Triggers
create table if not exists public.agent_triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid references public.agents(id) on delete set null,
  workflow_id uuid references public.agent_workflows(id) on delete set null,
  trigger_type text not null default 'manual' check (trigger_type in ('manual','schedule','webhook','event','api')),
  name text not null default 'Trigger',
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_fired_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_triggers enable row level security;
create policy "Users manage own agent triggers" on public.agent_triggers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_triggers_user on public.agent_triggers(user_id);

-- Permissions
create table if not exists public.agent_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid not null references public.agents(id) on delete cascade,
  principal_type text not null default 'user' check (principal_type in ('user','role','team')),
  principal_id text not null default '',
  permission text not null default 'view' check (permission in ('view','run','edit','admin')),
  created_at timestamptz not null default now(),
  unique (agent_id, principal_type, principal_id, permission)
);

alter table public.agent_permissions enable row level security;
create policy "Users manage own agent permissions" on public.agent_permissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_permissions_agent on public.agent_permissions(agent_id);

-- Analytics
create table if not exists public.agent_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  agent_id uuid references public.agents(id) on delete set null,
  period text not null default 'daily',
  total_runs integer not null default 0,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  avg_latency_ms integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_cents integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

alter table public.agent_analytics enable row level security;
create policy "Users manage own agent analytics" on public.agent_analytics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_analytics_user on public.agent_analytics(user_id);

-- Audit log
create table if not exists public.agent_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.agent_audit_log enable row level security;
create policy "Users manage own agent audit log" on public.agent_audit_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_agent_audit_log_user on public.agent_audit_log(user_id);
