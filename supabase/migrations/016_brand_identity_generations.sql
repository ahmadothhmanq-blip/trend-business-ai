-- Brand Identity Builder generations
create table if not exists brand_identity_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  brand_name text not null,
  brand_type text not null,
  description text not null default '',
  industry text not null default '',
  target_audience text not null default '',
  brand_personality text not null default 'Professional',
  deliverables text[] not null default '{}',
  prompt text not null default '',

  -- Generated output (JSONB blob containing full project)
  blueprint jsonb,

  -- Generation metadata
  status text not null default 'completed' check (status in ('pending', 'generating', 'completed', 'failed')),
  mode text not null default 'generate' check (mode in ('generate', 'regenerate', 'continue', 'retry')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references brand_identity_generations(id) on delete set null,
  project_id uuid,

  -- User interaction
  is_favorite boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table brand_identity_generations enable row level security;

create policy "Users can view own brand identity generations"
  on brand_identity_generations for select using (auth.uid() = user_id);

create policy "Users can insert own brand identity generations"
  on brand_identity_generations for insert with check (auth.uid() = user_id);

create policy "Users can update own brand identity generations"
  on brand_identity_generations for update using (auth.uid() = user_id);

create policy "Users can delete own brand identity generations"
  on brand_identity_generations for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_brand_identity_generations_user on brand_identity_generations(user_id);
create index if not exists idx_brand_identity_generations_created on brand_identity_generations(created_at desc);
create index if not exists idx_brand_identity_generations_status on brand_identity_generations(status);
