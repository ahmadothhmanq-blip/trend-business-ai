-- AI Core Engine: shared generation ledger (Phase 0 foundation)
-- Products are not migrated yet; this table is ready for Phase 1+ adapters.

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  mode text not null default 'generate'
    check (mode in ('generate', 'regenerate', 'continue', 'retry')),
  parent_run_id uuid references public.ai_runs (id) on delete set null,
  brief jsonb not null default '{}'::jsonb,
  artifacts jsonb not null default '{}'::jsonb,
  layers_executed text[] not null default '{}',
  provider text,
  token_usage jsonb,
  generation_time_ms integer,
  error_message text,
  continue_instruction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_runs_user_product_created
  on public.ai_runs (user_id, product_id, created_at desc);

create index if not exists idx_ai_runs_parent
  on public.ai_runs (parent_run_id)
  where parent_run_id is not null;

create index if not exists idx_ai_runs_status
  on public.ai_runs (status);

alter table public.ai_runs enable row level security;

drop policy if exists "Users can view own ai runs" on public.ai_runs;
create policy "Users can view own ai runs"
  on public.ai_runs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai runs" on public.ai_runs;
create policy "Users can insert own ai runs"
  on public.ai_runs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own ai runs" on public.ai_runs;
create policy "Users can update own ai runs"
  on public.ai_runs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own ai runs" on public.ai_runs;
create policy "Users can delete own ai runs"
  on public.ai_runs for delete
  using (auth.uid() = user_id);

comment on table public.ai_runs is
  'AI Core Engine run ledger. artifacts JSONB holds businessProfile, strategy, designSystem, assetManifest, qualityReport, generationOutput.';

-- Shared asset bucket for future Core asset layer (Website keeps website-assets).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-assets',
  'ai-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read ai assets" on storage.objects;
create policy "Public read ai assets"
  on storage.objects for select
  using (bucket_id = 'ai-assets');

drop policy if exists "Users manage own ai assets" on storage.objects;
create policy "Users manage own ai assets"
  on storage.objects for all
  using (
    bucket_id = 'ai-assets'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'ai-assets'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
