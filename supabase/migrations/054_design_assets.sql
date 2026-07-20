-- Design Studio assets linked to image generations
create table if not exists public.design_assets (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.design_projects(id) on delete set null,
  generation_id uuid not null references public.image_generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  format text not null default 'png',
  mime_type text not null default 'image/png',
  width integer,
  height integer,
  storage_path text,
  public_url text,
  provider text,
  metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_design_assets_generation on public.design_assets(generation_id);
create index if not exists idx_design_assets_user on public.design_assets(user_id);
create index if not exists idx_design_assets_project on public.design_assets(project_id);

alter table public.design_assets enable row level security;

drop policy if exists "Users manage own design assets" on public.design_assets;
create policy "Users manage own design assets"
  on public.design_assets for all using (auth.uid() = user_id);
