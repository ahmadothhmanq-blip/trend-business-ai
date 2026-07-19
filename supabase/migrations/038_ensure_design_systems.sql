-- Ensure AI Design System Engine tables exist (idempotent / data-safe).
-- Repairs environments where 036 was skipped or only partially applied.
-- Uses CREATE IF NOT EXISTS / ON CONFLICT — never drops tables or deletes rows.

create extension if not exists pgcrypto;

create table if not exists public.design_presets (
  id text primary key,
  name text not null,
  style text not null,
  description text not null default '',
  color_palette jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  spacing jsonb not null default '{}'::jsonb,
  border_radius text not null default '0.75rem',
  shadow_style text not null default 'soft',
  button_styles jsonb not null default '{}'::jsonb,
  card_styles jsonb not null default '{}'::jsonb,
  section_layouts jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_systems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  website_generation_id uuid,
  ai_run_id uuid,
  preset_id text,
  template_id text,
  name text not null,
  style text not null,
  industry_pattern text,
  layout_style text,
  color_palette jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  spacing jsonb not null default '{}'::jsonb,
  border_radius text,
  shadow_style text,
  button_styles jsonb not null default '{}'::jsonb,
  card_styles jsonb not null default '{}'::jsonb,
  section_layouts jsonb not null default '[]'::jsonb,
  ui_patterns jsonb not null default '[]'::jsonb,
  animation_style jsonb not null default '{}'::jsonb,
  source text not null default 'engine',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  design_system_id uuid,
  website_generation_id uuid,
  ai_run_id uuid,
  status text not null default 'ready',
  summary text,
  design_json jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Add foreign keys only when missing and referenced tables exist (data-safe).
do $$
begin
  if to_regclass('auth.users') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'design_systems_user_id_fkey'
     ) then
    alter table public.design_systems
      add constraint design_systems_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete set null;
  end if;

  if to_regclass('public.website_generations') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'design_systems_website_generation_id_fkey'
     ) then
    alter table public.design_systems
      add constraint design_systems_website_generation_id_fkey
      foreign key (website_generation_id) references public.website_generations (id) on delete set null;
  end if;

  if to_regclass('public.ai_runs') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'design_systems_ai_run_id_fkey'
     ) then
    alter table public.design_systems
      add constraint design_systems_ai_run_id_fkey
      foreign key (ai_run_id) references public.ai_runs (id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'design_systems_preset_id_fkey'
  ) then
    alter table public.design_systems
      add constraint design_systems_preset_id_fkey
      foreign key (preset_id) references public.design_presets (id) on delete set null;
  end if;

  if to_regclass('auth.users') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'generated_designs_user_id_fkey'
     ) then
    alter table public.generated_designs
      add constraint generated_designs_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'generated_designs_design_system_id_fkey'
  ) then
    alter table public.generated_designs
      add constraint generated_designs_design_system_id_fkey
      foreign key (design_system_id) references public.design_systems (id) on delete cascade;
  end if;

  if to_regclass('public.website_generations') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'generated_designs_website_generation_id_fkey'
     ) then
    alter table public.generated_designs
      add constraint generated_designs_website_generation_id_fkey
      foreign key (website_generation_id) references public.website_generations (id) on delete set null;
  end if;

  if to_regclass('public.ai_runs') is not null
     and not exists (
       select 1 from pg_constraint
       where conname = 'generated_designs_ai_run_id_fkey'
     ) then
    alter table public.generated_designs
      add constraint generated_designs_ai_run_id_fkey
      foreign key (ai_run_id) references public.ai_runs (id) on delete set null;
  end if;
end $$;

create index if not exists design_systems_user_idx
  on public.design_systems (user_id, created_at desc);
create index if not exists design_systems_preset_idx
  on public.design_systems (preset_id);
create index if not exists generated_designs_user_idx
  on public.generated_designs (user_id, created_at desc);
create index if not exists generated_designs_website_idx
  on public.generated_designs (website_generation_id);

alter table public.design_presets enable row level security;
alter table public.design_systems enable row level security;
alter table public.generated_designs enable row level security;

drop policy if exists "design_presets_public_read" on public.design_presets;
create policy "design_presets_public_read"
  on public.design_presets for select
  using (is_active = true);

drop policy if exists "design_systems_owner_select" on public.design_systems;
create policy "design_systems_owner_select"
  on public.design_systems for select
  using (auth.uid() = user_id);

drop policy if exists "design_systems_owner_insert" on public.design_systems;
create policy "design_systems_owner_insert"
  on public.design_systems for insert
  with check (auth.uid() = user_id);

drop policy if exists "generated_designs_owner_select" on public.generated_designs;
create policy "generated_designs_owner_select"
  on public.generated_designs for select
  using (auth.uid() = user_id);

drop policy if exists "generated_designs_owner_insert" on public.generated_designs;
create policy "generated_designs_owner_insert"
  on public.generated_designs for insert
  with check (auth.uid() = user_id);

insert into public.design_presets (
  id, name, style, description, color_palette, typography, spacing,
  border_radius, shadow_style, button_styles, card_styles, section_layouts, sort_order
) values
(
  'luxury', 'Luxury', 'Luxury editorial',
  'Premium editorial aesthetic with gold accents and cinematic contrast.',
  '{"primary":"#D4AF37","secondary":"#1A1A1A","accent":"#C9A227","background":"#0A0A0A","foreground":"#FAFAF9"}'::jsonb,
  '{"headingFont":"Playfair Display","bodyFont":"Source Sans 3"}'::jsonb,
  '{"sectionGap":"6rem","containerMax":"72rem"}'::jsonb,
  '0.75rem', 'soft gold glow',
  '{"primary":"Solid gold CTA","secondary":"Quiet ghost"}'::jsonb,
  '{"style":"Glass/dark panels with thin gold borders"}'::jsonb,
  '["Full-bleed hero","Gallery","Testimonials","CTA"]'::jsonb,
  10
),
(
  'modern', 'Modern', 'Modern product',
  'Clean product marketing with clear hierarchy and elevated cards.',
  '{"primary":"#2563EB","secondary":"#0F172A","accent":"#22D3EE","background":"#FFFFFF","foreground":"#0F172A"}'::jsonb,
  '{"headingFont":"Space Grotesk","bodyFont":"IBM Plex Sans"}'::jsonb,
  '{"sectionGap":"5rem","containerMax":"72rem"}'::jsonb,
  '1rem', 'soft elevated',
  '{"primary":"Primary filled","secondary":"Outline"}'::jsonb,
  '{"style":"Elevated feature cards with icon headers"}'::jsonb,
  '["Hero","FeatureGrid","Pricing","FAQ","CTA"]'::jsonb,
  20
),
(
  'minimal', 'Minimal', 'Minimal clean',
  'Quiet content-first UI with intentional whitespace.',
  '{"primary":"#111827","secondary":"#6B7280","accent":"#111827","background":"#FFFFFF","foreground":"#111827"}'::jsonb,
  '{"headingFont":"Geist","bodyFont":"Geist"}'::jsonb,
  '{"sectionGap":"7rem","containerMax":"64rem"}'::jsonb,
  '0.25rem', 'none',
  '{"primary":"Black text buttons","secondary":"Thin outlines"}'::jsonb,
  '{"style":"Borderless content blocks"}'::jsonb,
  '["Hero","Work","Process","About","Contact"]'::jsonb,
  30
),
(
  'corporate', 'Corporate', 'Corporate trust',
  'Trust-first professional design for services and institutions.',
  '{"primary":"#1E3A5F","secondary":"#334155","accent":"#0EA5E9","background":"#FFFFFF","foreground":"#0F172A"}'::jsonb,
  '{"headingFont":"Source Serif 4","bodyFont":"Inter"}'::jsonb,
  '{"sectionGap":"4.5rem","containerMax":"70rem"}'::jsonb,
  '0.5rem', 'light card shadow',
  '{"primary":"Navy primary","secondary":"Muted secondary"}'::jsonb,
  '{"style":"Bordered service cards"}'::jsonb,
  '["Hero","Services","Stats","Testimonials","Contact"]'::jsonb,
  40
),
(
  'creative', 'Creative', 'Creative expressive',
  'Expressive agency/studio energy with bold accents.',
  '{"primary":"#F43F5E","secondary":"#0F172A","accent":"#A78BFA","background":"#FFFBF7","foreground":"#0F172A"}'::jsonb,
  '{"headingFont":"Clash Display","bodyFont":"Satoshi"}'::jsonb,
  '{"sectionGap":"5.5rem","containerMax":"74rem"}'::jsonb,
  '1.25rem', 'colorful soft elevation',
  '{"primary":"Bold pill CTAs","secondary":"Accent hover"}'::jsonb,
  '{"style":"Offset portfolio cards"}'::jsonb,
  '["Hero","Work","Services","Process","Contact"]'::jsonb,
  50
),
(
  'tech', 'Tech', 'Tech futurist',
  'Dark tech aesthetic with cyan/indigo accents for SaaS and product brands.',
  '{"primary":"#22D3EE","secondary":"#0B1220","accent":"#818CF8","background":"#020617","foreground":"#E2E8F0"}'::jsonb,
  '{"headingFont":"JetBrains Mono","bodyFont":"Inter"}'::jsonb,
  '{"sectionGap":"5rem","containerMax":"72rem"}'::jsonb,
  '0.75rem', 'cyan soft glow',
  '{"primary":"Glow cyan primary","secondary":"Ghost secondary"}'::jsonb,
  '{"style":"Dark glass panels with hairline borders"}'::jsonb,
  '["Hero","Features","Integrations","Pricing","CTA"]'::jsonb,
  60
)
on conflict (id) do update set
  name = excluded.name,
  style = excluded.style,
  description = excluded.description,
  color_palette = excluded.color_palette,
  typography = excluded.typography,
  spacing = excluded.spacing,
  border_radius = excluded.border_radius,
  shadow_style = excluded.shadow_style,
  button_styles = excluded.button_styles,
  card_styles = excluded.card_styles,
  section_layouts = excluded.section_layouts,
  updated_at = now();

do $$
begin
  if to_regclass('public.template_design_systems') is not null then
    update public.template_design_systems
    set design_preset = 'tech', updated_at = now()
    where template_id = 'saas-startup';
  end if;
end $$;
