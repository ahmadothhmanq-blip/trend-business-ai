-- Phase 3 — Website Copilot idempotency TTL

alter table public.website_commit_idempotency
  add column if not exists expires_at timestamptz;

update public.website_commit_idempotency
  set expires_at = created_at + interval '7 days'
  where expires_at is null;

alter table public.website_commit_idempotency
  alter column expires_at set default (now() + interval '7 days');

alter table public.website_commit_idempotency
  alter column expires_at set not null;

create index if not exists idx_website_commit_idempotency_expires
  on public.website_commit_idempotency (expires_at);

comment on column public.website_commit_idempotency.expires_at is
  'Expiry for idempotent replay cache (Phase 3 — 7 day TTL).';
