-- ============================================================
-- Phase 20 — Production QA fixes
-- - Org RLS recursion (SECURITY DEFINER helpers)
-- - Fix Phase 18 org table name + owner escalation policy
-- - Checkout processing status for safe fulfillment
-- - Harden consume_credits caller check
-- ============================================================

-- Allow processing status for atomic checkout claim
alter table public.billing_checkout_sessions
  drop constraint if exists billing_checkout_sessions_status_check;

alter table public.billing_checkout_sessions
  add constraint billing_checkout_sessions_status_check
  check (status in ('pending', 'processing', 'completed', 'expired', 'canceled'));

-- Org membership helpers (avoid RLS recursion on org_members)
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

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.is_org_admin(uuid) from public;
revoke all on function public.is_org_owner(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.is_org_owner(uuid) to authenticated;
grant execute on function public.is_org_member(uuid) to service_role;
grant execute on function public.is_org_admin(uuid) to service_role;
grant execute on function public.is_org_owner(uuid) to service_role;

-- Rebuild org_members policies without self-referential subqueries
drop policy if exists "Members can view org members" on public.org_members;
create policy "Members can view org members" on public.org_members
  for select using (public.is_org_member(organization_id));

drop policy if exists "Admins can manage members" on public.org_members;
drop policy if exists "Admins can update members" on public.org_members;
drop policy if exists "Admins can delete members" on public.org_members;
drop policy if exists "Admins can insert members" on public.org_members;

-- Guarded: mistaken Phase 18 name used organization_members (never created)
do $$
begin
  if to_regclass('public.organization_members') is not null then
    execute 'drop policy if exists "Admins can update members" on public.organization_members';
  end if;
end $$;

create policy "Admins can update members" on public.org_members
  for update using (public.is_org_admin(organization_id))
  with check (
    (role <> 'owner' and public.is_org_admin(organization_id))
    or public.is_org_owner(organization_id)
  );

create policy "Admins can delete members" on public.org_members
  for delete using (public.is_org_admin(organization_id));

create policy "Admins can insert members" on public.org_members
  for insert with check (
    public.is_org_admin(organization_id)
    or (
      role = 'owner'
      and user_id = auth.uid()
      and not exists (
        select 1 from public.org_members om
        where om.organization_id = org_members.organization_id
      )
    )
  );

-- Organizations select via helper (avoids recursive org_members subquery)
drop policy if exists "Org members can view their org" on public.organizations;
drop policy if exists "Org members and owners can view" on public.organizations;
drop policy if exists "Members see own orgs" on public.organizations;
create policy "Org members and owners can view" on public.organizations
  for select using (
    owner_id = auth.uid()
    or public.is_org_member(id)
  );

-- Harden consume_credits: service role preferred; block cross-user when called as user
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

revoke all on function public.consume_credits(uuid, integer, text, text) from public;
grant execute on function public.consume_credits(uuid, integer, text, text) to service_role;
grant execute on function public.consume_credits(uuid, integer, text, text) to authenticated;
