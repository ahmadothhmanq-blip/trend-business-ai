-- Migration 084: Revoke anon EXECUTE on SECURITY DEFINER functions
-- Supabase default grants restore anon/authenticated EXECUTE on CREATE OR REPLACE.

revoke execute on function public.consume_credits(uuid, integer, text, text) from anon;
revoke execute on function public.is_org_member(uuid) from anon;
revoke execute on function public.is_org_admin(uuid) from anon;
revoke execute on function public.is_org_owner(uuid) from anon;
revoke execute on function public.claim_platform_growth_leads(integer) from anon;
revoke execute on function public.is_website_generation_member(uuid, uuid) from anon;
revoke execute on function public.is_platform_admin() from anon;

revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

do $$
begin
  if to_regprocedure('public.can_edit_website_generation(uuid,uuid)') is not null then
    execute 'revoke execute on function public.can_edit_website_generation(uuid, uuid) from anon';
  end if;
end $$;
