-- Video Studio: allow users to update own video_media rows (revisions, meta).
drop policy if exists "Users can update own video media" on public.video_media;
create policy "Users can update own video media"
  on public.video_media for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
