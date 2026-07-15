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
