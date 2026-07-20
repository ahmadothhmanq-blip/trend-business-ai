-- Brand kits — persisted brand identity packages
create table if not exists public.brand_kits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references public.brand_identity_generations(id) on delete cascade,
  name text not null,
  version integer not null default 1,
  model jsonb not null default '{}'::jsonb,
  tokens jsonb not null default '{}'::jsonb,
  share_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_brand_kits_user on public.brand_kits(user_id);
create index if not exists idx_brand_kits_generation on public.brand_kits(generation_id);
create index if not exists idx_brand_kits_share on public.brand_kits(share_token);

alter table public.brand_kits enable row level security;

drop policy if exists "Users manage own brand kits" on public.brand_kits;
create policy "Users manage own brand kits"
  on public.brand_kits for all using (auth.uid() = user_id);

-- Version history
create table if not exists public.brand_kit_versions (
  id uuid default gen_random_uuid() primary key,
  kit_id uuid not null references public.brand_kits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references public.brand_identity_generations(id) on delete cascade,
  version integer not null,
  model jsonb not null default '{}'::jsonb,
  change_summary text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_kit_versions_kit on public.brand_kit_versions(kit_id, version desc);

alter table public.brand_kit_versions enable row level security;

drop policy if exists "Users manage own brand kit versions" on public.brand_kit_versions;
create policy "Users manage own brand kit versions"
  on public.brand_kit_versions for all using (auth.uid() = user_id);

-- Storage bucket for brand assets
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own brand assets storage" on storage.objects;
create policy "Users can read own brand assets storage"
  on storage.objects for select
  using (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload own brand assets storage" on storage.objects;
create policy "Users can upload own brand assets storage"
  on storage.objects for insert
  with check (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own brand assets storage" on storage.objects;
create policy "Users can update own brand assets storage"
  on storage.objects for update
  using (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own brand assets storage" on storage.objects;
create policy "Users can delete own brand assets storage"
  on storage.objects for delete
  using (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
