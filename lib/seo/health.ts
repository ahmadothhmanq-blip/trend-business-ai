/**
 * SEO Health Dashboard data — sitewide audit of registries, routes, and config.
 */
import { MARKETING_PRODUCTS } from "@/lib/constants/marketing-content";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { getTemplateCatalog } from "@/lib/seo/content/templates";
import { getPublishedCountries } from "@/lib/seo/countries";
import { getPublishedIndustries } from "@/lib/seo/industries";
import { getKnowledgeEntries } from "@/lib/seo/knowledge";
import { getPublishedProgrammaticPages, getProgrammaticPageDefs } from "@/lib/seo/programmatic";
import { SPECIALIZED_SITEMAPS, buildFullSitemap } from "@/lib/seo/sitemap-registry";
import { PUBLIC_ROUTES, getSiteUrl, isProductionRuntime } from "@/lib/seo/site";
import { getAnalyticsConfig, isAnalyticsConfigured } from "@/lib/seo/analytics";
import { SUPPORTED_LOCALES } from "@/lib/seo/site";

export type SeoHealthCheckStatus = "pass" | "warn" | "fail";

export type SeoHealthCheck = {
  id: string;
  label: string;
  status: SeoHealthCheckStatus;
  detail: string;
};

export type SeoHealthReport = {
  score: number;
  generatedAt: string;
  siteUrl: string;
  isProduction: boolean;
  counts: {
    publicRoutes: number;
    sitemapUrls: number;
    specializedSitemaps: number;
    products: number;
    blogPosts: number;
    templates: number;
    industries: number;
    countries: number;
    programmaticPublished: number;
    programmaticDraft: number;
    knowledgePublished: number;
    locales: number;
  };
  checks: SeoHealthCheck[];
  recommendations: string[];
};

function scoreFromChecks(checks: SeoHealthCheck[]): number {
  if (!checks.length) return 0;
  const weights = { pass: 100, warn: 60, fail: 15 } as const;
  const total = checks.reduce((sum, check) => sum + weights[check.status], 0);
  return Math.round(total / checks.length);
}

export function buildSeoHealthReport(): SeoHealthReport {
  const sitemapUrls = buildFullSitemap();
  const analytics = getAnalyticsConfig();
  const programmaticAll = getProgrammaticPageDefs();
  const programmaticPublished = getPublishedProgrammaticPages();
  const knowledgePublished = getKnowledgeEntries().filter((e) => e.status === "published");
  const blogPosts = getPublishedBlogPosts();
  const industries = getPublishedIndustries();
  const countries = getPublishedCountries();
  const templates = getTemplateCatalog();

  const checks: SeoHealthCheck[] = [
    {
      id: "site-url",
      label: "Canonical site URL configured",
      status: getSiteUrl().startsWith("http") ? "pass" : "fail",
      detail: getSiteUrl(),
    },
    {
      id: "public-routes",
      label: "Public route registry populated",
      status: PUBLIC_ROUTES.length >= 20 ? "pass" : "warn",
      detail: `${PUBLIC_ROUTES.length} routes registered`,
    },
    {
      id: "sitemap-coverage",
      label: "Sitemap URL coverage",
      status: sitemapUrls.length >= PUBLIC_ROUTES.length ? "pass" : "warn",
      detail: `${sitemapUrls.length} URLs in combined sitemap`,
    },
    {
      id: "specialized-sitemaps",
      label: "Specialized sitemap index members",
      status: SPECIALIZED_SITEMAPS.length >= 6 ? "pass" : "warn",
      detail: SPECIALIZED_SITEMAPS.map((s) => s.id).join(", "),
    },
    {
      id: "products",
      label: "Product landing coverage",
      status: MARKETING_PRODUCTS.length >= 10 ? "pass" : "warn",
      detail: `${MARKETING_PRODUCTS.length} marketing products`,
    },
    {
      id: "blog",
      label: "Published blog content",
      status: blogPosts.length >= 1 ? (blogPosts.length >= 3 ? "pass" : "warn") : "fail",
      detail: `${blogPosts.length} published posts`,
    },
    {
      id: "industries",
      label: "Industry programmatic pages",
      status: industries.length >= 3 ? "pass" : "warn",
      detail: `${industries.length} published industries`,
    },
    {
      id: "countries",
      label: "Country / market pages",
      status: countries.length >= 2 ? "pass" : "warn",
      detail: `${countries.length} published markets`,
    },
    {
      id: "programmatic-quality",
      label: "Programmatic SEO gatekeeping",
      status: programmaticPublished.every((p) => p.description.length >= 80)
        ? "pass"
        : "warn",
      detail: `${programmaticPublished.length} published / ${programmaticAll.length - programmaticPublished.length} draft`,
    },
    {
      id: "knowledge",
      label: "Knowledge hub entries",
      status: knowledgePublished.length >= 1 ? "pass" : "warn",
      detail: `${knowledgePublished.length} published knowledge entries`,
    },
    {
      id: "analytics",
      label: "Analytics / verification readiness",
      status: isAnalyticsConfigured()
        ? "pass"
        : analytics.googleVerification || analytics.bingVerification
          ? "warn"
          : "warn",
      detail: isAnalyticsConfigured()
        ? "Analytics IDs configured"
        : "Optional GA/GTM/verification env vars not fully set",
    },
    {
      id: "hreflang",
      label: "Hreflang foundation",
      status: SUPPORTED_LOCALES.length >= 1 ? "pass" : "fail",
      detail: `${SUPPORTED_LOCALES.length} locale(s) prepared (${SUPPORTED_LOCALES.map((l) => l.code).join(", ")})`,
    },
    {
      id: "templates",
      label: "Template catalog",
      status: templates.length >= 1 ? "pass" : "warn",
      detail: `${templates.length} template entries`,
    },
  ];

  const recommendations: string[] = [];
  for (const check of checks) {
    if (check.status === "fail") {
      recommendations.push(`Fix: ${check.label} — ${check.detail}`);
    } else if (check.status === "warn") {
      recommendations.push(`Improve: ${check.label} — ${check.detail}`);
    }
  }

  if (blogPosts.length < 5) {
    recommendations.push("Publish more high-quality blog posts to strengthen topical authority.");
  }
  if (!isProductionRuntime()) {
    recommendations.push("Non-production robots currently disallow indexing (expected for staging).");
  }

  return {
    score: scoreFromChecks(checks),
    generatedAt: new Date().toISOString(),
    siteUrl: getSiteUrl(),
    isProduction: isProductionRuntime(),
    counts: {
      publicRoutes: PUBLIC_ROUTES.length,
      sitemapUrls: sitemapUrls.length,
      specializedSitemaps: SPECIALIZED_SITEMAPS.length,
      products: MARKETING_PRODUCTS.length,
      blogPosts: blogPosts.length,
      templates: templates.length,
      industries: industries.length,
      countries: countries.length,
      programmaticPublished: programmaticPublished.length,
      programmaticDraft: programmaticAll.length - programmaticPublished.length,
      knowledgePublished: knowledgePublished.length,
      locales: SUPPORTED_LOCALES.length,
    },
    checks,
    recommendations: recommendations.slice(0, 12),
  };
}
