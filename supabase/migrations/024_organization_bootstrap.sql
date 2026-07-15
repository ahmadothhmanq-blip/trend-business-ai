-- Phase 13: Organization bootstrap policies
-- Fixes chicken-and-egg: users could not create orgs or add themselves as owner.

-- 1. Allow authenticated users to create organizations they own
drop policy if exists "Users can create organizations" on public.organizations;
create policy "Users can create organizations" on public.organizations
  for insert with check (owner_id = auth.uid());

-- 2. Allow owners to view orgs even before membership row exists
drop policy if exists "Org members can view their org" on public.organizations;
drop policy if exists "Org members and owners can view" on public.organizations;
create policy "Org members and owners can view" on public.organizations
  for select using (
    owner_id = auth.uid()
    or id in (select organization_id from public.org_members where user_id = auth.uid())
  );

-- 3. Allow org owners to insert themselves as the first member (owner role)
drop policy if exists "Owners can join as first member" on public.org_members;
create policy "Owners can join as first member" on public.org_members
  for insert with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.owner_id = auth.uid()
    )
  );

-- 4. Ensure admins can still invite other members (may already exist from 023)
drop policy if exists "Admins can insert members" on public.org_members;
create policy "Admins can insert members" on public.org_members
  for insert with check (
    organization_id in (
      select om.organization_id from public.org_members om
      where om.user_id = auth.uid() and om.role in ('owner', 'admin')
    )
    and user_id <> auth.uid()
  );
