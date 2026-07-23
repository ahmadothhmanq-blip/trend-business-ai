-- Business Manager Operations Platform

create table if not exists public.business_organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Organization',
  description text not null default '',
  industry text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_organizations enable row level security;
create policy "Users manage own organizations" on public.business_organizations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_organizations_user_id on public.business_organizations(user_id);

create table if not exists public.business_departments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.business_organizations(id) on delete cascade,
  name text not null default 'Department',
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_departments enable row level security;
create policy "Users manage own departments" on public.business_departments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_departments_org on public.business_departments(organization_id);
create index if not exists idx_business_departments_user_id on public.business_departments(user_id);

create table if not exists public.business_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.business_organizations(id) on delete cascade,
  department_id uuid references public.business_departments(id) on delete set null,
  name text not null default 'Team',
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_teams enable row level security;
create policy "Users manage own teams" on public.business_teams for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_teams_org on public.business_teams(organization_id);
create index if not exists idx_business_teams_user_id on public.business_teams(user_id);

create table if not exists public.business_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.business_organizations(id) on delete cascade,
  team_id uuid references public.business_teams(id) on delete set null,
  member_name text not null default '',
  member_email text not null default '',
  role_type text not null default 'member' check (role_type in ('owner', 'admin', 'manager', 'member')),
  permissions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_roles enable row level security;
create policy "Users manage own roles" on public.business_roles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_roles_org on public.business_roles(organization_id);
create index if not exists idx_business_roles_user_id on public.business_roles(user_id);

create table if not exists public.business_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.business_organizations(id) on delete set null,
  team_id uuid references public.business_teams(id) on delete set null,
  name text not null default 'Untitled Project',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'on_hold', 'completed', 'archived')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  start_date date,
  end_date date,
  owner_name text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_projects enable row level security;
create policy "Users manage own projects" on public.business_projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_projects_user_id on public.business_projects(user_id);
create index if not exists idx_business_projects_org on public.business_projects(organization_id);
create index if not exists idx_business_projects_status on public.business_projects(status);

create table if not exists public.business_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.business_projects(id) on delete set null,
  organization_id uuid references public.business_organizations(id) on delete set null,
  title text not null default 'Task',
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_name text not null default '',
  assignee_email text not null default '',
  due_date timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_tasks enable row level security;
create policy "Users manage own tasks" on public.business_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_tasks_user_id on public.business_tasks(user_id);
create index if not exists idx_business_tasks_project_id on public.business_tasks(project_id);
create index if not exists idx_business_tasks_status on public.business_tasks(status);
create index if not exists idx_business_tasks_due_date on public.business_tasks(due_date);

create table if not exists public.business_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.business_projects(id) on delete cascade,
  title text not null default 'Milestone',
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'missed')),
  target_date date,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_milestones enable row level security;
create policy "Users manage own milestones" on public.business_milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_milestones_project_id on public.business_milestones(project_id);

create table if not exists public.business_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.business_organizations(id) on delete set null,
  project_id uuid references public.business_projects(id) on delete set null,
  name text not null default 'Workflow',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  steps jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_workflows enable row level security;
create policy "Users manage own workflows" on public.business_workflows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_workflows_user_id on public.business_workflows(user_id);

create table if not exists public.business_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow_id uuid references public.business_workflows(id) on delete set null,
  project_id uuid references public.business_projects(id) on delete set null,
  title text not null default 'Approval Request',
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  requester_name text not null default '',
  reviewer_name text not null default '',
  reviewer_email text not null default '',
  reviewed_at timestamptz,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_approvals enable row level security;
create policy "Users manage own approvals" on public.business_approvals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_approvals_user_id on public.business_approvals(user_id);
create index if not exists idx_business_approvals_status on public.business_approvals(status);

create table if not exists public.business_kpis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.business_organizations(id) on delete set null,
  project_id uuid references public.business_projects(id) on delete set null,
  name text not null default 'KPI',
  category text not null default 'general',
  target_value numeric(12, 2) not null default 0,
  current_value numeric(12, 2) not null default 0,
  unit text not null default '%',
  recorded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_kpis enable row level security;
create policy "Users manage own kpis" on public.business_kpis for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_business_kpis_user_id on public.business_kpis(user_id);
create index if not exists idx_business_kpis_org on public.business_kpis(organization_id);
