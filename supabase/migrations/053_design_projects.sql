-- Design Studio projects
create table if not exists public.design_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_design_projects_user on public.design_projects(user_id);

alter table public.design_projects enable row level security;

drop policy if exists "Users manage own design projects" on public.design_projects;
create policy "Users manage own design projects"
  on public.design_projects for all using (auth.uid() = user_id);

-- Design Studio storage bucket
insert into storage.buckets (id, name, public)
values ('design-studio', 'design-studio', true)
on conflict (id) do nothing;

drop policy if exists "Users read own design studio files" on storage.objects;
create policy "Users read own design studio files"
  on storage.objects for select
  using (
    bucket_id = 'design-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users upload own design studio files" on storage.objects;
create policy "Users upload own design studio files"
  on storage.objects for insert
  with check (
    bucket_id = 'design-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own design studio files" on storage.objects;
create policy "Users update own design studio files"
  on storage.objects for update
  using (
    bucket_id = 'design-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own design studio files" on storage.objects;
create policy "Users delete own design studio files"
  on storage.objects for delete
  using (
    bucket_id = 'design-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
