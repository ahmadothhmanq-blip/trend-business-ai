-- Migration 083: Supabase Security Advisor remediation
-- Addresses SECURITY DEFINER views, RLS gaps, permissive policies,
-- function search_path, EXECUTE grants, and public storage hardening.

-- ---------------------------------------------------------------------------
-- 1. Replace SECURITY DEFINER view with security_invoker + column grants
-- ---------------------------------------------------------------------------

revoke all on table public.website_domains from anon;
grant select (
  id,
  generation_id,
  hostname,
  kind,
  status,
  ssl_status,
  created_at,
  updated_at
) on table public.website_domains to anon;

drop policy if exists "Anon read active website domains" on public.website_domains;
create policy "Anon read active website domains"
  on public.website_domains for select to anon
  using (status = 'active');

create or replace view public.website_active_domains_public
with (security_invoker = true) as
select
  id,
  generation_id,
  hostname,
  kind,
  status,
  ssl_status,
  created_at,
  updated_at
from public.website_domains
where status = 'active';

grant select on public.website_active_domains_public to anon, authenticated;

comment on view public.website_active_domains_public is
  'Public domain routing metadata (no verification_token). Uses security_invoker with anon column grants.';

-- ---------------------------------------------------------------------------
-- 2–3. billing_webhook_events explicit deny policies (service role bypasses RLS)
-- ---------------------------------------------------------------------------

drop policy if exists "Deny client access to billing webhook events" on public.billing_webhook_events;
create policy "Deny client access to billing webhook events"
  on public.billing_webhook_events for all
  to anon, authenticated
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- 4–6. Platform admin helper + function hardening (search_path / EXECUTE)
-- ---------------------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
      or coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_platform_admin() to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

-- Re-assert search_path + least-privilege EXECUTE on SECURITY DEFINER RPC helpers
create or replace function public.consume_credits(
  p_user_id uuid,
  p_amount integer,
  p_resource text default null,
  p_reference_id text default null
)
returns table(balance integer, lifetime_used integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
  next_balance integer;
  used integer;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  insert into public.credit_balances (user_id, balance, lifetime_purchased, lifetime_used)
  values (p_user_id, 50, 0, 0)
  on conflict (user_id) do nothing;

  select cb.balance, cb.lifetime_used into current_balance, used
  from public.credit_balances cb
  where cb.user_id = p_user_id
  for update;

  if current_balance < p_amount then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  next_balance := current_balance - p_amount;
  update public.credit_balances
  set balance = next_balance,
      lifetime_used = used + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_ledger (user_id, delta, balance_after, reason, resource, reference_id, metadata)
  values (p_user_id, -p_amount, next_balance, 'usage', p_resource, p_reference_id, jsonb_build_object('amount', p_amount));

  return query select next_balance, used + p_amount;
end;
$$;

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where organization_id = p_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(p_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where organization_id = p_org_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_org_owner(p_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where organization_id = p_org_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.claim_platform_growth_leads(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed integer;
  is_admin boolean;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
  into is_admin;

  if not is_admin then
    raise exception 'FORBIDDEN';
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

create or replace function public.is_website_generation_member(
  p_generation_id uuid,
  p_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.website_generation_members m
    where m.generation_id = p_generation_id
      and m.user_id = p_user_id
      and m.status = 'accepted'
  );
$$;

do $$
begin
  if to_regprocedure('public.can_edit_website_generation(uuid,uuid)') is not null then
    execute $fn$
      create or replace function public.can_edit_website_generation(
        p_generation_id uuid,
        p_user_id uuid
      )
      returns boolean
      language sql
      security definer
      set search_path = public
      stable
      as $body$
        select exists (
          select 1
          from public.website_generation_members m
          where m.generation_id = p_generation_id
            and m.user_id = p_user_id
            and m.status = 'accepted'
            and m.role in ('editor', 'owner')
        );
      $body$;
    $fn$;
  end if;
end $$;

revoke all on function public.consume_credits(uuid, integer, text, text) from public;
revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.is_org_admin(uuid) from public;
revoke all on function public.is_org_owner(uuid) from public;
revoke all on function public.claim_platform_growth_leads(integer) from public;
revoke all on function public.is_website_generation_member(uuid, uuid) from public;

grant execute on function public.consume_credits(uuid, integer, text, text) to authenticated;
grant execute on function public.consume_credits(uuid, integer, text, text) to service_role;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.is_org_owner(uuid) to authenticated;
grant execute on function public.is_org_member(uuid) to service_role;
grant execute on function public.is_org_admin(uuid) to service_role;
grant execute on function public.is_org_owner(uuid) to service_role;
grant execute on function public.claim_platform_growth_leads(integer) to authenticated;
grant execute on function public.claim_platform_growth_leads(integer) to service_role;
grant execute on function public.is_website_generation_member(uuid, uuid) to authenticated;
grant execute on function public.is_website_generation_member(uuid, uuid) to service_role;

revoke execute on function public.consume_credits(uuid, integer, text, text) from anon;
revoke execute on function public.is_org_member(uuid) from anon;
revoke execute on function public.is_org_admin(uuid) from anon;
revoke execute on function public.is_org_owner(uuid) from anon;
revoke execute on function public.claim_platform_growth_leads(integer) from anon;
revoke execute on function public.is_website_generation_member(uuid, uuid) from anon;
revoke execute on function public.is_platform_admin() from anon;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

do $$
begin
  if to_regprocedure('public.can_edit_website_generation(uuid,uuid)') is not null then
    execute 'revoke all on function public.can_edit_website_generation(uuid, uuid) from public';
    execute 'grant execute on function public.can_edit_website_generation(uuid, uuid) to authenticated';
    execute 'grant execute on function public.can_edit_website_generation(uuid, uuid) to service_role';
    execute 'revoke execute on function public.can_edit_website_generation(uuid, uuid) from anon';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Fix overly permissive RLS policies
-- ---------------------------------------------------------------------------

drop policy if exists "System inserts usage" on public.usage_records;

drop policy if exists "Anyone can read flags" on public.feature_flags;
create policy "Admins read feature flags"
  on public.feature_flags for select
  using (public.is_platform_admin());

-- Move Stripe Connect IDs off the publicly readable creators table
create table if not exists public.marketplace_creator_private (
  creator_id uuid primary key references public.marketplace_creators (id) on delete cascade,
  stripe_connect_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_creator_private enable row level security;

drop policy if exists "Owners manage creator private data" on public.marketplace_creator_private;
create policy "Owners manage creator private data"
  on public.marketplace_creator_private for all
  using (
    creator_id in (
      select id from public.marketplace_creators where user_id = auth.uid()
    )
  )
  with check (
    creator_id in (
      select id from public.marketplace_creators where user_id = auth.uid()
    )
  );

insert into public.marketplace_creator_private (creator_id, stripe_connect_account_id)
select id, stripe_connect_account_id
from public.marketplace_creators
where stripe_connect_account_id is not null
on conflict (creator_id) do update
set stripe_connect_account_id = excluded.stripe_connect_account_id,
    updated_at = now();

alter table public.marketplace_creators
  drop column if exists stripe_connect_account_id;

drop policy if exists "Public can view creators" on public.marketplace_creators;

create or replace view public.marketplace_creators_public
with (security_invoker = true) as
select
  id,
  display_name,
  handle,
  bio,
  avatar_url,
  location,
  website,
  payout_ready,
  follower_count,
  created_at,
  updated_at
from public.marketplace_creators;

grant select on public.marketplace_creators_public to anon, authenticated;

drop policy if exists "Anyone can read creator public profile" on public.marketplace_creators;
create policy "Anyone can read creator public profile"
  on public.marketplace_creators for select
  using (
    user_id = auth.uid()
    or id in (
      select distinct creator_id
      from public.marketplace_template_listings
      where status = 'published'
    )
  );

drop policy if exists "Public can view reviews" on public.marketplace_template_reviews;
create policy "Public can view published listing reviews"
  on public.marketplace_template_reviews for select
  using (
    listing_id in (
      select id from public.marketplace_template_listings where status = 'published'
    )
  );

drop trigger if exists trg_marketplace_creator_private_updated_at on public.marketplace_creator_private;
create trigger trg_marketplace_creator_private_updated_at
  before update on public.marketplace_creator_private
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. Harden public storage buckets (keep public read URLs working)
-- ---------------------------------------------------------------------------

drop policy if exists "Users manage own website assets" on storage.objects;
create policy "Users insert own website assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'website-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users update own website assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'website-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'website-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users delete own website assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'website-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users manage own ai assets" on storage.objects;
create policy "Users insert own ai assets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'ai-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users update own ai assets"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'ai-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'ai-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users delete own ai assets"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'ai-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 9. Leaked password protection (Auth dashboard — not configurable via SQL)
-- Enable in Supabase Dashboard → Authentication → Providers → Email:
--   "Prevent use of leaked passwords" (Pro plan+ / HaveIBeenPwned integration)
-- ---------------------------------------------------------------------------
