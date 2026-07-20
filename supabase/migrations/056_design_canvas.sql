-- Design Studio canvas documents
create table if not exists public.design_canvas (
  id uuid default gen_random_uuid() primary key,
  image_generation_id uuid not null references public.image_generations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  width integer not null default 1080,
  height integer not null default 1080,
  document jsonb not null default '{}'::jsonb,
  brand_kit_id uuid references public.brand_identity_generations(id) on delete set null,
  template_id text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_design_canvas_generation
  on public.design_canvas(image_generation_id);
create index if not exists idx_design_canvas_user on public.design_canvas(user_id);

alter table public.design_canvas enable row level security;

drop policy if exists "Users manage own design canvas" on public.design_canvas;
create policy "Users manage own design canvas"
  on public.design_canvas for all using (auth.uid() = user_id);
