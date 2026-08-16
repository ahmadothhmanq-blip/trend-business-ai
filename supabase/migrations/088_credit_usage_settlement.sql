-- Idempotent AI credit settlement: unique ledger refs + refund_credits RPC.
-- consume_credits becomes safe to retry with the same p_reference_id.

create unique index if not exists idx_credit_ledger_user_reference_reason
  on public.credit_ledger (user_id, reference_id, reason)
  where reference_id is not null;

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

  -- Idempotent settle: same usage reference never charges twice.
  if p_reference_id is not null then
    if exists (
      select 1
      from public.credit_ledger cl
      where cl.user_id = p_user_id
        and cl.reference_id = p_reference_id
        and cl.reason = 'usage'
    ) then
      return query
        select cb.balance, cb.lifetime_used
        from public.credit_balances cb
        where cb.user_id = p_user_id;
      return;
    end if;
  end if;

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
  values (
    p_user_id,
    -p_amount,
    next_balance,
    'usage',
    p_resource,
    p_reference_id,
    jsonb_build_object('amount', p_amount, 'settlement', 'final')
  );

  return query select next_balance, used + p_amount;
end;
$$;

create or replace function public.refund_credits(
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
  usage_delta integer;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'forbidden';
  end if;

  if p_reference_id is null or length(trim(p_reference_id)) = 0 then
    raise exception 'reference_id required for refund';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  insert into public.credit_balances (user_id, balance, lifetime_purchased, lifetime_used)
  values (p_user_id, 50, 0, 0)
  on conflict (user_id) do nothing;

  -- Idempotent refund: same reference never refunds twice.
  if exists (
    select 1
    from public.credit_ledger cl
    where cl.user_id = p_user_id
      and cl.reference_id = p_reference_id
      and cl.reason = 'refund'
  ) then
    return query
      select cb.balance, cb.lifetime_used
      from public.credit_balances cb
      where cb.user_id = p_user_id;
    return;
  end if;

  select cl.delta into usage_delta
  from public.credit_ledger cl
  where cl.user_id = p_user_id
    and cl.reference_id = p_reference_id
    and cl.reason = 'usage'
  limit 1;

  -- Nothing charged for this reference — no-op refund (auditable no-write).
  if usage_delta is null then
    return query
      select cb.balance, cb.lifetime_used
      from public.credit_balances cb
      where cb.user_id = p_user_id;
    return;
  end if;

  -- Only refund what was charged (ignore oversized callers).
  if abs(usage_delta) < p_amount then
    p_amount := abs(usage_delta);
  end if;

  select cb.balance, cb.lifetime_used into current_balance, used
  from public.credit_balances cb
  where cb.user_id = p_user_id
  for update;

  next_balance := current_balance + p_amount;
  update public.credit_balances
  set balance = next_balance,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_ledger (user_id, delta, balance_after, reason, resource, reference_id, metadata)
  values (
    p_user_id,
    p_amount,
    next_balance,
    'refund',
    p_resource,
    p_reference_id,
    jsonb_build_object(
      'amount', p_amount,
      'settlement', 'refund',
      'usage_delta', usage_delta
    )
  );

  return query select next_balance, used;
end;
$$;

revoke all on function public.consume_credits(uuid, integer, text, text) from public;
revoke all on function public.refund_credits(uuid, integer, text, text) from public;

grant execute on function public.consume_credits(uuid, integer, text, text) to authenticated;
grant execute on function public.consume_credits(uuid, integer, text, text) to service_role;
grant execute on function public.refund_credits(uuid, integer, text, text) to authenticated;
grant execute on function public.refund_credits(uuid, integer, text, text) to service_role;

revoke execute on function public.consume_credits(uuid, integer, text, text) from anon;
revoke execute on function public.refund_credits(uuid, integer, text, text) from anon;
