-- Video Studio generations table
create table if not exists public.video_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_name text not null default '',
  video_type text not null default 'text-to-video',
  description text not null default '',
  style text not null default 'Cinematic',
  aspect_ratio text not null default '16:9',
  duration text not null default '5s',
  options jsonb not null default '[]'::jsonb,
  prompt text not null default '',
  blueprint jsonb,
  status text not null default 'pending' check (status in ('pending','generating','completed','failed')),
  mode text not null default 'generate' check (mode in ('generate','regenerate','continue','retry')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references public.video_generations(id) on delete set null,
  project_id uuid,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.video_generations enable row level security;

create policy "Users can view own video generations"
  on public.video_generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own video generations"
  on public.video_generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own video generations"
  on public.video_generations for update
  using (auth.uid() = user_id);

create policy "Users can delete own video generations"
  on public.video_generations for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_video_generations_user_id on public.video_generations(user_id);
create index if not exists idx_video_generations_created_at on public.video_generations(created_at desc);
create index if not exists idx_video_generations_status on public.video_generations(status);
create index if not exists idx_video_generations_is_favorite on public.video_generations(is_favorite);
