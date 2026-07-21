-- Content Studio Platform: projects, documents, versions, templates

-- Projects & folders
create table if not exists public.content_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.content_projects(id) on delete cascade,
  name text not null default 'Untitled Project',
  description text not null default '',
  color text not null default '#D4AF37',
  is_folder boolean not null default false,
  is_favorite boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_projects enable row level security;

create policy "Users can view own content projects"
  on public.content_projects for select using (auth.uid() = user_id);
create policy "Users can insert own content projects"
  on public.content_projects for insert with check (auth.uid() = user_id);
create policy "Users can update own content projects"
  on public.content_projects for update using (auth.uid() = user_id);
create policy "Users can delete own content projects"
  on public.content_projects for delete using (auth.uid() = user_id);

create index if not exists idx_content_projects_user_id on public.content_projects(user_id);
create index if not exists idx_content_projects_parent_id on public.content_projects(parent_id);
create index if not exists idx_content_projects_is_favorite on public.content_projects(is_favorite);
create index if not exists idx_content_projects_updated_at on public.content_projects(updated_at desc);

-- Documents
create table if not exists public.content_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.content_projects(id) on delete set null,
  title text not null default 'Untitled Document',
  body text not null default '',
  content_type text not null default 'document',
  content_tool text not null default 'content-writer',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_favorite boolean not null default false,
  word_count integer not null default 0,
  char_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  generation_id uuid references public.content_generations(id) on delete set null,
  brand_identity_id uuid,
  last_edited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_documents enable row level security;

create policy "Users can view own content documents"
  on public.content_documents for select using (auth.uid() = user_id);
create policy "Users can insert own content documents"
  on public.content_documents for insert with check (auth.uid() = user_id);
create policy "Users can update own content documents"
  on public.content_documents for update using (auth.uid() = user_id);
create policy "Users can delete own content documents"
  on public.content_documents for delete using (auth.uid() = user_id);

create index if not exists idx_content_documents_user_id on public.content_documents(user_id);
create index if not exists idx_content_documents_project_id on public.content_documents(project_id);
create index if not exists idx_content_documents_status on public.content_documents(status);
create index if not exists idx_content_documents_is_favorite on public.content_documents(is_favorite);
create index if not exists idx_content_documents_updated_at on public.content_documents(updated_at desc);
create index if not exists idx_content_documents_last_edited_at on public.content_documents(last_edited_at desc);

-- Document versions
create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.content_documents(id) on delete cascade,
  version_number integer not null,
  title text not null default '',
  body text not null default '',
  change_summary text not null default '',
  source text not null default 'manual' check (source in ('manual', 'autosave', 'ai_action', 'generation', 'restore')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);

alter table public.content_versions enable row level security;

create policy "Users can view own content versions"
  on public.content_versions for select using (auth.uid() = user_id);
create policy "Users can insert own content versions"
  on public.content_versions for insert with check (auth.uid() = user_id);
create policy "Users can delete own content versions"
  on public.content_versions for delete using (auth.uid() = user_id);

create index if not exists idx_content_versions_document_id on public.content_versions(document_id);
create index if not exists idx_content_versions_user_id on public.content_versions(user_id);
create index if not exists idx_content_versions_created_at on public.content_versions(created_at desc);

-- Templates (system + user)
create table if not exists public.content_templates (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  description text not null default '',
  prompt_structure text not null default '',
  variables jsonb not null default '[]'::jsonb,
  preview text not null default '',
  content_tool text not null default 'content-writer',
  content_type text not null default 'blog-post',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_templates enable row level security;

create policy "Users can view system and own content templates"
  on public.content_templates for select
  using (is_system = true or auth.uid() = user_id);
create policy "Users can insert own content templates"
  on public.content_templates for insert
  with check (auth.uid() = user_id and is_system = false);
create policy "Users can update own content templates"
  on public.content_templates for update
  using (auth.uid() = user_id and is_system = false);
create policy "Users can delete own content templates"
  on public.content_templates for delete
  using (auth.uid() = user_id and is_system = false);

create index if not exists idx_content_templates_category on public.content_templates(category);
create index if not exists idx_content_templates_is_system on public.content_templates(is_system);
create index if not exists idx_content_templates_user_id on public.content_templates(user_id);

-- Link content_generations.project_id to content_projects
alter table public.content_generations
  drop constraint if exists content_generations_project_id_fkey;
alter table public.content_generations
  add constraint content_generations_project_id_fkey
  foreign key (project_id) references public.content_projects(id) on delete set null;

-- Seed system templates
insert into public.content_templates (id, user_id, name, category, description, prompt_structure, variables, preview, content_tool, content_type, is_system)
values
  ('blog-how-to', null, 'How-To Blog Post', 'Blog', 'Step-by-step educational blog post', 'Write a how-to blog post about {{topic}} for {{audience}}. Tone: {{tone}}. Include introduction, numbered steps, tips, and conclusion.', '[{"key":"topic","label":"Topic","placeholder":"e.g. email marketing"},{"key":"audience","label":"Audience","placeholder":"e.g. small business owners"},{"key":"tone","label":"Tone","default":"Professional"}]'::jsonb, 'A practical guide that walks readers through a process with clear steps and actionable advice.', 'blog-writer', 'blog-post', true),
  ('social-linkedin', null, 'LinkedIn Thought Leadership', 'Social Media', 'Professional LinkedIn post with hook and CTA', 'Write a LinkedIn post about {{topic}}. Hook: {{hook}}. Tone: {{tone}}. Include a clear takeaway and call-to-action.', '[{"key":"topic","label":"Topic"},{"key":"hook","label":"Opening Hook"},{"key":"tone","label":"Tone","default":"Professional"}]'::jsonb, 'Engaging professional post designed for LinkedIn engagement.', 'social-writer', 'linkedin-post', true),
  ('ad-google', null, 'Google Search Ad', 'Ads', 'High-converting Google ad copy', 'Write Google Search ad copy for {{product}}. Target keyword: {{keyword}}. Tone: {{tone}}. Include 3 headlines and 2 descriptions.', '[{"key":"product","label":"Product/Service"},{"key":"keyword","label":"Target Keyword"},{"key":"tone","label":"Tone","default":"Marketing"}]'::jsonb, 'Concise ad copy optimized for search intent and click-through.', 'ad-copy', 'google-ad', true),
  ('email-welcome', null, 'Welcome Email', 'Email', 'Onboarding welcome email sequence opener', 'Write a welcome email for {{brand}} targeting {{audience}}. Tone: {{tone}}. Include warm greeting, value proposition, and next steps.', '[{"key":"brand","label":"Brand Name"},{"key":"audience","label":"Audience"},{"key":"tone","label":"Tone","default":"Friendly"}]'::jsonb, 'Warm onboarding email that sets expectations and drives engagement.', 'email-writer', 'email-campaign', true),
  ('product-ecommerce', null, 'E-commerce Product Description', 'Product Description', 'Benefit-focused product copy', 'Write a product description for {{product}}. Key benefits: {{benefits}}. Tone: {{tone}}. Focus on benefits over features.', '[{"key":"product","label":"Product Name"},{"key":"benefits","label":"Key Benefits"},{"key":"tone","label":"Tone","default":"Marketing"}]'::jsonb, 'Compelling product copy that highlights benefits and drives purchases.', 'product-description', 'product-description', true),
  ('landing-hero', null, 'Landing Page Hero', 'Landing Pages', 'Conversion-focused hero section', 'Write landing page hero copy for {{product}}. Target audience: {{audience}}. Tone: {{tone}}. Include headline, subheadline, and CTA.', '[{"key":"product","label":"Product/Service"},{"key":"audience","label":"Audience"},{"key":"tone","label":"Tone","default":"Marketing"}]'::jsonb, 'Hero section with headline, value prop, and strong call-to-action.', 'landing-copy', 'landing-page', true),
  ('seo-pillar', null, 'SEO Pillar Article', 'SEO Articles', 'Long-form SEO-optimized article', 'Write an SEO pillar article about {{topic}}. Primary keyword: {{keyword}}. Tone: {{tone}}. Include H2 sections, FAQ, and meta suggestions.', '[{"key":"topic","label":"Topic"},{"key":"keyword","label":"Primary Keyword"},{"key":"tone","label":"Tone","default":"Professional"}]'::jsonb, 'Comprehensive SEO article structured for search visibility.', 'article-writer', 'seo-article', true),
  ('business-proposal', null, 'Business Proposal', 'Business Documents', 'Professional business proposal outline', 'Write a business proposal for {{client}} about {{project}}. Tone: {{tone}}. Include executive summary, scope, timeline, and next steps.', '[{"key":"client","label":"Client Name"},{"key":"project","label":"Project"},{"key":"tone","label":"Tone","default":"Professional"}]'::jsonb, 'Structured business proposal with executive summary and clear scope.', 'content-writer', 'business-report', true)
on conflict (id) do nothing;
