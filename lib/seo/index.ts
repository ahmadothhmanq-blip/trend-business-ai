export { createPageMetadata, rootMetadata } from "@/lib/seo/metadata";
export {
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  PUBLIC_ROUTES,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo/site";
export * from "@/lib/seo/json-ld";
export * from "@/lib/seo/i18n";
export * from "@/lib/seo/analytics";
export * from "@/lib/seo/internal-links";
export * from "@/lib/seo/knowledge";
export * from "@/lib/seo/programmatic";
export {
  buildFullSitemap,
  buildCoreSitemap,
  buildToolsSitemap,
  buildBlogSitemap,
  buildTemplatesSitemap,
  buildImagesSitemap,
  buildKnowledgeSitemap,
  SPECIALIZED_SITEMAPS,
} from "@/lib/seo/sitemap-registry";
