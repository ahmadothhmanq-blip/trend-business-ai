-- Design generation versions (tracks ImageDesignModel per image_generations row)
create table if not exists public.design_generations (
  id uuid default gen_random_uuid() primary key,
  image_generation_id uuid not null references public.image_generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.design_projects(id) on delete set null,
  model jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  provider text,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_design_generations_image on public.design_generations(image_generation_id, version desc);
create index if not exists idx_design_generations_user on public.design_generations(user_id);

alter table public.design_generations enable row level security;

drop policy if exists "Users manage own design generations" on public.design_generations;
create policy "Users manage own design generations"
  on public.design_generations for all using (auth.uid() = user_id);

create unique index if not exists idx_design_generations_version
  on public.design_generations(image_generation_id, version);

-- Favorites support for image generations
alter table public.favorites drop constraint if exists favorites_item_type_check;
alter table public.favorites add constraint favorites_item_type_check
  check (
    item_type in (
      'business_idea',
      'market_analysis',
      'report',
      'website_generation',
      'workspace_generation',
      'brand_identity_generation',
      'logo_generation',
      'image_generation'
    )
  );
