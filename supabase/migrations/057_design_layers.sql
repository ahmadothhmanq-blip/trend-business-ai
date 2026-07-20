-- Design Studio layers + asset library columns
create table if not exists public.design_layers (
  id uuid default gen_random_uuid() primary key,
  canvas_id uuid not null references public.design_canvas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  layer_type text not null default 'group',
  z_index integer not null default 0,
  visible boolean not null default true,
  locked boolean not null default false,
  element jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_design_layers_canvas on public.design_layers(canvas_id, z_index);
create index if not exists idx_design_layers_user on public.design_layers(user_id);

alter table public.design_layers enable row level security;

drop policy if exists "Users manage own design layers" on public.design_layers;
create policy "Users manage own design layers"
  on public.design_layers for all using (auth.uid() = user_id);

-- Asset library folders, tags, favorites
alter table public.design_assets add column if not exists folder text;
alter table public.design_assets add column if not exists tags text[] not null default '{}';
alter table public.design_assets add column if not exists is_favorite boolean not null default false;
alter table public.design_assets add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_design_assets_folder on public.design_assets(user_id, folder);
create index if not exists idx_design_assets_tags on public.design_assets using gin(tags);
create index if not exists idx_design_assets_favorite on public.design_assets(user_id, is_favorite);
