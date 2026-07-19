-- Migration 039: Store production SEO artifacts for public /w/{slug} hosting

alter table public.website_publications
  add column if not exists seo_json jsonb,
  add column if not exists robots_txt text,
  add column if not exists sitemap_xml text;

comment on column public.website_publications.seo_json is
  'CoreSeoPackage snapshot used when publishing the public site';
comment on column public.website_publications.robots_txt is
  'robots.txt body served at /w/{slug}/robots.txt';
comment on column public.website_publications.sitemap_xml is
  'sitemap.xml body served at /w/{slug}/sitemap.xml';
