-- Migration 011: AI Engine Phase 5 — projects, generation metadata, attachments, prompt versions

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  product_id text,
  workspace_type text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on public.projects (user_id);
create index if not exists idx_projects_product on public.projects (user_id, product_id);
create index if not exists idx_projects_workspace on public.projects (user_id, workspace_type);

alter table public.projects enable row level security;

drop policy if exists "Users can view own projects" on public.projects;
create policy "Users can view own projects"
  on public.projects for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects"
  on public.projects for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Extend workspace generations with engine metadata
alter table public.workspace_generations
  add column if not exists project_id uuid references public.projects on delete set null,
  add column if not exists product_id text,
  add column if not exists status text not null default 'completed',
  add column if not exists mode text not null default 'generate',
  add column if not exists parent_generation_id uuid references public.workspace_generations on delete set null,
  add column if not exists provider text,
  add column if not exists token_usage jsonb not null default '{"promptTokens":0,"completionTokens":0,"totalTokens":0}'::jsonb,
  add column if not exists generation_time_ms integer,
  add column if not exists error_message text,
  add column if not exists prompt_versions jsonb not null default '[]'::jsonb,
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists draft_prompt text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'workspace_generations_status_check'
  ) then
    alter table public.workspace_generations
      add constraint workspace_generations_status_check
      check (status in ('pending', 'running', 'completed', 'failed'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'workspace_generations_mode_check'
  ) then
    alter table public.workspace_generations
      add constraint workspace_generations_mode_check
      check (mode in ('generate', 'regenerate', 'continue', 'retry'));
  end if;
end $$;

create index if not exists idx_workspace_generations_project
  on public.workspace_generations (project_id);

create index if not exists idx_workspace_generations_product
  on public.workspace_generations (user_id, product_id);

create index if not exists idx_workspace_generations_status
  on public.workspace_generations (user_id, status);

-- Extend website generations similarly
alter table public.website_generations
  add column if not exists project_id uuid references public.projects on delete set null,
  add column if not exists product_id text,
  add column if not exists status text not null default 'completed',
  add column if not exists mode text not null default 'generate',
  add column if not exists parent_generation_id uuid references public.website_generations on delete set null,
  add column if not exists provider text default 'deepseek',
  add column if not exists token_usage jsonb not null default '{"promptTokens":0,"completionTokens":0,"totalTokens":0}'::jsonb,
  add column if not exists generation_time_ms integer,
  add column if not exists error_message text,
  add column if not exists prompt_versions jsonb not null default '[]'::jsonb,
  add column if not exists attachments jsonb not null default '[]'::jsonb;

create index if not exists idx_website_generations_project
  on public.website_generations (project_id);

create index if not exists idx_website_generations_product
  on public.website_generations (user_id, product_id);

-- Generation attachments (files + images)
create table if not exists public.generation_attachments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  project_id uuid references public.projects on delete set null,
  generation_id uuid,
  generation_kind text not null default 'workspace'
    check (generation_kind in ('workspace', 'website', 'idea', 'report', 'market_analysis')),
  file_name text not null,
  file_type text not null,
  mime_type text,
  size_bytes integer,
  storage_path text not null,
  public_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_generation_attachments_user
  on public.generation_attachments (user_id);

create index if not exists idx_generation_attachments_generation
  on public.generation_attachments (generation_id);

alter table public.generation_attachments enable row level security;

drop policy if exists "Users can view own attachments" on public.generation_attachments;
create policy "Users can view own attachments"
  on public.generation_attachments for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own attachments" on public.generation_attachments;
create policy "Users can insert own attachments"
  on public.generation_attachments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own attachments" on public.generation_attachments;
create policy "Users can update own attachments"
  on public.generation_attachments for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own attachments" on public.generation_attachments;
create policy "Users can delete own attachments"
  on public.generation_attachments for delete using (auth.uid() = user_id);

-- Storage bucket for generation uploads
insert into storage.buckets (id, name, public)
values ('generation-uploads', 'generation-uploads', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload generation files" on storage.objects;
create policy "Users can upload generation files"
  on storage.objects for insert
  with check (
    bucket_id = 'generation-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read own generation files" on storage.objects;
create policy "Users can read own generation files"
  on storage.objects for select
  using (
    bucket_id = 'generation-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own generation files" on storage.objects;
create policy "Users can update own generation files"
  on storage.objects for update
  using (
    bucket_id = 'generation-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own generation files" on storage.objects;
create policy "Users can delete own generation files"
  on storage.objects for delete
  using (
    bucket_id = 'generation-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
