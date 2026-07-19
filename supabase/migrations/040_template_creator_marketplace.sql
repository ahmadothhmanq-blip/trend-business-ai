-- Migration 040: Creator Template Marketplace
-- Schema prepared for listings, versions, favorites, payments, reviews, analytics.

create table if not exists public.marketplace_creators (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  display_name text not null,
  handle text not null unique,
  bio text default '' not null,
  avatar_url text,
  location text,
  website text,
  payout_ready boolean default false not null,
  stripe_connect_account_id text,
  follower_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_marketplace_creators_handle
  on public.marketplace_creators (handle);
create index if not exists idx_marketplace_creators_user
  on public.marketplace_creators (user_id);

create table if not exists public.marketplace_template_listings (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.marketplace_creators on delete cascade not null,
  slug text not null unique,
  title text not null,
  tagline text default '' not null,
  description text default '' not null,
  category text not null check (
    category in (
      'automotive',
      'restaurant',
      'saas',
      'real-estate',
      'healthcare',
      'ecommerce',
      'agency',
      'finance'
    )
  ),
  style text not null,
  status text not null default 'draft' check (
    status in ('draft', 'pending-review', 'published', 'archived')
  ),
  features jsonb default '[]'::jsonb not null,
  preview_gradient text,
  preview_image_url text,
  price_model text not null default 'free' check (
    price_model in ('free', 'paid', 'subscription')
  ),
  price_cents integer default 0 not null check (price_cents >= 0),
  currency text default 'USD' not null,
  creator_revenue_share_bps integer default 7000 not null,
  stripe_product_id text,
  stripe_price_id text,
  premium_template_id text not null,
  marketplace_template_id text not null,
  design_preset text not null,
  tags jsonb default '[]'::jsonb not null,
  average_rating numeric(3,2) default 0 not null,
  review_count integer default 0 not null,
  view_count integer default 0 not null,
  use_count integer default 0 not null,
  favorite_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_mtl_category on public.marketplace_template_listings (category);
create index if not exists idx_mtl_status on public.marketplace_template_listings (status);
create index if not exists idx_mtl_creator on public.marketplace_template_listings (creator_id);
create index if not exists idx_mtl_price on public.marketplace_template_listings (price_cents);

create table if not exists public.marketplace_template_versions (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.marketplace_template_listings on delete cascade not null,
  version text not null,
  changelog text default '' not null,
  premium_template_id text not null,
  marketplace_template_id text,
  is_latest boolean default false not null,
  created_at timestamptz default now() not null,
  unique (listing_id, version)
);

create index if not exists idx_mtv_listing
  on public.marketplace_template_versions (listing_id, is_latest);

create table if not exists public.marketplace_template_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  listing_id uuid references public.marketplace_template_listings on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, listing_id)
);

create index if not exists idx_mtf_user on public.marketplace_template_favorites (user_id);

-- Future: reviews
create table if not exists public.marketplace_template_reviews (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.marketplace_template_listings on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (listing_id, user_id)
);

-- Future: commerce purchases / revenue
create table if not exists public.marketplace_template_purchases (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.marketplace_template_listings on delete restrict not null,
  buyer_user_id uuid references auth.users on delete set null,
  creator_id uuid references public.marketplace_creators on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  creator_share_cents integer not null check (creator_share_cents >= 0),
  currency text default 'USD' not null,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (
    status in ('pending', 'completed', 'refunded', 'failed')
  ),
  created_at timestamptz default now() not null
);

-- Future: analytics events
create table if not exists public.marketplace_template_events (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.marketplace_template_listings on delete cascade,
  user_id uuid references auth.users on delete set null,
  event_type text not null check (
    event_type in ('view', 'preview', 'favorite', 'use', 'purchase', 'share')
  ),
  meta jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_mte_listing_type
  on public.marketplace_template_events (listing_id, event_type, created_at desc);

alter table public.marketplace_creators enable row level security;
alter table public.marketplace_template_listings enable row level security;
alter table public.marketplace_template_versions enable row level security;
alter table public.marketplace_template_favorites enable row level security;
alter table public.marketplace_template_reviews enable row level security;
alter table public.marketplace_template_purchases enable row level security;
alter table public.marketplace_template_events enable row level security;

-- Creators: public read, owner write
drop policy if exists "Public can view creators" on public.marketplace_creators;
create policy "Public can view creators"
  on public.marketplace_creators for select using (true);

drop policy if exists "Users manage own creator profile" on public.marketplace_creators;
create policy "Users manage own creator profile"
  on public.marketplace_creators for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Listings: published public; owners manage
drop policy if exists "Public can view published listings" on public.marketplace_template_listings;
create policy "Public can view published listings"
  on public.marketplace_template_listings for select using (
    status = 'published'
    or creator_id in (
      select id from public.marketplace_creators where user_id = auth.uid()
    )
  );

drop policy if exists "Creators manage own listings" on public.marketplace_template_listings;
create policy "Creators manage own listings"
  on public.marketplace_template_listings for all using (
    creator_id in (
      select id from public.marketplace_creators where user_id = auth.uid()
    )
  )
  with check (
    creator_id in (
      select id from public.marketplace_creators where user_id = auth.uid()
    )
  );

drop policy if exists "Public can view listing versions" on public.marketplace_template_versions;
create policy "Public can view listing versions"
  on public.marketplace_template_versions for select using (
    listing_id in (
      select id from public.marketplace_template_listings
      where status = 'published'
         or creator_id in (
           select id from public.marketplace_creators where user_id = auth.uid()
         )
    )
  );

drop policy if exists "Creators manage own versions" on public.marketplace_template_versions;
create policy "Creators manage own versions"
  on public.marketplace_template_versions for all using (
    listing_id in (
      select l.id from public.marketplace_template_listings l
      join public.marketplace_creators c on c.id = l.creator_id
      where c.user_id = auth.uid()
    )
  )
  with check (
    listing_id in (
      select l.id from public.marketplace_template_listings l
      join public.marketplace_creators c on c.id = l.creator_id
      where c.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own template favorites" on public.marketplace_template_favorites;
create policy "Users manage own template favorites"
  on public.marketplace_template_favorites for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Public can view reviews" on public.marketplace_template_reviews;
create policy "Public can view reviews"
  on public.marketplace_template_reviews for select using (true);

drop policy if exists "Users manage own reviews" on public.marketplace_template_reviews;
create policy "Users manage own reviews"
  on public.marketplace_template_reviews for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Buyers view own purchases" on public.marketplace_template_purchases;
create policy "Buyers view own purchases"
  on public.marketplace_template_purchases for select using (
    auth.uid() = buyer_user_id
    or creator_id in (
      select id from public.marketplace_creators where user_id = auth.uid()
    )
  );

drop policy if exists "Users insert analytics events" on public.marketplace_template_events;
create policy "Users insert analytics events"
  on public.marketplace_template_events for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Creators view listing analytics" on public.marketplace_template_events;
create policy "Creators view listing analytics"
  on public.marketplace_template_events for select using (
    listing_id in (
      select l.id from public.marketplace_template_listings l
      join public.marketplace_creators c on c.id = l.creator_id
      where c.user_id = auth.uid()
    )
    or auth.uid() = user_id
  );
