-- Video Studio real media + render jobs (not JSONB blobs)
insert into storage.buckets (id, name, public)
values ('video-studio', 'video-studio', false)
on conflict (id) do nothing;

drop policy if exists "Users can read own video studio media" on storage.objects;
create policy "Users can read own video studio media"
  on storage.objects for select
  using (
    bucket_id = 'video-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload own video studio media" on storage.objects;
create policy "Users can upload own video studio media"
  on storage.objects for insert
  with check (
    bucket_id = 'video-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own video studio media" on storage.objects;
create policy "Users can update own video studio media"
  on storage.objects for update
  using (
    bucket_id = 'video-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own video studio media" on storage.objects;
create policy "Users can delete own video studio media"
  on storage.objects for delete
  using (
    bucket_id = 'video-studio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create table if not exists public.video_media (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid references public.video_generations(id) on delete set null,
  kind text not null,
  mime_type text not null,
  storage_path text not null,
  public_url text,
  size_bytes bigint not null default 0,
  duration_sec numeric,
  provider text not null default 'preview',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.video_media enable row level security;

drop policy if exists "Users can view own video media" on public.video_media;
create policy "Users can view own video media"
  on public.video_media for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own video media" on public.video_media;
create policy "Users can insert own video media"
  on public.video_media for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own video media" on public.video_media;
create policy "Users can delete own video media"
  on public.video_media for delete using (auth.uid() = user_id);

create index if not exists idx_video_media_user on public.video_media(user_id);
create index if not exists idx_video_media_generation on public.video_media(generation_id);

create table if not exists public.video_render_jobs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid references public.video_generations(id) on delete cascade,
  status text not null default 'queued',
  provider text not null default 'preview',
  mode text not null default 'full',
  progress integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.video_render_jobs enable row level security;

drop policy if exists "Users can view own render jobs" on public.video_render_jobs;
create policy "Users can view own render jobs"
  on public.video_render_jobs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own render jobs" on public.video_render_jobs;
create policy "Users can insert own render jobs"
  on public.video_render_jobs for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own render jobs" on public.video_render_jobs;
create policy "Users can update own render jobs"
  on public.video_render_jobs for update using (auth.uid() = user_id);

create index if not exists idx_video_render_jobs_user on public.video_render_jobs(user_id);
create index if not exists idx_video_render_jobs_generation on public.video_render_jobs(generation_id);
create index if not exists idx_video_render_jobs_status on public.video_render_jobs(status);
