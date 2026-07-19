-- Smart Template Engine for Website Builder
-- tables: templates, template_sections, template_design_systems

create table if not exists public.templates (
  id text primary key,
  name text not null,
  slug text not null unique,
  category text not null,
  description text not null default '',
  industry_id text not null,
  layout_style text not null,
  navigation jsonb not null default '[]'::jsonb,
  footer jsonb not null default '{}'::jsonb,
  cta_style jsonb not null default '{}'::jsonb,
  required_pages text[] not null default '{}',
  required_features text[] not null default '{}',
  content_tone text not null default 'professional',
  keywords text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_sections (
  id uuid primary key default gen_random_uuid(),
  template_id text not null references public.templates (id) on delete cascade,
  section_key text not null,
  label text not null,
  sort_order integer not null default 0,
  config jsonb not null default '{}'::jsonb,
  unique (template_id, section_key)
);

create table if not exists public.template_design_systems (
  id uuid primary key default gen_random_uuid(),
  template_id text not null unique references public.templates (id) on delete cascade,
  design_preset text not null default 'modern',
  color_palette jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  spacing jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_active_sort_idx
  on public.templates (is_active, sort_order);

create index if not exists template_sections_template_idx
  on public.template_sections (template_id, sort_order);

alter table public.templates enable row level security;
alter table public.template_sections enable row level security;
alter table public.template_design_systems enable row level security;

drop policy if exists "templates_public_read" on public.templates;
create policy "templates_public_read"
  on public.templates for select
  using (is_active = true);

drop policy if exists "template_sections_public_read" on public.template_sections;
create policy "template_sections_public_read"
  on public.template_sections for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = template_id and t.is_active = true
    )
  );

drop policy if exists "template_design_systems_public_read" on public.template_design_systems;
create policy "template_design_systems_public_read"
  on public.template_design_systems for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = template_id and t.is_active = true
    )
  );

-- Seed is applied from application catalog on first load if empty;
-- SQL seeds keep production DBs usable without a seed script.
insert into public.templates (
  id, name, slug, category, description, industry_id, layout_style,
  navigation, footer, cta_style, required_pages, required_features,
  content_tone, keywords, sort_order
) values
(
  'automotive-luxury',
  'Automotive Luxury',
  'automotive-luxury',
  'Automotive',
  'Premium dealership and auto brand experience with inventory and concierge CTAs.',
  'automotive',
  'vehicle-showroom',
  '["Models","Inventory","Services","Finance","Contact"]'::jsonb,
  '{"columns":["Brand","Inventory","Services","Legal"],"newsletter":false,"trustBadges":["Certified","Warranty"]}'::jsonb,
  '{"primaryLabel":"Book a test drive","secondaryLabel":"View inventory","style":"solid-dark"}'::jsonb,
  array['Home','Inventory','Services','Finance','About','Contact'],
  array['inventory','model-showcase','finance-cta','service-booking','test-drive'],
  'bold, refined, performance-driven',
  array['automotive','luxury','car','dealership','showroom','vehicle','ev'],
  10
),
(
  'restaurant-premium',
  'Restaurant Premium',
  'restaurant-premium',
  'Hospitality',
  'Fine-dining hospitality site with menu, reservations, and atmosphere.',
  'restaurant',
  'editorial-hero',
  '["Menu","Reservations","About","Private Dining","Contact"]'::jsonb,
  '{"columns":["Visit","Menu","Events","Press"],"newsletter":true,"trustBadges":["Reservations","Private events"]}'::jsonb,
  '{"primaryLabel":"Reserve a table","secondaryLabel":"View menu","style":"outline-gold"}'::jsonb,
  array['Home','Menu','Reservations','About','Private Dining','Contact'],
  array['menu','reservations','gallery','location-map','reviews'],
  'warm, appetizing, elegant',
  array['restaurant','dining','chef','menu','bistro','hospitality'],
  20
),
(
  'real-estate',
  'Real Estate',
  'real-estate',
  'Property',
  'Property marketing with listings, neighborhoods, and inquiry flows.',
  'real-estate',
  'property-showcase',
  '["Listings","Neighborhoods","Buy","Sell","Agents","Contact"]'::jsonb,
  '{"columns":["Explore","Company","Resources","Legal"],"newsletter":true,"trustBadges":["Licensed","Local experts"]}'::jsonb,
  '{"primaryLabel":"Schedule a viewing","secondaryLabel":"Browse listings","style":"solid-brand"}'::jsonb,
  array['Home','Listings','Neighborhoods','Agents','About','Contact'],
  array['listings','property-search','inquiry-form','neighborhoods','agent-profiles'],
  'trustworthy and aspirational',
  array['real estate','property','homes','listings','realtor','apartment'],
  30
),
(
  'saas-startup',
  'SaaS Startup',
  'saas-startup',
  'Software',
  'Product-led SaaS marketing with features, pricing, and onboarding CTAs.',
  'saas',
  'product-saas',
  '["Product","Features","Pricing","Customers","Docs","Login"]'::jsonb,
  '{"columns":["Product","Company","Resources","Legal"],"newsletter":true,"trustBadges":["SOC2","GDPR"]}'::jsonb,
  '{"primaryLabel":"Start free trial","secondaryLabel":"Book a demo","style":"gradient"}'::jsonb,
  array['Home','Features','Pricing','Customers','Docs','Contact'],
  array['pricing','feature-grid','integrations','auth-cta','demo-request'],
  'confident and product-led',
  array['saas','software','startup','platform','subscription','b2b'],
  40
),
(
  'agency',
  'Agency',
  'agency',
  'Creative',
  'Creative and consulting agency with services, work, and lead capture.',
  'agency',
  'studio-portfolio',
  '["Work","Services","About","Process","Contact"]'::jsonb,
  '{"columns":["Studio","Work","Services","Contact"],"newsletter":false,"trustBadges":["Featured work"]}'::jsonb,
  '{"primaryLabel":"Start a project","secondaryLabel":"View work","style":"solid-accent"}'::jsonb,
  array['Home','Work','Services','About','Process','Contact'],
  array['portfolio','services','case-studies','lead-form','process'],
  'sharp and creative',
  array['agency','studio','creative','portfolio','marketing agency','design'],
  50
),
(
  'clinic',
  'Clinic',
  'clinic',
  'Healthcare',
  'Medical and wellness clinic with services, doctors, and appointment CTAs.',
  'clinic',
  'corporate-trust',
  '["Services","Doctors","Patients","About","Contact"]'::jsonb,
  '{"columns":["Care","Patients","About","Legal"],"newsletter":false,"trustBadges":["Licensed clinicians","HIPAA-aware"]}'::jsonb,
  '{"primaryLabel":"Book appointment","secondaryLabel":"Our services","style":"solid-calm"}'::jsonb,
  array['Home','Services','Doctors','Patients','About','Contact'],
  array['services','appointments','doctor-profiles','insurance','contact-form'],
  'calm, caring, trustworthy',
  array['clinic','medical','doctor','healthcare','dental','wellness','hospital'],
  60
),
(
  'ecommerce-store',
  'E-commerce Store',
  'ecommerce-store',
  'Retail',
  'Conversion-focused storefront with catalog, collections, and trust badges.',
  'ecommerce',
  'commerce-grid',
  '["Shop","Collections","About","Support","Cart"]'::jsonb,
  '{"columns":["Shop","Help","Company","Legal"],"newsletter":true,"trustBadges":["Free shipping","Secure checkout"]}'::jsonb,
  '{"primaryLabel":"Shop now","secondaryLabel":"View collections","style":"solid-conversion"}'::jsonb,
  array['Home','Shop','Collections','About','FAQ','Contact'],
  array['product-catalog','featured-products','cart-cta','trust-badges','faq'],
  'clear and conversion-focused',
  array['ecommerce','shop','store','retail','product','cart','checkout'],
  70
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

-- Sections (replace for seed templates)
delete from public.template_sections
where template_id in (
  'automotive-luxury','restaurant-premium','real-estate','saas-startup',
  'agency','clinic','ecommerce-store'
);

insert into public.template_sections (template_id, section_key, label, sort_order) values
('automotive-luxury','hero','Hero models',10),
('automotive-luxury','inventory','Inventory',20),
('automotive-luxury','finance','Finance offers',30),
('automotive-luxury','service','Service & parts',40),
('automotive-luxury','test-drive','Test drive CTA',50),
('automotive-luxury','why-us','Why us',60),
('automotive-luxury','reviews','Reviews',70),
('automotive-luxury','contact','Contact',80),
('restaurant-premium','hero','Hero',10),
('restaurant-premium','signature','Signature dishes',20),
('restaurant-premium','menu','Menu highlights',30),
('restaurant-premium','reservations','Reservations',40),
('restaurant-premium','atmosphere','Atmosphere',50),
('restaurant-premium','location','Location',60),
('restaurant-premium','reviews','Reviews',70),
('restaurant-premium','contact','Contact',80),
('real-estate','hero','Hero search',10),
('real-estate','listings','Featured listings',20),
('real-estate','neighborhoods','Neighborhoods',30),
('real-estate','process','Buying process',40),
('real-estate','agents','Agent trust',50),
('real-estate','testimonials','Testimonials',60),
('real-estate','inquiry','Inquiry form',70),
('real-estate','contact','Contact',80),
('saas-startup','hero','Hero',10),
('saas-startup','problem','Problem',20),
('saas-startup','solution','Solution',30),
('saas-startup','features','Features',40),
('saas-startup','how','How it works',50),
('saas-startup','pricing','Pricing',60),
('saas-startup','testimonials','Testimonials',70),
('saas-startup','cta','CTA',80),
('agency','hero','Hero',10),
('agency','services','Services',20),
('agency','work','Selected work',30),
('agency','process','Process',40),
('agency','clients','Clients',50),
('agency','capabilities','Capabilities',60),
('agency','testimonials','Testimonials',70),
('agency','contact','Contact',80),
('clinic','hero','Hero',10),
('clinic','services','Care services',20),
('clinic','doctors','Doctors',30),
('clinic','why','Why patients choose us',40),
('clinic','appointments','Appointments',50),
('clinic','insurance','Insurance',60),
('clinic','testimonials','Patient stories',70),
('clinic','contact','Contact',80),
('ecommerce-store','hero','Hero offer',10),
('ecommerce-store','featured','Featured products',20),
('ecommerce-store','collections','Collections',30),
('ecommerce-store','benefits','Benefits',40),
('ecommerce-store','social','Social proof',50),
('ecommerce-store','shipping','Shipping & returns',60),
('ecommerce-store','faq','FAQ',70),
('ecommerce-store','cta','CTA',80);

insert into public.template_design_systems (
  template_id, design_preset, color_palette, typography, spacing, config
) values
(
  'automotive-luxury',
  'luxury',
  '{"primary":"#0B0B0F","secondary":"#C6A75E","accent":"#E8E2D6","background":"#111114","surface":"#1A1A1F","text":"#F5F2EA","muted":"#9A958A"}'::jsonb,
  '{"display":"Playfair Display","body":"DM Sans","scale":"editorial"}'::jsonb,
  '{"sectionY":"6rem","container":"72rem","radius":"0.5rem"}'::jsonb,
  '{"mood":"luxury-showroom","imagery":"vehicles-night"}'::jsonb
),
(
  'restaurant-premium',
  'luxury',
  '{"primary":"#1C1410","secondary":"#B08D57","accent":"#8B1E1E","background":"#FAF6F1","surface":"#FFFFFF","text":"#1C1410","muted":"#6E6258"}'::jsonb,
  '{"display":"Cormorant Garamond","body":"Source Sans 3","scale":"hospitality"}'::jsonb,
  '{"sectionY":"5.5rem","container":"70rem","radius":"0.375rem"}'::jsonb,
  '{"mood":"fine-dining","imagery":"food-ambiance"}'::jsonb
),
(
  'real-estate',
  'corporate',
  '{"primary":"#0F2744","secondary":"#2F6FED","accent":"#D4A373","background":"#F7F9FC","surface":"#FFFFFF","text":"#142033","muted":"#5B677A"}'::jsonb,
  '{"display":"Libre Baskerville","body":"IBM Plex Sans","scale":"property"}'::jsonb,
  '{"sectionY":"5rem","container":"74rem","radius":"0.5rem"}'::jsonb,
  '{"mood":"aspirational-trust","imagery":"homes-neighborhoods"}'::jsonb
),
(
  'saas-startup',
  'modern',
  '{"primary":"#111827","secondary":"#4F46E5","accent":"#22D3EE","background":"#FAFAFB","surface":"#FFFFFF","text":"#111827","muted":"#6B7280"}'::jsonb,
  '{"display":"Sora","body":"Inter","scale":"product"}'::jsonb,
  '{"sectionY":"5rem","container":"72rem","radius":"0.75rem"}'::jsonb,
  '{"mood":"product-led","imagery":"product-ui"}'::jsonb
),
(
  'agency',
  'creative',
  '{"primary":"#0A0A0A","secondary":"#FF4D6D","accent":"#F4F1EA","background":"#FFFFFF","surface":"#F7F7F5","text":"#0A0A0A","muted":"#6B6B6B"}'::jsonb,
  '{"display":"Space Grotesk","body":"Manrope","scale":"studio"}'::jsonb,
  '{"sectionY":"6rem","container":"76rem","radius":"0.25rem"}'::jsonb,
  '{"mood":"creative-sharp","imagery":"case-studies"}'::jsonb
),
(
  'clinic',
  'minimal',
  '{"primary":"#0E3B3A","secondary":"#2A9D8F","accent":"#E9C46A","background":"#F8FBFA","surface":"#FFFFFF","text":"#12302F","muted":"#5C7371"}'::jsonb,
  '{"display":"Fraunces","body":"Nunito Sans","scale":"care"}'::jsonb,
  '{"sectionY":"5rem","container":"70rem","radius":"0.75rem"}'::jsonb,
  '{"mood":"calm-care","imagery":"clinicians-patients"}'::jsonb
),
(
  'ecommerce-store',
  'modern',
  '{"primary":"#111111","secondary":"#E11D48","accent":"#F59E0B","background":"#FFFFFF","surface":"#F4F4F5","text":"#18181B","muted":"#71717A"}'::jsonb,
  '{"display":"Outfit","body":"Inter","scale":"commerce"}'::jsonb,
  '{"sectionY":"4.5rem","container":"72rem","radius":"0.5rem"}'::jsonb,
  '{"mood":"conversion","imagery":"product-lifestyle"}'::jsonb
)
on conflict (template_id) do update set
  design_preset = excluded.design_preset,
  color_palette = excluded.color_palette,
  typography = excluded.typography,
  spacing = excluded.spacing,
  config = excluded.config,
  updated_at = now();
