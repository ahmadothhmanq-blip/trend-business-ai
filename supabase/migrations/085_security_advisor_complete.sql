-- Migration 085: Complete Security Advisor structural fixes
-- - schema_migrations RLS lockdown
-- - Remove public bucket listing policies (URLs still work)
-- - Move RLS helper SECURITY DEFINER functions to private schema (not RPC-exposed)
-- - Consolidate duplicate / overlapping permissive policies
-- - Prevent future public EXECUTE grants on new public functions

-- ---------------------------------------------------------------------------
-- 1. Lock down migration tracking table (PostgREST-exposed public schema)
-- ---------------------------------------------------------------------------

alter table if exists public.schema_migrations enable row level security;

drop policy if exists "Deny client access to schema migrations" on public.schema_migrations;
create policy "Deny client access to schema migrations"
  on public.schema_migrations for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.schema_migrations is
  'Local migration ledger for npm run db:apply. RLS denies API clients; direct SQL/service role only.';

-- ---------------------------------------------------------------------------
-- 2. Private schema for internal SECURITY DEFINER helpers (not PostgREST RPC)
-- ---------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to postgres, service_role, authenticated;

create or replace function private.is_org_member(p_org_id uuid)
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

create or replace function private.is_org_admin(p_org_id uuid)
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

create or replace function private.is_org_owner(p_org_id uuid)
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

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
      or coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$;

create or replace function private.is_website_generation_member(
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
      create or replace function private.can_edit_website_generation(
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

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated, service_role;

-- Point RLS policies at private helpers (not callable via /rpc)
drop policy if exists "Members can view org members" on public.org_members;
create policy "Members can view org members" on public.org_members
  for select using (private.is_org_member(organization_id));

drop policy if exists "Admins can update members" on public.org_members;
create policy "Admins can update members" on public.org_members
  for update using (private.is_org_admin(organization_id))
  with check (
    (role <> 'owner' and private.is_org_admin(organization_id))
    or private.is_org_owner(organization_id)
  );

drop policy if exists "Admins can delete members" on public.org_members;
create policy "Admins can delete members" on public.org_members
  for delete using (private.is_org_admin(organization_id));

drop policy if exists "Admins can insert members" on public.org_members;
drop policy if exists "Owners can join as first member" on public.org_members;
create policy "Members can be inserted by admins or first owner" on public.org_members
  for insert with check (
    private.is_org_admin(organization_id)
    or (
      role = 'owner'
      and user_id = auth.uid()
      and not exists (
        select 1 from public.org_members om
        where om.organization_id = org_members.organization_id
      )
    )
  );

drop policy if exists "Org members and owners can view" on public.organizations;
create policy "Org members and owners can view" on public.organizations
  for select using (
    owner_id = auth.uid()
    or private.is_org_member(id)
  );

drop policy if exists "Admins read feature flags" on public.feature_flags;
create policy "Admins read feature flags"
  on public.feature_flags for select
  using (private.is_platform_admin());

drop policy if exists "Accepted members can view team" on public.website_generation_members;
drop policy if exists "Invitees can view pending invitations" on public.website_generation_members;
drop policy if exists "Members can view own membership" on public.website_generation_members;
create policy "Collaborators and invitees can view membership"
  on public.website_generation_members for select
  using (
    auth.uid() = user_id
    or private.is_website_generation_member(generation_id, auth.uid())
    or (
      status = 'pending'
      and email is not null
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "Members can view shared website generations" on public.website_generations;
create policy "Members can view shared website generations"
  on public.website_generations for select
  using (private.is_website_generation_member(id, auth.uid()));

do $$
begin
  if to_regprocedure('private.can_edit_website_generation(uuid,uuid)') is not null then
    execute 'drop policy if exists "Editors can update shared website generations" on public.website_generations';
    execute $p$
      create policy "Editors can update shared website generations"
        on public.website_generations for update
        using (private.can_edit_website_generation(id, auth.uid()))
    $p$;
  end if;
end $$;

drop function if exists public.is_org_member(uuid);
drop function if exists public.is_org_admin(uuid);
drop function if exists public.is_org_owner(uuid);
drop function if exists public.is_platform_admin();
drop function if exists public.is_website_generation_member(uuid, uuid);
drop function if exists public.can_edit_website_generation(uuid, uuid);

-- ---------------------------------------------------------------------------
-- 3. Remove duplicate agent policies (026 superseded 069)
-- ---------------------------------------------------------------------------

drop policy if exists "Users can view own agents and templates" on public.agents;
drop policy if exists "Users insert own agents" on public.agents;
drop policy if exists "Users update own agents" on public.agents;
drop policy if exists "Users delete own agents" on public.agents;

-- ---------------------------------------------------------------------------
-- 4. Consolidate website_publications SELECT policies
-- ---------------------------------------------------------------------------

drop policy if exists "Anyone can view published website publications" on public.website_publications;
drop policy if exists "Users can view own website publications" on public.website_publications;
create policy "Users can view published or own website publications"
  on public.website_publications for select
  using (
    status = 'published'
    or auth.uid() = user_id
  );

-- ---------------------------------------------------------------------------
-- 5. Split marketplace_creators FOR ALL to avoid duplicate SELECT policies
-- ---------------------------------------------------------------------------

drop policy if exists "Users manage own creator profile" on public.marketplace_creators;
create policy "Users insert own creator profile"
  on public.marketplace_creators for insert
  with check (auth.uid() = user_id);
create policy "Users update own creator profile"
  on public.marketplace_creators for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own creator profile"
  on public.marketplace_creators for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6. Public buckets: remove listing policies (direct URLs still work)
-- ---------------------------------------------------------------------------

drop policy if exists "Public read website assets" on storage.objects;
drop policy if exists "Public read ai assets" on storage.objects;
drop policy if exists "Avatar images are publicly accessible" on storage.objects;

-- ---------------------------------------------------------------------------
-- 7. Consolidate storage.objects policies (per action, per role)
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read own brand assets storage" on storage.objects;
drop policy if exists "Users can read own generation files" on storage.objects;
drop policy if exists "Users can read own video studio media" on storage.objects;
drop policy if exists "Users read own design studio files" on storage.objects;
create policy "Users read own storage objects"
  on storage.objects for select
  using (
    (bucket_id = 'brand-assets' and auth.uid()::text = (storage.foldername(name))[1])
    or (bucket_id = 'generation-uploads' and auth.uid()::text = (storage.foldername(name))[1])
    or (bucket_id = 'video-studio' and auth.uid()::text = (storage.foldername(name))[1])
    or (bucket_id = 'design-studio' and auth.uid()::text = (storage.foldername(name))[1])
    or (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
    or (bucket_id in ('website-assets', 'ai-assets') and (storage.foldername(name))[1] = auth.uid()::text)
  );

drop policy if exists "Users can upload generation files" on storage.objects;
drop policy if exists "Users can upload own avatar" on storage.objects;
drop policy if exists "Users can upload own brand assets storage" on storage.objects;
drop policy if exists "Users can upload own video studio media" on storage.objects;
drop policy if exists "Users upload own design studio files" on storage.objects;
drop policy if exists "Users insert own website assets" on storage.objects;
drop policy if exists "Users insert own ai assets" on storage.objects;
create policy "Users insert own storage objects"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated'
    and (
      (bucket_id = 'brand-assets' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'generation-uploads' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'video-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'design-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id in ('website-assets', 'ai-assets') and (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Users can update own brand assets storage" on storage.objects;
drop policy if exists "Users can update own generation files" on storage.objects;
drop policy if exists "Users can update own video studio media" on storage.objects;
drop policy if exists "Users update own design studio files" on storage.objects;
drop policy if exists "Users update own website assets" on storage.objects;
drop policy if exists "Users update own ai assets" on storage.objects;
create policy "Users update own storage objects"
  on storage.objects for update
  using (
    auth.role() = 'authenticated'
    and (
      (bucket_id = 'brand-assets' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'generation-uploads' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'video-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'design-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id in ('website-assets', 'ai-assets') and (storage.foldername(name))[1] = auth.uid()::text)
    )
  )
  with check (
    auth.role() = 'authenticated'
    and (
      (bucket_id = 'brand-assets' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'generation-uploads' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'video-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'design-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id in ('website-assets', 'ai-assets') and (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
drop policy if exists "Users can delete own brand assets storage" on storage.objects;
drop policy if exists "Users can delete own generation files" on storage.objects;
drop policy if exists "Users can delete own video studio media" on storage.objects;
drop policy if exists "Users delete own design studio files" on storage.objects;
drop policy if exists "Users delete own website assets" on storage.objects;
drop policy if exists "Users delete own ai assets" on storage.objects;
create policy "Users delete own storage objects"
  on storage.objects for delete
  using (
    auth.role() = 'authenticated'
    and (
      (bucket_id = 'brand-assets' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'generation-uploads' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'video-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'design-studio' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
      or (bucket_id in ('website-assets', 'ai-assets') and (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

-- ---------------------------------------------------------------------------
-- 8. Default privileges: do not auto-grant EXECUTE to anon on new public funcs
-- ---------------------------------------------------------------------------

alter default privileges in schema public
  revoke execute on functions from anon;

-- Intentional public SECURITY DEFINER RPCs (billing/growth) keep explicit grants in 083/084.
