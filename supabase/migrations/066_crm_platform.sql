-- CRM Platform (standalone AI CRM)

create table if not exists public.crm_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  name text not null default 'Account',
  industry text not null default '',
  size text not null default '',
  website text not null default '',
  notes text not null default '',
  custom_fields jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_accounts enable row level security;
create policy "Users manage own crm accounts" on public.crm_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_accounts_user_id on public.crm_accounts(user_id);
create index if not exists idx_crm_accounts_org on public.crm_accounts(organization_id);

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  account_id uuid references public.crm_accounts(id) on delete set null,
  email text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  title text not null default '',
  lifecycle_stage text not null default 'lead' check (lifecycle_stage in (
    'subscriber','lead','mql','sql','opportunity','customer','churned'
  )),
  tags text[] not null default '{}',
  custom_fields jsonb not null default '{}'::jsonb,
  owner_name text not null default '',
  owner_email text not null default '',
  lead_id uuid,
  growth_contact_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_contacts enable row level security;
create policy "Users manage own crm contacts" on public.crm_contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_contacts_user_id on public.crm_contacts(user_id);
create index if not exists idx_crm_contacts_account_id on public.crm_contacts(account_id);
create index if not exists idx_crm_contacts_email on public.crm_contacts(user_id, email);
create unique index if not exists idx_crm_contacts_user_email_unique on public.crm_contacts(user_id, email);

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  email text not null default '',
  name text not null default '',
  company text not null default '',
  phone text not null default '',
  source text not null default 'manual',
  status text not null default 'new' check (status in ('new','contacted','qualified','nurturing','converted','lost')),
  score integer not null default 0 check (score >= 0 and score <= 100),
  assignee_name text not null default '',
  assignee_email text not null default '',
  message text not null default '',
  growth_lead_id uuid,
  converted_contact_id uuid references public.crm_contacts(id) on delete set null,
  converted_deal_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_leads enable row level security;
create policy "Users manage own crm leads" on public.crm_leads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_leads_user_id on public.crm_leads(user_id);
create index if not exists idx_crm_leads_status on public.crm_leads(status);

create table if not exists public.crm_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  key text not null check (key in ('new','qualified','proposal','negotiation','won','lost')),
  label text not null,
  sort_order integer not null default 0,
  probability_default integer not null default 10 check (probability_default >= 0 and probability_default <= 100),
  is_closed boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

alter table public.crm_stages enable row level security;
create policy "Users manage own crm stages" on public.crm_stages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_stages_user_id on public.crm_stages(user_id);

create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  account_id uuid references public.crm_accounts(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  title text not null default 'Deal',
  stage text not null default 'new' check (stage in ('new','qualified','proposal','negotiation','won','lost')),
  value_cents integer not null default 0,
  currency text not null default 'USD',
  probability integer not null default 10 check (probability >= 0 and probability <= 100),
  expected_close_at date,
  owner_name text not null default '',
  owner_email text not null default '',
  notes text not null default '',
  growth_deal_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_deals enable row level security;
create policy "Users manage own crm deals" on public.crm_deals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_deals_user_id on public.crm_deals(user_id);
create index if not exists idx_crm_deals_stage on public.crm_deals(stage);
create index if not exists idx_crm_deals_contact_id on public.crm_deals(contact_id);

alter table public.crm_leads
  add constraint crm_leads_converted_deal_fk
  foreign key (converted_deal_id) references public.crm_deals(id) on delete set null;

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  deal_id uuid references public.crm_deals(id) on delete set null,
  account_id uuid references public.crm_accounts(id) on delete set null,
  title text not null default 'Task',
  description text not null default '',
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  priority text not null default 'medium',
  assignee_name text not null default '',
  assignee_email text not null default '',
  due_date timestamptz,
  reminder_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_tasks enable row level security;
create policy "Users manage own crm tasks" on public.crm_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_tasks_user_id on public.crm_tasks(user_id);
create index if not exists idx_crm_tasks_due_date on public.crm_tasks(due_date);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  deal_id uuid references public.crm_deals(id) on delete set null,
  account_id uuid references public.crm_accounts(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  activity_type text not null default 'note' check (activity_type in ('call','meeting','email','note','task','system')),
  subject text not null default '',
  body text not null default '',
  occurred_at timestamptz not null default now(),
  duration_minutes integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_activities enable row level security;
create policy "Users manage own crm activities" on public.crm_activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_activities_user_id on public.crm_activities(user_id);
create index if not exists idx_crm_activities_contact_id on public.crm_activities(contact_id);
create index if not exists idx_crm_activities_occurred_at on public.crm_activities(occurred_at desc);

create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  deal_id uuid references public.crm_deals(id) on delete set null,
  account_id uuid references public.crm_accounts(id) on delete set null,
  body text not null default '',
  author_name text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_notes enable row level security;
create policy "Users manage own crm notes" on public.crm_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_notes_user_id on public.crm_notes(user_id);

create table if not exists public.crm_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  entity_type text not null check (entity_type in ('lead','contact','deal','account','task')),
  entity_id uuid not null,
  assignee_name text not null default '',
  assignee_email text not null default '',
  role text not null default 'sales' check (role in ('owner','admin','sales','viewer')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_assignments enable row level security;
create policy "Users manage own crm assignments" on public.crm_assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_assignments_entity on public.crm_assignments(entity_type, entity_id);

create table if not exists public.crm_automation_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  name text not null default 'Rule',
  trigger_event text not null default 'lead_created',
  status text not null default 'active' check (status in ('active','paused','archived')),
  conditions jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_automation_rules enable row level security;
create policy "Users manage own crm automation" on public.crm_automation_rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_automation_user_id on public.crm_automation_rules(user_id);

create table if not exists public.crm_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  period_start date not null default current_date,
  period_end date not null default current_date,
  pipeline_value_cents bigint not null default 0,
  won_value_cents bigint not null default 0,
  conversion_rate numeric(6,2) not null default 0,
  win_rate numeric(6,2) not null default 0,
  avg_sales_cycle_days integer not null default 0,
  forecast_cents bigint not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_analytics enable row level security;
create policy "Users manage own crm analytics" on public.crm_analytics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_analytics_user_id on public.crm_analytics(user_id);

create table if not exists public.crm_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.crm_audit_log enable row level security;
create policy "Users see own crm audit" on public.crm_audit_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_crm_audit_user_id on public.crm_audit_log(user_id);
