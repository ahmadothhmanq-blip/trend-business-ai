-- ============================================================
-- Phase 18 — Security hardening
-- Lock down billing writes, agent templates, usage inserts, org roles
-- ============================================================

-- Billing: users may SELECT only. All mutations via service role.
drop policy if exists "Users manage own billing customer" on public.billing_customers;
create policy "Users see own billing customer" on public.billing_customers
  for select using (auth.uid() = user_id);

drop policy if exists "Users see own subscriptions" on public.billing_subscriptions;
drop policy if exists "Users insert own subscriptions" on public.billing_subscriptions;
drop policy if exists "Users update own subscriptions" on public.billing_subscriptions;
create policy "Users see own subscriptions" on public.billing_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "Users see own invoices" on public.billing_invoices;
drop policy if exists "Users insert own invoices" on public.billing_invoices;
create policy "Users see own invoices" on public.billing_invoices
  for select using (auth.uid() = user_id);

drop policy if exists "Users see own credits" on public.credit_balances;
drop policy if exists "Users upsert own credits" on public.credit_balances;
create policy "Users see own credits" on public.credit_balances
  for select using (auth.uid() = user_id);

drop policy if exists "Users see own credit ledger" on public.credit_ledger;
drop policy if exists "Users insert own credit ledger" on public.credit_ledger;
create policy "Users see own credit ledger" on public.credit_ledger
  for select using (auth.uid() = user_id);

drop policy if exists "Users manage own checkout sessions" on public.billing_checkout_sessions;
create policy "Users see own checkout sessions" on public.billing_checkout_sessions
  for select using (auth.uid() = user_id);

-- Agents: templates are read-only for users
drop policy if exists "Users manage own agents" on public.agents;
create policy "Users select own or template agents" on public.agents
  for select using (auth.uid() = user_id or is_template = true);
create policy "Users insert own non-template agents" on public.agents
  for insert with check (auth.uid() = user_id and coalesce(is_template, false) = false);
create policy "Users update own non-template agents" on public.agents
  for update using (auth.uid() = user_id and coalesce(is_template, false) = false)
  with check (auth.uid() = user_id and coalesce(is_template, false) = false);
create policy "Users delete own non-template agents" on public.agents
  for delete using (auth.uid() = user_id and coalesce(is_template, false) = false);

-- Prompt library: public prompts are read-only
drop policy if exists "Users manage own prompts" on public.prompt_library;
create policy "Users select own or public prompts" on public.prompt_library
  for select using (auth.uid() = user_id or is_public = true);
create policy "Users insert own private prompts" on public.prompt_library
  for insert with check (auth.uid() = user_id and coalesce(is_public, false) = false);
create policy "Users update own private prompts" on public.prompt_library
  for update using (auth.uid() = user_id and coalesce(is_public, false) = false)
  with check (auth.uid() = user_id and coalesce(is_public, false) = false);
create policy "Users delete own private prompts" on public.prompt_library
  for delete using (auth.uid() = user_id and coalesce(is_public, false) = false);

-- usage_records: users can only insert their own rows
drop policy if exists "Users insert own usage" on public.usage_records;
create policy "Users insert own usage" on public.usage_records
  for insert with check (auth.uid() = user_id);

-- Org members: non-owners cannot escalate to owner (fixed table name: org_members)
drop policy if exists "Admins can update members" on public.org_members;
create policy "Admins can update members" on public.org_members
  for update using (
    exists (
      select 1 from public.org_members m
      where m.organization_id = org_members.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  )
  with check (
    (
      role <> 'owner'
      and exists (
        select 1 from public.org_members m
        where m.organization_id = org_members.organization_id
          and m.user_id = auth.uid()
          and m.role in ('owner', 'admin')
      )
    )
    or exists (
      select 1 from public.org_members m
      where m.organization_id = org_members.organization_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- Atomic credit consume helper (service role / SECURITY DEFINER)
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
