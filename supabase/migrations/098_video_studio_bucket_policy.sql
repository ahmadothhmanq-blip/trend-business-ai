-- Video Studio private bucket upload policy (C5 production ops).
-- Keep bucket private; cap object size; restrict MIME types.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'video-studio',
  'video-studio',
  false,
  268435456,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'text/vtt'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
