-- Website Builder: persistent leads + CMS content (production storage)

create table if not exists public.website_leads (
  id uuid default gen_random_uuid() primary key,
  generation_id uuid references public.website_generations on delete cascade not null,
  user_id uuid references auth.users on delete set null,
  form_type text not null check (
    form_type in ('contact', 'booking', 'quote', 'registration', 'custom')
  ),
  fields jsonb not null default '{}'::jsonb,
  page_path text,
  locale text,
  status text not null default 'new' check (
    status in ('new', 'notified', 'forwarded', 'failed', 'read', 'archived')
  ),
  integration jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_website_leads_generation
  on public.website_leads (generation_id, created_at desc);
create index if not exists idx_website_leads_status
  on public.website_leads (generation_id, status);

alter table public.website_leads enable row level security;

drop policy if exists "Owners manage website leads" on public.website_leads;
create policy "Owners manage website leads"
  on public.website_leads for all using (
    generation_id in (
      select id from public.website_generations where user_id = auth.uid()
    )
  )
  with check (
    generation_id in (
      select id from public.website_generations where user_id = auth.uid()
    )
  );

drop policy if exists "Public can submit leads to published sites" on public.website_leads;
create policy "Public can submit leads to published sites"
  on public.website_leads for insert
  to anon, authenticated
  with check (
    generation_id in (
      select generation_id from public.website_publications where status = 'published'
    )
  );

create table if not exists public.website_cms_entries (
  id uuid default gen_random_uuid() primary key,
  generation_id uuid references public.website_generations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  kind text not null check (
    kind in ('page', 'section', 'post', 'media', 'faq', 'testimonial', 'custom')
  ),
  title text not null,
  body text,
  media_url text,
  page_path text,
  scheduled_at timestamptz,
  published boolean not null default true,
  version integer not null default 1,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_website_cms_generation
  on public.website_cms_entries (generation_id, updated_at desc);

alter table public.website_cms_entries enable row level security;

drop policy if exists "Owners manage website cms entries" on public.website_cms_entries;
create policy "Owners manage website cms entries"
  on public.website_cms_entries for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.website_cms_versions (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references public.website_cms_entries on delete cascade not null,
  generation_id uuid references public.website_generations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  version integer not null,
  snapshot jsonb not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_website_cms_versions_entry
  on public.website_cms_versions (entry_id, version desc);

alter table public.website_cms_versions enable row level security;

drop policy if exists "Owners read website cms versions" on public.website_cms_versions;
create policy "Owners read website cms versions"
  on public.website_cms_versions for select using (auth.uid() = user_id);

drop policy if exists "Owners insert website cms versions" on public.website_cms_versions;
create policy "Owners insert website cms versions"
  on public.website_cms_versions for insert
  with check (auth.uid() = user_id);
