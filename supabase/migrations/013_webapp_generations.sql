-- Web App Builder generations (independent from website_generations)
create table if not exists webapp_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  app_name text not null,
  app_type text not null,
  description text not null default '',
  language text not null default 'English',
  design_style text not null default 'Modern',
  color_style text not null default 'Dark Minimal',
  features text[] not null default '{}',
  prompt text not null default '',

  -- Generated output (JSONB blob containing full project)
  blueprint jsonb,

  -- Generation metadata
  status text not null default 'completed' check (status in ('pending', 'generating', 'completed', 'failed')),
  mode text not null default 'generate' check (mode in ('generate', 'regenerate', 'continue', 'retry')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references webapp_generations(id) on delete set null,
  project_id uuid,
  product_id text,

  -- User interaction
  is_favorite boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table webapp_generations enable row level security;

create policy "Users can read own webapp generations"
  on webapp_generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own webapp generations"
  on webapp_generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own webapp generations"
  on webapp_generations for update
  using (auth.uid() = user_id);

create policy "Users can delete own webapp generations"
  on webapp_generations for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_webapp_generations_user on webapp_generations(user_id);
create index if not exists idx_webapp_generations_app_type on webapp_generations(app_type);
create index if not exists idx_webapp_generations_created on webapp_generations(created_at desc);
create index if not exists idx_webapp_generations_status on webapp_generations(status);
