import type { Metadata } from "next";
import { createPageMetadata, rootMetadata, type PageMetadataOptions } from "@/lib/seo/metadata";
import {
  absoluteUrl,
  getSiteUrl,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  PUBLIC_ROUTES,
} from "@/lib/seo/site";
import { buildHreflangAlternates, localizePath } from "@/lib/seo/i18n";
import { getAnalyticsConfig, isAnalyticsConfigured } from "@/lib/seo/analytics";
import {
  buildFullSitemap,
  buildSitemapIndexEntries,
  SPECIALIZED_SITEMAPS,
} from "@/lib/seo/sitemap-registry";
import {
  getProductInternalLinks,
  getRelatedBlogArticles,
  getRelatedBusinessResources,
  getRelatedProgrammaticLinks,
  getRelatedServices,
  getRelatedTemplates,
  getRelatedTools,
} from "@/lib/seo/internal-links";
import { DynamicSeoEngine } from "@/lib/seo/dynamic-engine";
import { BreadcrumbEngine } from "@/lib/seo/breadcrumbs";
import { analyzeSeo, enrichSeoAnalysisWithAi } from "@/lib/seo/analyzer";
import { buildSeoHealthReport } from "@/lib/seo/health";
import * as jsonLd from "@/lib/seo/json-ld";

/**
 * Central reusable SEO service — single entry point for metadata, URLs,
 * structured data, sitemaps, analytics readiness, and internal linking.
 */
export const SeoService = {
  siteName: SITE_NAME,
  defaultDescription: DEFAULT_DESCRIPTION,

  getSiteUrl,
  absoluteUrl,
  localizePath,
  buildHreflangAlternates,

  createMetadata(options: PageMetadataOptions): Metadata {
    return createPageMetadata(options);
  },

  rootMetadata,

  dynamic: DynamicSeoEngine,
  breadcrumbs: BreadcrumbEngine,

  analyze: analyzeSeo,
  enrichAnalysis: enrichSeoAnalysisWithAi,
  health: buildSeoHealthReport,

  publicRoutes: PUBLIC_ROUTES,
  specializedSitemaps: SPECIALIZED_SITEMAPS,
  buildSitemap: buildFullSitemap,
  buildSitemapIndex: buildSitemapIndexEntries,

  analytics: {
    getConfig: getAnalyticsConfig,
    isConfigured: isAnalyticsConfigured,
  },

  jsonLd,

  links: {
    forProduct: getProductInternalLinks,
    tools: getRelatedTools,
    services: getRelatedServices,
    templates: getRelatedTemplates,
    articles: getRelatedBlogArticles,
    resources: getRelatedBusinessResources,
    programmatic: getRelatedProgrammaticLinks,
  },
} as const;

export type SeoServiceApi = typeof SeoService;
