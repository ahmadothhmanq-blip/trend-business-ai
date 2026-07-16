-- ============================================================
-- Phase 22 — Growth Engine security hardening (production audit)
-- Lock financial columns, tighten event RLS, admin-only lead claim
-- ============================================================

-- Affiliates: SELECT + insert pending + update profile (financials guarded by trigger)
drop policy if exists "Users manage own affiliate" on public.growth_affiliates;
drop policy if exists "Users see own affiliate" on public.growth_affiliates;
drop policy if exists "Users insert own affiliate" on public.growth_affiliates;
drop policy if exists "Users update own affiliate profile" on public.growth_affiliates;

create policy "Users see own affiliate" on public.growth_affiliates
  for select using (auth.uid() = user_id);

create policy "Users insert own affiliate" on public.growth_affiliates
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'
    and coalesce(commission_rate_bps, 2000) = 2000
    and coalesce(total_clicks, 0) = 0
    and coalesce(total_referrals, 0) = 0
    and coalesce(total_earned_cents, 0) = 0
    and coalesce(total_paid_cents, 0) = 0
  );

create policy "Users update own affiliate profile" on public.growth_affiliates
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.protect_growth_affiliate_financials()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.commission_rate_bps is distinct from old.commission_rate_bps
      or new.total_clicks is distinct from old.total_clicks
      or new.total_referrals is distinct from old.total_referrals
      or new.total_earned_cents is distinct from old.total_earned_cents
      or new.total_paid_cents is distinct from old.total_paid_cents
      or new.status is distinct from old.status
      or new.code is distinct from old.code
    then
      -- Allow service_role / postgres to mutate financials; block authenticated clients.
      if coalesce(auth.role(), '') = 'authenticated' then
        raise exception 'FORBIDDEN_AFFILIATE_FINANCIAL_UPDATE';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_growth_affiliate_financials on public.growth_affiliates;
create trigger trg_protect_growth_affiliate_financials
  before update on public.growth_affiliates
  for each row execute function public.protect_growth_affiliate_financials();

-- Commissions: SELECT only for users
drop policy if exists "Users see own commissions" on public.growth_affiliate_commissions;
drop policy if exists "Users insert own commissions" on public.growth_affiliate_commissions;
create policy "Users see own commissions" on public.growth_affiliate_commissions
  for select using (auth.uid() = user_id);

-- Referral codes: prevent reward inflation via trigger
drop policy if exists "Users manage own referral code" on public.growth_referral_codes;
drop policy if exists "Users see own referral code" on public.growth_referral_codes;
drop policy if exists "Users insert own referral code" on public.growth_referral_codes;
drop policy if exists "Users update own referral counters" on public.growth_referral_codes;

create policy "Users see own referral code" on public.growth_referral_codes
  for select using (auth.uid() = user_id);

create policy "Users insert own referral code" on public.growth_referral_codes
  for insert with check (
    auth.uid() = user_id
    and coalesce(reward_credits, 100) = 100
    and coalesce(invitee_reward_credits, 50) = 50
    and coalesce(total_invites, 0) = 0
    and coalesce(total_accepted, 0) = 0
  );

create policy "Users update own referral counters" on public.growth_referral_codes
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.protect_growth_referral_rewards()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.reward_credits is distinct from old.reward_credits
      or new.invitee_reward_credits is distinct from old.invitee_reward_credits
      or new.code is distinct from old.code
    then
      if coalesce(auth.role(), '') = 'authenticated' then
        raise exception 'FORBIDDEN_REFERRAL_REWARD_UPDATE';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_growth_referral_rewards on public.growth_referral_codes;
create trigger trg_protect_growth_referral_rewards
  before update on public.growth_referral_codes
  for each row execute function public.protect_growth_referral_rewards();

-- Growth events: cannot spoof another user's id
drop policy if exists "Anyone can insert growth events" on public.growth_events;
create policy "Anyone can insert growth events" on public.growth_events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- Admin-only platform lead claim
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

revoke all on function public.claim_platform_growth_leads(integer) from public;
grant execute on function public.claim_platform_growth_leads(integer) to authenticated;
