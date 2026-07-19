-- AI Real Images Engine
-- generated_images, image_prompts, image_assets

create table if not exists public.image_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  website_generation_id uuid references public.website_generations (id) on delete set null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  role text not null,
  kind text not null default 'realistic',
  prompt text not null,
  negative_prompt text,
  style text,
  aspect_ratio text,
  quality text,
  source text not null default 'engine',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  prompt_id uuid references public.image_prompts (id) on delete set null,
  website_generation_id uuid references public.website_generations (id) on delete set null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  provider text not null,
  model text,
  status text not null default 'pending',
  mime_type text,
  width integer,
  height integer,
  storage_bucket text,
  storage_path text,
  public_url text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.image_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  generated_image_id uuid references public.generated_images (id) on delete cascade,
  prompt_id uuid references public.image_prompts (id) on delete set null,
  website_generation_id uuid references public.website_generations (id) on delete set null,
  ai_run_id uuid references public.ai_runs (id) on delete set null,
  asset_key text not null,
  role text not null,
  name text not null,
  alt text,
  public_url text,
  storage_path text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists image_prompts_user_idx on public.image_prompts (user_id, created_at desc);
create index if not exists generated_images_user_idx on public.generated_images (user_id, created_at desc);
create index if not exists generated_images_provider_idx on public.generated_images (provider, status);
create index if not exists image_assets_website_idx on public.image_assets (website_generation_id);
create index if not exists image_assets_user_idx on public.image_assets (user_id, created_at desc);

alter table public.image_prompts enable row level security;
alter table public.generated_images enable row level security;
alter table public.image_assets enable row level security;

drop policy if exists "image_prompts_owner_select" on public.image_prompts;
create policy "image_prompts_owner_select"
  on public.image_prompts for select
  using (auth.uid() = user_id);

drop policy if exists "image_prompts_owner_insert" on public.image_prompts;
create policy "image_prompts_owner_insert"
  on public.image_prompts for insert
  with check (auth.uid() = user_id);

drop policy if exists "generated_images_owner_select" on public.generated_images;
create policy "generated_images_owner_select"
  on public.generated_images for select
  using (auth.uid() = user_id);

drop policy if exists "generated_images_owner_insert" on public.generated_images;
create policy "generated_images_owner_insert"
  on public.generated_images for insert
  with check (auth.uid() = user_id);

drop policy if exists "image_assets_owner_select" on public.image_assets;
create policy "image_assets_owner_select"
  on public.image_assets for select
  using (auth.uid() = user_id);

drop policy if exists "image_assets_owner_insert" on public.image_assets;
create policy "image_assets_owner_insert"
  on public.image_assets for insert
  with check (auth.uid() = user_id);
