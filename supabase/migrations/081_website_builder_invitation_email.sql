-- Migration 081: Website Builder invitation email delivery tracking

alter table public.website_generation_members
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_message_id text,
  add column if not exists email_delivery_status text not null default 'pending'
    check (email_delivery_status in ('pending', 'sent', 'failed', 'skipped')),
  add column if not exists email_last_error text,
  add column if not exists email_resend_count integer not null default 0;

comment on column public.website_generation_members.email_delivery_status is
  'Transactional invite email status: pending | sent | failed | skipped';
