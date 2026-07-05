-- Migration 004: AI reports
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  report_type text not null,
  topic text not null,
  timeframe text not null,
  content text not null,
  insights text[] not null default '{}',
  is_favorite boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_reports_user_id on public.reports (user_id);
create index if not exists idx_reports_user_favorite on public.reports (user_id, is_favorite);
create index if not exists idx_reports_report_type on public.reports (report_type);
create index if not exists idx_reports_created_at on public.reports (created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users can view own reports" on public.reports;
create policy "Users can view own reports"
  on public.reports for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own reports" on public.reports;
create policy "Users can insert own reports"
  on public.reports for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own reports" on public.reports;
create policy "Users can update own reports"
  on public.reports for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own reports" on public.reports;
create policy "Users can delete own reports"
  on public.reports for delete using (auth.uid() = user_id);
