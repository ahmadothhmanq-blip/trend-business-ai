-- Migration 079: Website Builder collaboration (invitation lifecycle)

alter table public.website_generation_members
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  add column if not exists invitation_token text,
  add column if not exists expires_at timestamptz,
  add column if not exists accepted_at timestamptz;

create unique index if not exists idx_website_generation_members_token
  on public.website_generation_members (invitation_token)
  where invitation_token is not null;

create index if not exists idx_website_generation_members_pending_email
  on public.website_generation_members (lower(email), status)
  where status = 'pending';

-- Backfill: existing rows without user_id stay pending; linked users are accepted
update public.website_generation_members
set status = 'accepted', accepted_at = coalesce(accepted_at, created_at)
where user_id is not null and status = 'pending';

drop policy if exists "Invitees can view pending invitations"
  on public.website_generation_members;
create policy "Invitees can view pending invitations"
  on public.website_generation_members for select
  using (
    status = 'pending'
    and email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Accepted members can view team"
  on public.website_generation_members;
create policy "Accepted members can view team"
  on public.website_generation_members for select
  using (
    exists (
      select 1
      from public.website_generation_members mine
      where mine.generation_id = website_generation_members.generation_id
        and mine.user_id = auth.uid()
        and mine.status = 'accepted'
    )
  );

comment on column public.website_generation_members.status is
  'pending | accepted | revoked | expired';
