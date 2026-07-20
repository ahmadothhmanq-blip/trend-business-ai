-- Brand assets linked to kits and generations
create table if not exists public.brand_assets (
  id uuid default gen_random_uuid() primary key,
  kit_id uuid not null references public.brand_kits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references public.brand_identity_generations(id) on delete cascade,
  asset_type text not null,
  name text not null,
  format text not null default 'svg',
  storage_path text,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_assets_kit on public.brand_assets(kit_id);
create index if not exists idx_brand_assets_generation on public.brand_assets(generation_id);
create index if not exists idx_brand_assets_type on public.brand_assets(asset_type);

alter table public.brand_assets enable row level security;

drop policy if exists "Users manage own brand assets" on public.brand_assets;
create policy "Users manage own brand assets"
  on public.brand_assets for all using (auth.uid() = user_id);
