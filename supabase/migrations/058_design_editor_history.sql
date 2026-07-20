-- Design editor undo/redo history snapshots
create table if not exists public.design_editor_history (
  id uuid default gen_random_uuid() primary key,
  canvas_id uuid not null references public.design_canvas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  snapshot jsonb not null default '{}'::jsonb,
  cursor integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_design_editor_history_canvas
  on public.design_editor_history(canvas_id, created_at desc);
create index if not exists idx_design_editor_history_user on public.design_editor_history(user_id);

alter table public.design_editor_history enable row level security;

drop policy if exists "Users manage own editor history" on public.design_editor_history;
create policy "Users manage own editor history"
  on public.design_editor_history for all using (auth.uid() = user_id);
