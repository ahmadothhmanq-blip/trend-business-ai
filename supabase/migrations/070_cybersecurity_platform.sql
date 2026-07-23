-- Cybersecurity Platform

-- Organizations (security context)
create table if not exists public.cyber_organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Security Org',
  slug text not null default '',
  industry text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_organizations enable row level security;
create policy "Users manage own cyber orgs" on public.cyber_organizations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_organizations_user on public.cyber_organizations(user_id);

-- Security roles
create table if not exists public.cyber_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete cascade,
  name text not null default 'analyst',
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_roles enable row level security;
create policy "Users manage own cyber roles" on public.cyber_roles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Security users mapping
create table if not exists public.cyber_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete cascade,
  role_id uuid references public.cyber_roles(id) on delete set null,
  display_name text not null default '',
  email text not null default '',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_users enable row level security;
create policy "Users manage own cyber users" on public.cyber_users for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_users_org on public.cyber_users(organization_id);

-- Assets
create table if not exists public.cyber_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  name text not null default 'Asset',
  asset_type text not null default 'server' check (asset_type in ('device','server','application','cloud','network','other')),
  hostname text not null default '',
  ip_address text not null default '',
  owner text not null default '',
  environment text not null default 'production',
  status text not null default 'active' check (status in ('active','inactive','decommissioned','at_risk')),
  risk_score numeric(5,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_assets enable row level security;
create policy "Users manage own cyber assets" on public.cyber_assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_assets_user on public.cyber_assets(user_id);
create index if not exists idx_cyber_assets_org on public.cyber_assets(organization_id);

-- Threats
create table if not exists public.cyber_threats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  title text not null default 'Threat',
  description text not null default '',
  severity text not null default 'medium' check (severity in ('critical','high','medium','low','info')),
  threat_type text not null default 'unknown',
  source text not null default 'internal',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_threats enable row level security;
create policy "Users manage own cyber threats" on public.cyber_threats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_threats_user on public.cyber_threats(user_id);

-- IOCs
create table if not exists public.cyber_iocs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  threat_id uuid references public.cyber_threats(id) on delete set null,
  ioc_type text not null default 'ip' check (ioc_type in ('ip','domain','hash','url','email','signature')),
  value text not null default '',
  confidence numeric(5,4) not null default 0.5,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_iocs enable row level security;
create policy "Users manage own cyber iocs" on public.cyber_iocs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_iocs_value on public.cyber_iocs(value);

-- Feeds
create table if not exists public.cyber_feeds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  name text not null default 'Feed',
  feed_type text not null default 'custom',
  url text not null default '',
  is_active boolean not null default true,
  last_synced_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_feeds enable row level security;
create policy "Users manage own cyber feeds" on public.cyber_feeds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Threat reports
create table if not exists public.cyber_threat_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  title text not null default 'Threat Report',
  summary text not null default '',
  recommendations jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.cyber_threat_reports enable row level security;
create policy "Users manage own cyber threat reports" on public.cyber_threat_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Events
create table if not exists public.cyber_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  asset_id uuid references public.cyber_assets(id) on delete set null,
  event_type text not null default 'generic',
  source text not null default 'system',
  severity text not null default 'info' check (severity in ('critical','high','medium','low','info')),
  message text not null default '',
  payload jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.cyber_events enable row level security;
create policy "Users manage own cyber events" on public.cyber_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_events_user on public.cyber_events(user_id);
create index if not exists idx_cyber_events_recorded on public.cyber_events(recorded_at desc);

-- Alerts
create table if not exists public.cyber_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  event_id uuid references public.cyber_events(id) on delete set null,
  title text not null default 'Alert',
  severity text not null default 'medium' check (severity in ('critical','high','medium','low','info')),
  status text not null default 'open' check (status in ('open','investigating','resolved','false_positive')),
  assigned_to text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_alerts enable row level security;
create policy "Users manage own cyber alerts" on public.cyber_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_alerts_status on public.cyber_alerts(status);

-- Detection rules
create table if not exists public.cyber_detection_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  name text not null default 'Rule',
  description text not null default '',
  conditions jsonb not null default '{}'::jsonb,
  actions jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_detection_rules enable row level security;
create policy "Users manage own cyber detection rules" on public.cyber_detection_rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vulnerabilities
create table if not exists public.cyber_vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  asset_id uuid references public.cyber_assets(id) on delete set null,
  cve_id text not null default '',
  title text not null default 'Vulnerability',
  severity text not null default 'medium' check (severity in ('critical','high','medium','low','info')),
  cvss_score numeric(4,2) not null default 0,
  status text not null default 'open',
  remediation text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_vulnerabilities enable row level security;
create policy "Users manage own cyber vulnerabilities" on public.cyber_vulnerabilities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_vulnerabilities_severity on public.cyber_vulnerabilities(severity);

-- Scans
create table if not exists public.cyber_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  name text not null default 'Scan',
  scan_type text not null default 'vulnerability',
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  target text not null default '',
  findings_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_scans enable row level security;
create policy "Users manage own cyber scans" on public.cyber_scans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Findings
create table if not exists public.cyber_findings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  scan_id uuid references public.cyber_scans(id) on delete set null,
  vulnerability_id uuid references public.cyber_vulnerabilities(id) on delete set null,
  title text not null default 'Finding',
  severity text not null default 'medium' check (severity in ('critical','high','medium','low','info')),
  description text not null default '',
  remediation text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_findings enable row level security;
create policy "Users manage own cyber findings" on public.cyber_findings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Incidents
create table if not exists public.cyber_incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  title text not null default 'Incident',
  description text not null default '',
  severity text not null default 'high' check (severity in ('critical','high','medium','low','info')),
  status text not null default 'open' check (status in ('open','investigating','contained','resolved','closed')),
  assigned_to text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_incidents enable row level security;
create policy "Users manage own cyber incidents" on public.cyber_incidents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_incidents_status on public.cyber_incidents(status);

-- Cases
create table if not exists public.cyber_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  incident_id uuid references public.cyber_incidents(id) on delete set null,
  title text not null default 'Case',
  status text not null default 'open' check (status in ('open','in_progress','escalated','closed')),
  priority text not null default 'medium',
  assignee text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_cases enable row level security;
create policy "Users manage own cyber cases" on public.cyber_cases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Playbooks
create table if not exists public.cyber_playbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  name text not null default 'Playbook',
  description text not null default '',
  steps jsonb not null default '[]'::jsonb,
  trigger_type text not null default 'manual',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cyber_playbooks enable row level security;
create policy "Users manage own cyber playbooks" on public.cyber_playbooks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Case events
create table if not exists public.cyber_case_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.cyber_cases(id) on delete cascade,
  event_type text not null default 'note',
  content text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_case_events enable row level security;
create policy "Users manage own cyber case events" on public.cyber_case_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_case_events_case on public.cyber_case_events(case_id);

-- OSINT results
create table if not exists public.cyber_osint_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  query text not null default '',
  result_type text not null default 'domain',
  findings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_osint_results enable row level security;
create policy "Users manage own cyber osint" on public.cyber_osint_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Risk scores
create table if not exists public.cyber_risk_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  score numeric(5,2) not null default 0,
  factors jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.cyber_risk_scores enable row level security;
create policy "Users manage own cyber risk scores" on public.cyber_risk_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Metrics
create table if not exists public.cyber_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.cyber_organizations(id) on delete set null,
  metric_key text not null default '',
  metric_value numeric(12,2) not null default 0,
  period text not null default 'daily',
  recorded_at timestamptz not null default now()
);
alter table public.cyber_metrics enable row level security;
create policy "Users manage own cyber metrics" on public.cyber_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Audit log
create table if not exists public.cyber_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.cyber_audit_log enable row level security;
create policy "Users manage own cyber audit log" on public.cyber_audit_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_cyber_audit_log_user on public.cyber_audit_log(user_id);
