-- ============================================================
-- Phase 19 — Performance indexes for list/filter hot paths
-- Safe to run after platform migrations 008–025.
-- ============================================================

do $$
begin
  if to_regclass('public.website_generations') is not null then
    create index if not exists idx_website_generations_user_created
      on public.website_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.webapp_generations') is not null then
    create index if not exists idx_webapp_generations_user_created
      on public.webapp_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.landing_page_generations') is not null then
    create index if not exists idx_landing_page_generations_user_created
      on public.landing_page_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.logo_generations') is not null then
    create index if not exists idx_logo_generations_user_created
      on public.logo_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.brand_identity_generations') is not null then
    create index if not exists idx_brand_identity_generations_user_created
      on public.brand_identity_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.image_generations') is not null then
    create index if not exists idx_image_generations_user_created
      on public.image_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.video_generations') is not null then
    create index if not exists idx_video_generations_user_created
      on public.video_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.content_generations') is not null then
    create index if not exists idx_content_generations_user_created
      on public.content_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.business_generations') is not null then
    create index if not exists idx_business_generations_user_created
      on public.business_generations (user_id, created_at desc);
  end if;

  if to_regclass('public.workspace_generations') is not null then
    create index if not exists idx_workspace_generations_user_type_created
      on public.workspace_generations (user_id, workspace_type, created_at desc);
  end if;

  if to_regclass('public.agent_executions') is not null then
    create index if not exists idx_agent_executions_user_created
      on public.agent_executions (user_id, created_at desc);
    create index if not exists idx_agent_executions_user_status_created
      on public.agent_executions (user_id, status, created_at desc);
  end if;

  if to_regclass('public.business_ideas') is not null then
    create index if not exists idx_business_ideas_user_created
      on public.business_ideas (user_id, created_at desc);
  end if;

  if to_regclass('public.market_analyses') is not null then
    create index if not exists idx_market_analyses_user_created
      on public.market_analyses (user_id, created_at desc);
  end if;

  if to_regclass('public.reports') is not null then
    create index if not exists idx_reports_user_created
      on public.reports (user_id, created_at desc);
  end if;

  if to_regclass('public.notifications') is not null then
    create index if not exists idx_notifications_user_created
      on public.notifications (user_id, created_at desc);
    create index if not exists idx_notifications_user_unread
      on public.notifications (user_id, is_read, created_at desc);
  end if;

  if to_regclass('public.usage_records') is not null then
    create index if not exists idx_usage_records_user_period
      on public.usage_records (user_id, period_start desc);
  end if;

  if to_regclass('public.billing_subscriptions') is not null then
    create index if not exists idx_billing_subscriptions_user_status
      on public.billing_subscriptions (user_id, status, created_at desc);
  end if;

  if to_regclass('public.billing_checkout_sessions') is not null then
    create index if not exists idx_billing_checkout_provider_order
      on public.billing_checkout_sessions (provider_order_id);
  end if;
end $$;
