-- Content Studio production constraint fixes

-- Favorites: allow content_generation item type
alter table public.favorites drop constraint if exists favorites_item_type_check;
alter table public.favorites add constraint favorites_item_type_check
  check (
    item_type in (
      'business_idea',
      'market_analysis',
      'report',
      'website_generation',
      'workspace_generation',
      'brand_identity_generation',
      'logo_generation',
      'image_generation',
      'content_generation'
    )
  );

-- content_generations.mode: allow continue (Improve with AI iteration)
alter table public.content_generations drop constraint if exists content_generations_mode_check;
alter table public.content_generations add constraint content_generations_mode_check
  check (
    mode in (
      'generate',
      'regenerate',
      'continue',
      'rewrite',
      'expand',
      'shorten',
      'translate',
      'summarize'
    )
  );
