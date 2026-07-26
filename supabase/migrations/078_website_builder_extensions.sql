-- Migration 078: Website Builder extensions (server backups, team members)

create table if not exists public.website_builder_snapshots (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.website_generations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Backup',
  blueprint jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_website_builder_snapshots_generation
  on public.website_builder_snapshots (generation_id, created_at desc);

alter table public.website_builder_snapshots enable row level security;

drop policy if exists "Owners manage website builder snapshots"
  on public.website_builder_snapshots;
create policy "Owners manage website builder snapshots"
  on public.website_builder_snapshots for all
  using (
    exists (
      select 1
      from public.website_generations wg
      where wg.id = website_builder_snapshots.generation_id
        and wg.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.website_generations wg
      where wg.id = website_builder_snapshots.generation_id
        and wg.user_id = auth.uid()
    )
  );

comment on table public.website_builder_snapshots is
  'Server-side blueprint backups from Website Builder (Phase 7 publishing).';

create table if not exists public.website_generation_members (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.website_generations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  email text,
  role text not null default 'editor'
    check (role in ('owner', 'editor', 'viewer')),
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint website_generation_members_email_or_user
    check (user_id is not null or (email is not null and length(trim(email)) > 0))
);

create unique index if not exists idx_website_generation_members_user
  on public.website_generation_members (generation_id, user_id)
  where user_id is not null;

create unique index if not exists idx_website_generation_members_email
  on public.website_generation_members (generation_id, lower(email))
  where email is not null;

create index if not exists idx_website_generation_members_generation
  on public.website_generation_members (generation_id);

alter table public.website_generation_members enable row level security;

drop policy if exists "Generation owners manage members"
  on public.website_generation_members;
create policy "Generation owners manage members"
  on public.website_generation_members for all
  using (
    exists (
      select 1
      from public.website_generations wg
      where wg.id = website_generation_members.generation_id
        and wg.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.website_generations wg
      where wg.id = website_generation_members.generation_id
        and wg.user_id = auth.uid()
    )
  );

drop policy if exists "Members can view own membership"
  on public.website_generation_members;
create policy "Members can view own membership"
  on public.website_generation_members for select
  using (auth.uid() = user_id);

comment on table public.website_generation_members is
  'Collaborators for Website Builder enterprise teams (Phase 8).';
