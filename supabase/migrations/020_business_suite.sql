-- Business Suite generations table
create table if not exists public.business_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  business_tool text not null default 'business-plan',
  business_type text not null default 'startup',
  description text not null default '',
  prompt text not null default '',
  industry text not null default '',
  company_stage text not null default 'Startup',
  target_market text not null default '',
  options jsonb not null default '[]'::jsonb,
  blueprint jsonb,
  status text not null default 'pending' check (status in ('pending','generating','completed','failed')),
  mode text not null default 'generate' check (mode in ('generate','regenerate','update','expand')),
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  parent_generation_id uuid references public.business_generations(id) on delete set null,
  project_id uuid,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_generations enable row level security;

create policy "Users can view own business generations"
  on public.business_generations for select using (auth.uid() = user_id);
create policy "Users can insert own business generations"
  on public.business_generations for insert with check (auth.uid() = user_id);
create policy "Users can update own business generations"
  on public.business_generations for update using (auth.uid() = user_id);
create policy "Users can delete own business generations"
  on public.business_generations for delete using (auth.uid() = user_id);

create index if not exists idx_business_generations_user_id on public.business_generations(user_id);
create index if not exists idx_business_generations_created_at on public.business_generations(created_at desc);
create index if not exists idx_business_generations_status on public.business_generations(status);
create index if not exists idx_business_generations_business_tool on public.business_generations(business_tool);
create index if not exists idx_business_generations_is_favorite on public.business_generations(is_favorite);
