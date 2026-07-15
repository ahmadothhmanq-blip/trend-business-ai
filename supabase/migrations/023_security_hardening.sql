-- Phase 12: Security hardening — RLS policy fixes & missing indexes
-- Fixes identified in Enterprise Audit Report

-- 1. Fix notifications INSERT policy (was: WITH CHECK (true) — anyone could insert for any user)
drop policy if exists "System can insert notifications" on public.notifications;
create policy "Service role inserts notifications" on public.notifications
  for insert with check (auth.uid() = user_id);

-- 2. Fix org_members admin policy — split into separate INSERT/UPDATE/DELETE
--    to prevent self-referencing INSERT bypass
drop policy if exists "Admins can manage members" on public.org_members;

create policy "Admins can update members" on public.org_members
  for update using (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner','admin')
    )
  );

create policy "Admins can delete members" on public.org_members
  for delete using (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner','admin')
    )
  );

create policy "Admins can insert members" on public.org_members
  for insert with check (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner','admin')
    )
    and user_id != auth.uid()
  );

-- 3. Add missing indexes on webhooks
create index if not exists idx_webhooks_user on public.webhooks(user_id);
create index if not exists idx_webhooks_active on public.webhooks(is_active) where is_active = true;

-- 4. Add updated_at trigger function (reusable)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 5. Add updated_at triggers for tables that have the column
do $$
declare
  tbl text;
begin
  for tbl in
    select table_name from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
      and table_name not in ('profiles')
  loop
    execute format(
      'drop trigger if exists trg_%I_updated_at on public.%I; '
      'create trigger trg_%I_updated_at before update on public.%I '
      'for each row execute function public.set_updated_at();',
      tbl, tbl, tbl, tbl
    );
  end loop;
end;
$$;

-- 6. Add missing indexes on api_keys
create index if not exists idx_api_keys_user on public.api_keys(user_id);
create index if not exists idx_api_keys_hash on public.api_keys(key_hash);

-- 7. Add missing index on feature_flags
create index if not exists idx_feature_flags_key on public.feature_flags(key);
