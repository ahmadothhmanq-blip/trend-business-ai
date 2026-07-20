-- Brand Studio constraints and favorites support
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
      'logo_generation'
    )
  );

-- Ensure brand_kits version is positive
alter table public.brand_kits
  drop constraint if exists brand_kits_version_positive;
alter table public.brand_kits
  add constraint brand_kits_version_positive check (version > 0);

-- Unique kit version per generation
create unique index if not exists idx_brand_kits_generation_version
  on public.brand_kits(generation_id, version);
