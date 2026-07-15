-- AI Provider Settings (per user)
create table if not exists ai_provider_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Active default provider
  default_provider text not null default 'deepseek',

  -- Global generation settings
  auto_fallback boolean not null default true,
  retry_count integer not null default 3 check (retry_count between 0 and 10),
  temperature numeric(3,2) not null default 0.70 check (temperature between 0.00 and 2.00),
  max_tokens integer not null default 4096 check (max_tokens between 256 and 128000),
  timeout_seconds integer not null default 120 check (timeout_seconds between 10 and 600),

  -- Per-provider configuration (JSONB array)
  providers jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_provider_settings_user_unique unique (user_id)
);

-- RLS
alter table ai_provider_settings enable row level security;

create policy "Users can read own AI provider settings"
  on ai_provider_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own AI provider settings"
  on ai_provider_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own AI provider settings"
  on ai_provider_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete own AI provider settings"
  on ai_provider_settings for delete
  using (auth.uid() = user_id);

-- Index
create index if not exists idx_ai_provider_settings_user on ai_provider_settings(user_id);
