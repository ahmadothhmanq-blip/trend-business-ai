-- Content Studio: content generations
create table if not exists public.content_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content_tool text not null default 'content-writer',
  content_type text not null default 'blog-post',
  description text not null default '',
  prompt text not null default '',
  tone text not null default 'Professional',
  audience text not null default 'General',
  language text not null default 'English',
  brand_voice text not null default '',
  writing_style text not null default 'Standard',
  creativity_level text not null default 'Balanced',
  options jsonb not null default '[]'::jsonb,
  seo_keywords text not null default '',
  blueprint jsonb,
  status text not null default 'pending' check (status in ('pending','generating','completed','failed')),
  mode text not null default 'generate' check (mode in ('generate','regenerate','rewrite','expand','shorten','translate','summarize')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references public.content_generations(id) on delete set null,
  project_id uuid,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_generations enable row level security;

create policy "Users can view own content generations"
  on public.content_generations for select using (auth.uid() = user_id);
create policy "Users can insert own content generations"
  on public.content_generations for insert with check (auth.uid() = user_id);
create policy "Users can update own content generations"
  on public.content_generations for update using (auth.uid() = user_id);
create policy "Users can delete own content generations"
  on public.content_generations for delete using (auth.uid() = user_id);

create index if not exists idx_content_generations_user_id on public.content_generations(user_id);
create index if not exists idx_content_generations_created_at on public.content_generations(created_at desc);
create index if not exists idx_content_generations_status on public.content_generations(status);
create index if not exists idx_content_generations_content_tool on public.content_generations(content_tool);
create index if not exists idx_content_generations_content_type on public.content_generations(content_type);
create index if not exists idx_content_generations_is_favorite on public.content_generations(is_favorite);

-- Content Calendar
create table if not exists public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content_type text not null default 'blog-post',
  description text not null default '',
  scheduled_date date not null default current_date,
  scheduled_time time,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  category text not null default 'General',
  tags jsonb not null default '[]'::jsonb,
  platform text not null default '',
  generation_id uuid references public.content_generations(id) on delete set null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_calendar enable row level security;

create policy "Users can view own calendar entries"
  on public.content_calendar for select using (auth.uid() = user_id);
create policy "Users can insert own calendar entries"
  on public.content_calendar for insert with check (auth.uid() = user_id);
create policy "Users can update own calendar entries"
  on public.content_calendar for update using (auth.uid() = user_id);
create policy "Users can delete own calendar entries"
  on public.content_calendar for delete using (auth.uid() = user_id);

create index if not exists idx_content_calendar_user_id on public.content_calendar(user_id);
create index if not exists idx_content_calendar_scheduled_date on public.content_calendar(scheduled_date);
create index if not exists idx_content_calendar_status on public.content_calendar(status);
