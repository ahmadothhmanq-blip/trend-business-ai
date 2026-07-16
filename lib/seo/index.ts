export { createPageMetadata, rootMetadata } from "@/lib/seo/metadata";
export type { PageMetadataOptions, PageSeoType } from "@/lib/seo/metadata";
export { SeoService } from "@/lib/seo/engine";
export {
  generateSeoMetadata,
  generateProductSeoMetadata,
  generateBlogPostSeoMetadata,
  generateProgrammaticSeoMetadata,
} from "@/lib/seo/generate-metadata";
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
export * from "@/lib/seo/industries";
export * from "@/lib/seo/countries";
export * from "@/lib/seo/dynamic-engine";
export * from "@/lib/seo/breadcrumbs";
export * from "@/lib/seo/analyzer";
export * from "@/lib/seo/health";
export {
  buildFullSitemap,
  buildCoreSitemap,
  buildToolsSitemap,
  buildServiceSitemap,
  buildBlogSitemap,
  buildTemplatesSitemap,
  buildImagesSitemap,
  buildKnowledgeSitemap,
  buildIndustrySitemap,
  buildCountrySitemap,
  buildSitemapIndexEntries,
  SPECIALIZED_SITEMAPS,
} from "@/lib/seo/sitemap-registry";
