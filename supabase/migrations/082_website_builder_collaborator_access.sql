-- Migration 082: Collaborator read/update access on website_generations

create or replace function public.can_edit_website_generation(
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

revoke all on function public.can_edit_website_generation(uuid, uuid) from public;
grant execute on function public.can_edit_website_generation(uuid, uuid) to authenticated;

drop policy if exists "Members can view shared website generations"
  on public.website_generations;
create policy "Members can view shared website generations"
  on public.website_generations for select
  using (public.is_website_generation_member(id, auth.uid()));

drop policy if exists "Editors can update shared website generations"
  on public.website_generations;
create policy "Editors can update shared website generations"
  on public.website_generations for update
  using (public.can_edit_website_generation(id, auth.uid()));

comment on function public.can_edit_website_generation is
  'Accepted editor/owner members may update shared website generations (RLS).';
