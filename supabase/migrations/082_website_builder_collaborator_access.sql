-- Migration 082: Collaborator edit access on website_generations
-- Uses private helpers (085+) — SELECT consolidation is handled by 087.

create or replace function private.can_edit_website_generation(
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
      and m.role in ('editor', 'owner')
  );
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated, service_role;

drop policy if exists "Editors can update shared website generations"
  on public.website_generations;
create policy "Editors can update shared website generations"
  on public.website_generations for update
  using (private.can_edit_website_generation(id, auth.uid()));

comment on function private.can_edit_website_generation is
  'Accepted editor/owner members may update shared website generations (RLS).';
