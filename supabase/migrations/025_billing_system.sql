-- ============================================================
-- BILLING SYSTEM (PayPal + Card, subscriptions, credits, invoices)
-- Provider-agnostic: gateway_provider column supports paypal | card | future
-- ============================================================

-- Billing customer profile (links user to payment provider customer ids)
create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  organization_id uuid references public.organizations(id) on delete set null,
  email text,
  default_provider text not null default 'paypal' check (default_provider in ('paypal','card')),
  paypal_payer_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;
drop policy if exists "Users manage own billing customer" on public.billing_customers;
create policy "Users manage own billing customer" on public.billing_customers
  for all using (auth.uid() = user_id);

-- Active / historical subscriptions
create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  plan_id text not null references public.subscription_plans(id),
  billing_interval text not null check (billing_interval in ('monthly','yearly')),
  status text not null default 'active' check (status in ('trialing','active','past_due','canceled','expired','incomplete')),
  provider text not null check (provider in ('paypal','card')),
  provider_subscription_id text,
  provider_customer_id text,
  amount_cents integer not null default 0,
  currency text not null default 'USD',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_subscriptions enable row level security;
drop policy if exists "Users see own subscriptions" on public.billing_subscriptions;
create policy "Users see own subscriptions" on public.billing_subscriptions
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own subscriptions" on public.billing_subscriptions;
create policy "Users insert own subscriptions" on public.billing_subscriptions
  for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own subscriptions" on public.billing_subscriptions;
create policy "Users update own subscriptions" on public.billing_subscriptions
  for update using (auth.uid() = user_id);

create index if not exists idx_billing_subscriptions_user on public.billing_subscriptions(user_id);
create index if not exists idx_billing_subscriptions_status on public.billing_subscriptions(status);

-- Invoices / payment receipts
create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  subscription_id uuid references public.billing_subscriptions(id) on delete set null,
  invoice_number text not null unique,
  status text not null default 'open' check (status in ('draft','open','paid','void','uncollectible')),
  description text not null default '',
  amount_cents integer not null default 0,
  currency text not null default 'USD',
  provider text not null check (provider in ('paypal','card')),
  provider_invoice_id text,
  provider_payment_id text,
  hosted_invoice_url text,
  pdf_url text,
  line_items jsonb not null default '[]'::jsonb,
  paid_at timestamptz,
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_invoices enable row level security;
drop policy if exists "Users see own invoices" on public.billing_invoices;
create policy "Users see own invoices" on public.billing_invoices
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own invoices" on public.billing_invoices;
create policy "Users insert own invoices" on public.billing_invoices
  for insert with check (auth.uid() = user_id);

create index if not exists idx_billing_invoices_user on public.billing_invoices(user_id);
create index if not exists idx_billing_invoices_created on public.billing_invoices(created_at desc);

-- Credit balance (usage-based)
create table if not exists public.credit_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_purchased integer not null default 0,
  lifetime_used integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.credit_balances enable row level security;
drop policy if exists "Users see own credits" on public.credit_balances;
create policy "Users see own credits" on public.credit_balances
  for select using (auth.uid() = user_id);
drop policy if exists "Users upsert own credits" on public.credit_balances;
create policy "Users upsert own credits" on public.credit_balances
  for all using (auth.uid() = user_id);

-- Credit ledger (purchases, grants, usage deductions)
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  balance_after integer not null,
  reason text not null check (reason in ('purchase','subscription_grant','usage','refund','adjustment','bonus')),
  resource text,
  reference_id text,
  provider text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.credit_ledger enable row level security;
drop policy if exists "Users see own credit ledger" on public.credit_ledger;
create policy "Users see own credit ledger" on public.credit_ledger
  for select using (auth.uid() = user_id);
drop policy if exists "Users insert own credit ledger" on public.credit_ledger;
create policy "Users insert own credit ledger" on public.credit_ledger
  for insert with check (auth.uid() = user_id);

create index if not exists idx_credit_ledger_user on public.credit_ledger(user_id, created_at desc);

-- Credit packs for one-time purchase
create table if not exists public.credit_packs (
  id text primary key,
  name text not null,
  credits integer not null check (credits > 0),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.credit_packs enable row level security;
drop policy if exists "Anyone can read credit packs" on public.credit_packs;
create policy "Anyone can read credit packs" on public.credit_packs
  for select using (true);

insert into public.credit_packs (id, name, credits, price_cents, sort_order) values
  ('credits_100', '100 Credits', 100, 900, 1),
  ('credits_500', '500 Credits', 500, 3900, 2),
  ('credits_2000', '2,000 Credits', 2000, 9900, 3)
on conflict (id) do nothing;

-- Checkout sessions (pending payments)
create table if not exists public.billing_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('subscription','credits')),
  provider text not null check (provider in ('paypal','card')),
  status text not null default 'pending' check (status in ('pending','completed','expired','canceled')),
  plan_id text,
  billing_interval text,
  credit_pack_id text,
  amount_cents integer not null default 0,
  currency text not null default 'USD',
  provider_order_id text,
  approval_url text,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null default (now() + interval '1 hour'),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.billing_checkout_sessions enable row level security;
drop policy if exists "Users manage own checkout sessions" on public.billing_checkout_sessions;
create policy "Users manage own checkout sessions" on public.billing_checkout_sessions
  for all using (auth.uid() = user_id);

create index if not exists idx_billing_checkout_user on public.billing_checkout_sessions(user_id);

-- Webhook event log (idempotency)
create table if not exists public.billing_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  error text,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

alter table public.billing_webhook_events enable row level security;
-- No user policies — service role / edge only via service key; authenticated users cannot read

-- Extend plan limits with monthly credits allowance (optional column via jsonb already exists)
update public.subscription_plans
set limits = coalesce(limits, '{}'::jsonb) || jsonb_build_object(
  'credits_monthly',
  case id
    when 'free' then 50
    when 'starter' then 500
    when 'pro' then 5000
    when 'enterprise' then 50000
    else 50
  end
)
where true;
