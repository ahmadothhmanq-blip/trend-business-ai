-- Website Builder Design Engine: asset storage + blueprint layer docs
-- Layer artifacts (businessProfile, strategy, designSystem, assetManifest, qualityReport)
-- are stored inside website_generations.blueprint JSONB (no column break).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'website-assets',
  'website-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for published preview assets
drop policy if exists "Public read website assets" on storage.objects;
create policy "Public read website assets"
  on storage.objects for select
  using (bucket_id = 'website-assets');

-- Authenticated users can manage their own prefix: {user_id}/...
drop policy if exists "Users manage own website assets" on storage.objects;
create policy "Users manage own website assets"
  on storage.objects for all
  using (
    bucket_id = 'website-assets'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'website-assets'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

comment on table public.website_generations is
  'Website Builder generations. blueprint JSONB may include businessProfile, strategy, designSystem, assetManifest, qualityReport, and files[].';
