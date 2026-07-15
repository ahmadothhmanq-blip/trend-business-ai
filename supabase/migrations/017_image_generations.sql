-- Image Generator generations
create table if not exists image_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  image_name text not null,
  image_type text not null,
  description text not null default '',
  style text not null default 'Photorealistic',
  aspect_ratio text not null default '1:1',
  mood text not null default 'Professional',
  options text[] not null default '{}',
  prompt text not null default '',

  -- Generated output (JSONB blob containing concepts/files)
  blueprint jsonb,

  -- Generation metadata
  status text not null default 'completed' check (status in ('pending', 'generating', 'completed', 'failed')),
  mode text not null default 'generate' check (mode in ('generate', 'regenerate', 'continue', 'retry')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references image_generations(id) on delete set null,
  project_id uuid,

  -- User interaction
  is_favorite boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table image_generations enable row level security;

create policy "Users can view own image generations"
  on image_generations for select using (auth.uid() = user_id);

create policy "Users can insert own image generations"
  on image_generations for insert with check (auth.uid() = user_id);

create policy "Users can update own image generations"
  on image_generations for update using (auth.uid() = user_id);

create policy "Users can delete own image generations"
  on image_generations for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_image_generations_user on image_generations(user_id);
create index if not exists idx_image_generations_created on image_generations(created_at desc);
create index if not exists idx_image_generations_status on image_generations(status);
