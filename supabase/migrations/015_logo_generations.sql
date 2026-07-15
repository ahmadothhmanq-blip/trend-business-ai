-- Logo Designer generations
create table if not exists logo_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  logo_name text not null,
  logo_style text not null,
  description text not null default '',
  industry text not null default '',
  color_palette text not null default 'Auto',
  icon_style text not null default 'Abstract',
  options text[] not null default '{}',
  prompt text not null default '',

  -- Generated output (JSONB blob containing full project)
  blueprint jsonb,

  -- Generation metadata
  status text not null default 'completed' check (status in ('pending', 'generating', 'completed', 'failed')),
  mode text not null default 'generate' check (mode in ('generate', 'regenerate', 'continue', 'retry')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references logo_generations(id) on delete set null,
  project_id uuid,

  -- User interaction
  is_favorite boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table logo_generations enable row level security;

create policy "Users can view own logo generations"
  on logo_generations for select using (auth.uid() = user_id);

create policy "Users can insert own logo generations"
  on logo_generations for insert with check (auth.uid() = user_id);

create policy "Users can update own logo generations"
  on logo_generations for update using (auth.uid() = user_id);

create policy "Users can delete own logo generations"
  on logo_generations for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_logo_generations_user on logo_generations(user_id);
create index if not exists idx_logo_generations_created on logo_generations(created_at desc);
create index if not exists idx_logo_generations_status on logo_generations(status);
