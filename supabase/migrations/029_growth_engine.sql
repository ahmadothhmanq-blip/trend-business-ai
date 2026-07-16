-- ============================================================
-- Phase 21 — Growth Engine
-- Affiliates, referrals, leads, CRM, email, analytics, A/B, automation
-- ============================================================

-- Affiliates
create table if not exists public.growth_affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  code text not null unique,
  status text not null default 'active' check (status in ('pending','active','paused','rejected')),
  commission_rate_bps integer not null default 2000 check (commission_rate_bps >= 0 and commission_rate_bps <= 10000),
  payout_email text,
  total_clicks integer not null default 0,
  total_referrals integer not null default 0,
  total_earned_cents integer not null default 0,
  total_paid_cents integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_affiliates enable row level security;
drop policy if exists "Users manage own affiliate" on public.growth_affiliates;
create policy "Users manage own affiliate" on public.growth_affiliates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_growth_affiliates_code on public.growth_affiliates(code);

-- Affiliate commissions / conversions
create table if not exists public.growth_affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.growth_affiliates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete set null,
  referral_email text,
  event_type text not null default 'signup' check (event_type in ('signup','subscribe','purchase','custom')),
  amount_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','paid','rejected','canceled')),
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_affiliate_commissions enable row level security;
drop policy if exists "Users see own commissions" on public.growth_affiliate_commissions;
create policy "Users see own commissions" on public.growth_affiliate_commissions
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own commissions" on public.growth_affiliate_commissions;
create policy "Users insert own commissions" on public.growth_affiliate_commissions
  for insert with check (auth.uid() = user_id);

create index if not exists idx_growth_commissions_affiliate on public.growth_affiliate_commissions(affiliate_id);
create index if not exists idx_growth_commissions_user on public.growth_affiliate_commissions(user_id);

-- Affiliate payouts
create table if not exists public.growth_affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.growth_affiliates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','processing','paid','failed','canceled')),
  method text not null default 'paypal' check (method in ('paypal','bank','credits','other')),
  reference text,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_affiliate_payouts enable row level security;
drop policy if exists "Users see own payouts" on public.growth_affiliate_payouts;
create policy "Users see own payouts" on public.growth_affiliate_payouts
  for select using (auth.uid() = user_id);

create index if not exists idx_growth_payouts_user on public.growth_affiliate_payouts(user_id);

-- Referral program (invite friends)
create table if not exists public.growth_referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  code text not null unique,
  reward_credits integer not null default 100,
  invitee_reward_credits integer not null default 50,
  total_invites integer not null default 0,
  total_accepted integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_referral_codes enable row level security;
drop policy if exists "Users manage own referral code" on public.growth_referral_codes;
create policy "Users manage own referral code" on public.growth_referral_codes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.growth_referral_invites (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  invitee_email text not null,
  invitee_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','accepted','expired','canceled')),
  reward_granted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

alter table public.growth_referral_invites enable row level security;
drop policy if exists "Users manage own referral invites" on public.growth_referral_invites;
create policy "Users manage own referral invites" on public.growth_referral_invites
  for all using (auth.uid() = referrer_user_id) with check (auth.uid() = referrer_user_id);

create index if not exists idx_growth_referral_invites_referrer on public.growth_referral_invites(referrer_user_id);
create index if not exists idx_growth_referral_invites_email on public.growth_referral_invites(invitee_email);

-- Leads
create table if not exists public.growth_leads (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text,
  company text,
  phone text,
  source text not null default 'website' check (source in (
    'website','contact','newsletter','exit_intent','cta','affiliate','referral','import','other'
  )),
  status text not null default 'new' check (status in ('new','contacted','qualified','nurturing','won','lost')),
  score integer not null default 0 check (score >= 0 and score <= 100),
  tags text[] not null default '{}',
  message text,
  page_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  affiliate_code text,
  referral_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_leads enable row level security;
drop policy if exists "Users manage own leads" on public.growth_leads;
create policy "Users manage own leads" on public.growth_leads
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
drop policy if exists "Anon can submit leads" on public.growth_leads;
create policy "Anon can submit leads" on public.growth_leads
  for insert to anon, authenticated
  with check (owner_user_id is null);

create index if not exists idx_growth_leads_owner on public.growth_leads(owner_user_id);
create index if not exists idx_growth_leads_email on public.growth_leads(email);
create index if not exists idx_growth_leads_created on public.growth_leads(created_at desc);

-- CRM contacts
create table if not exists public.growth_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text,
  company text,
  phone text,
  lifecycle_stage text not null default 'subscriber' check (lifecycle_stage in (
    'subscriber','lead','mql','sql','opportunity','customer','churned'
  )),
  score integer not null default 0 check (score >= 0 and score <= 100),
  tags text[] not null default '{}',
  lead_id uuid references public.growth_leads(id) on delete set null,
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, email)
);

alter table public.growth_contacts enable row level security;
drop policy if exists "Users manage own contacts" on public.growth_contacts;
create policy "Users manage own contacts" on public.growth_contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_growth_contacts_user on public.growth_contacts(user_id);

-- Sales pipeline deals
create table if not exists public.growth_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.growth_contacts(id) on delete set null,
  title text not null,
  stage text not null default 'new' check (stage in (
    'new','qualified','proposal','negotiation','won','lost'
  )),
  value_cents integer not null default 0,
  currency text not null default 'USD',
  probability integer not null default 10 check (probability >= 0 and probability <= 100),
  expected_close_at date,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_deals enable row level security;
drop policy if exists "Users manage own deals" on public.growth_deals;
create policy "Users manage own deals" on public.growth_deals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_growth_deals_user on public.growth_deals(user_id);
create index if not exists idx_growth_deals_stage on public.growth_deals(stage);

-- Email subscribers / lists
create table if not exists public.growth_subscribers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text,
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed','bounced','complained')),
  source text not null default 'newsletter',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.growth_subscribers enable row level security;
drop policy if exists "Users manage own subscribers" on public.growth_subscribers;
create policy "Users manage own subscribers" on public.growth_subscribers
  for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
drop policy if exists "Anon can subscribe" on public.growth_subscribers;
create policy "Anon can subscribe" on public.growth_subscribers
  for insert to anon, authenticated
  with check (owner_user_id is null);

create index if not exists idx_growth_subscribers_email on public.growth_subscribers(email);

create unique index if not exists growth_subscribers_email_owner_uidx
  on public.growth_subscribers (email, (coalesce(owner_user_id, '00000000-0000-0000-0000-000000000000'::uuid)));

-- Email campaigns
create table if not exists public.growth_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  preview_text text not null default '',
  body_html text not null default '',
  body_text text not null default '',
  status text not null default 'draft' check (status in ('draft','scheduled','sending','sent','canceled')),
  segment text not null default 'all',
  scheduled_at timestamptz,
  sent_at timestamptz,
  stats jsonb not null default '{"sent":0,"opened":0,"clicked":0,"bounced":0}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_email_campaigns enable row level security;
drop policy if exists "Users manage own campaigns" on public.growth_email_campaigns;
create policy "Users manage own campaigns" on public.growth_email_campaigns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Automations / sequences
create table if not exists public.growth_automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  trigger_event text not null check (trigger_event in (
    'lead_created','subscriber_added','deal_stage_changed','user_signed_up','custom'
  )),
  status text not null default 'active' check (status in ('active','paused','archived')),
  steps jsonb not null default '[]'::jsonb,
  segment_rules jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{"enrolled":0,"completed":0}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_automations enable row level security;
drop policy if exists "Users manage own automations" on public.growth_automations;
create policy "Users manage own automations" on public.growth_automations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Growth events (analytics)
create table if not exists public.growth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  event_name text not null,
  event_category text not null default 'engagement' check (event_category in (
    'pageview','engagement','conversion','campaign','experiment','affiliate','system'
  )),
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  value_cents integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.growth_events enable row level security;
drop policy if exists "Users see own growth events" on public.growth_events;
create policy "Users see own growth events" on public.growth_events
  for select using (auth.uid() = user_id);
drop policy if exists "Anyone can insert growth events" on public.growth_events;
create policy "Anyone can insert growth events" on public.growth_events
  for insert to anon, authenticated
  with check (true);

create index if not exists idx_growth_events_created on public.growth_events(created_at desc);
create index if not exists idx_growth_events_name on public.growth_events(event_name);
create index if not exists idx_growth_events_user on public.growth_events(user_id);

-- A/B experiments
create table if not exists public.growth_experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  hypothesis text not null default '',
  target_type text not null check (target_type in ('landing','headline','cta','pricing','other')),
  status text not null default 'draft' check (status in ('draft','running','paused','completed','archived')),
  variants jsonb not null default '[]'::jsonb,
  traffic_allocation jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{"impressions":0,"conversions":0}'::jsonb,
  winner_variant_id text,
  started_at timestamptz,
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_experiments enable row level security;
drop policy if exists "Users manage own experiments" on public.growth_experiments;
create policy "Users manage own experiments" on public.growth_experiments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Segments
create table if not exists public.growth_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  rules jsonb not null default '{}'::jsonb,
  member_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.growth_segments enable row level security;
drop policy if exists "Users manage own segments" on public.growth_segments;
create policy "Users manage own segments" on public.growth_segments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Claim platform leads into a user inbox
create or replace function public.claim_platform_growth_leads(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed integer;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  with moved as (
    update public.growth_leads
    set owner_user_id = auth.uid(), updated_at = now()
    where id in (
      select id from public.growth_leads
      where owner_user_id is null
      order by created_at asc
      limit greatest(1, least(p_limit, 500))
      for update skip locked
    )
    returning 1
  )
  select count(*)::integer into claimed from moved;

  return coalesce(claimed, 0);
end;
$$;

revoke all on function public.claim_platform_growth_leads(integer) from public;
grant execute on function public.claim_platform_growth_leads(integer) to authenticated;
