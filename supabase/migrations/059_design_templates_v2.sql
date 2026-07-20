-- Canvas templates v2 catalog (seed + user overrides)
create table if not exists public.design_templates_v2 (
  id text primary key,
  label text not null,
  category text not null check (
    category in (
      'social-media',
      'ads',
      'product-marketing',
      'presentations',
      'posters',
      'business-documents'
    )
  ),
  description text not null default '',
  width integer not null,
  height integer not null,
  document jsonb not null default '{}'::jsonb,
  brand_placeholders jsonb not null default '{}'::jsonb,
  is_system boolean not null default true,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_design_templates_v2_category on public.design_templates_v2(category);

alter table public.design_templates_v2 enable row level security;

drop policy if exists "Anyone can read system templates v2" on public.design_templates_v2;
create policy "Anyone can read system templates v2"
  on public.design_templates_v2 for select using (is_system = true or auth.uid() = user_id);

drop policy if exists "Users manage own templates v2" on public.design_templates_v2;
create policy "Users manage own templates v2"
  on public.design_templates_v2 for all using (auth.uid() = user_id);

-- Seed system templates (document built at runtime; metadata only)
insert into public.design_templates_v2 (id, label, category, description, width, height, brand_placeholders, is_system)
values
  ('social-square', 'Social Square Post', 'social-media', 'Square social post with headline, accent bar, and logo slot.', 1080, 1080, '{"primaryColor":true,"accentColor":true,"headingFont":true,"logo":true,"tagline":true}'::jsonb, true),
  ('story-vertical', 'Story Vertical', 'social-media', '9:16 story layout with bold headline zone.', 1080, 1920, '{"primaryColor":true,"accentColor":true,"headingFont":true,"logo":true}'::jsonb, true),
  ('facebook-ad', 'Facebook Ad', 'ads', 'Conversion ad with CTA strip and product image zone.', 1200, 628, '{"primaryColor":true,"secondaryColor":true,"accentColor":true,"bodyFont":true}'::jsonb, true),
  ('product-feature', 'Product Feature Card', 'product-marketing', 'Product hero with feature bullets and brand colors.', 1200, 1200, '{"primaryColor":true,"accentColor":true,"logo":true}'::jsonb, true),
  ('presentation-cover', 'Presentation Cover', 'presentations', '16:9 deck cover with title and brand mark.', 1920, 1080, '{"primaryColor":true,"headingFont":true,"logo":true,"tagline":true}'::jsonb, true),
  ('poster-promo', 'Promo Poster', 'posters', 'Large format poster with headline and brand frame.', 2480, 3508, '{"primaryColor":true,"accentColor":true,"headingFont":true,"logo":true}'::jsonb, true),
  ('business-letterhead', 'Business Letterhead', 'business-documents', 'Corporate document header with logo and contact strip.', 2480, 3508, '{"primaryColor":true,"secondaryColor":true,"bodyFont":true,"logo":true}'::jsonb, true)
on conflict (id) do nothing;
