-- Landing Page Builder generations (independent from website_generations)
create table if not exists landing_page_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  page_name text not null,
  page_type text not null,
  description text not null default '',
  language text not null default 'English',
  design_style text not null default 'Modern',
  color_style text not null default 'Dark Minimal',
  sections text[] not null default '{}',
  prompt text not null default '',

  -- Generated output
  blueprint jsonb,

  -- Generation metadata
  status text not null default 'completed' check (status in ('pending', 'generating', 'completed', 'failed')),
  mode text not null default 'generate' check (mode in ('generate', 'regenerate', 'continue', 'retry')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references landing_page_generations(id) on delete set null,
  project_id uuid,

  -- User interaction
  is_favorite boolean not null default false,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table landing_page_generations enable row level security;

create policy "Users can read own landing page generations"
  on landing_page_generations for select using (auth.uid() = user_id);

create policy "Users can insert own landing page generations"
  on landing_page_generations for insert with check (auth.uid() = user_id);

create policy "Users can update own landing page generations"
  on landing_page_generations for update using (auth.uid() = user_id);

create policy "Users can delete own landing page generations"
  on landing_page_generations for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_lp_generations_user on landing_page_generations(user_id);
create index if not exists idx_lp_generations_type on landing_page_generations(page_type);
create index if not exists idx_lp_generations_created on landing_page_generations(created_at desc);
create index if not exists idx_lp_generations_status on landing_page_generations(status);
