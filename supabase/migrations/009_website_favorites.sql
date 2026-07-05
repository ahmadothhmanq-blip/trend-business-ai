-- Migration 009: Website blueprint favorites
alter table public.website_generations
  add column if not exists is_favorite boolean default false not null;

create index if not exists idx_website_generations_user_favorite
  on public.website_generations (user_id, is_favorite);

drop policy if exists "Users can update own website generations" on public.website_generations;
create policy "Users can update own website generations"
  on public.website_generations for update using (auth.uid() = user_id);

alter table public.favorites
  drop constraint if exists favorites_item_type_check;

alter table public.favorites
  add constraint favorites_item_type_check
  check (item_type in ('business_idea', 'market_analysis', 'report', 'website_generation'));
