-- Migration 080: Fix website_generation_members RLS recursion (42P17)

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

revoke all on function public.is_website_generation_member(uuid, uuid) from public;
grant execute on function public.is_website_generation_member(uuid, uuid) to authenticated;

drop policy if exists "Accepted members can view team"
  on public.website_generation_members;
create policy "Accepted members can view team"
  on public.website_generation_members for select
  using (public.is_website_generation_member(generation_id, auth.uid()));

comment on function public.is_website_generation_member is
  'Security-definer membership check to avoid RLS recursion on website_generation_members.';
