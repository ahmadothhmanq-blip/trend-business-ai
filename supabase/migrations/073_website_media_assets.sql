-- Website Builder: media library + CMS blog fields

create table if not exists public.website_media_assets (
  id uuid default gen_random_uuid() primary key,
  generation_id uuid references public.website_generations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  folder text not null default 'uploads',
  filename text not null,
  url text not null,
  mime text not null,
  size bigint not null default 0,
  alt text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_website_media_generation
  on public.website_media_assets (generation_id, folder, updated_at desc);

alter table public.website_media_assets enable row level security;

drop policy if exists "Owners manage website media assets" on public.website_media_assets;
create policy "Owners manage website media assets"
  on public.website_media_assets for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.website_cms_entries
  add column if not exists slug text,
  add column if not exists categories text[] default '{}',
  add column if not exists tags text[] default '{}',
  add column if not exists seo_json jsonb default '{}'::jsonb;

create index if not exists idx_website_cms_slug
  on public.website_cms_entries (generation_id, slug);
