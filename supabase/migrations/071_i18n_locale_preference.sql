-- Migration 071: User locale preference for global i18n
alter table public.user_preferences
  add column if not exists locale text default 'en' not null;

comment on column public.user_preferences.locale is
  'BCP-47 style UI locale code (e.g. en, ar, zh-CN). Hebrew (he) is not supported.';
