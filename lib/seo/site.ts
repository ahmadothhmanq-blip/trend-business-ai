import { getOptionalSiteUrl } from "@/lib/env";

export const SITE_NAME = "Trend Business AI";
export const SITE_LEGAL_NAME = "Trend Business AI";
export const SITE_TAGLINE = "AI Business Planning Workspace";

export const DEFAULT_TITLE =
  "Trend Business AI — AI Business Planning Workspace";

export const DEFAULT_DESCRIPTION =
  "Generate business ideas, analyze markets, create strategic reports, and plan website blueprints from one focused AI dashboard.";

export const DEFAULT_KEYWORDS = [
  "AI business planning",
  "business idea generator",
  "market analysis AI",
  "AI reports",
  "website blueprint generator",
  "startup planning",
  "SaaS dashboard",
  "AI website builder",
  "AI marketing platform",
] as const;

export const SITE_ORGANIZATION = {
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  description: DEFAULT_DESCRIPTION,
  logoPath: "/icon.svg",
  email: "hello@trendbusiness.ai",
  sameAs: [] as string[],
} as const;

export const DEFAULT_LOCALE = "en";
export const DEFAULT_OG_LOCALE = "en_US";

/** Locales prepared for future multilingual expansion. */
export const SUPPORTED_LOCALES = [
  { code: "en", ogLocale: "en_US", hreflang: "en", label: "English", isDefault: true },
] as const;

export type SupportedLocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type PublicRouteEntry = {
  path: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
  /** Optional sitemap group for specialized sitemaps */
  group?: "core" | "tools" | "templates" | "blog" | "knowledge" | "legal";
  images?: Array<{ loc: string; title?: string }>;
};

/**
 * Canonical public route registry — single source of truth for sitemaps,
 * internal linking, and SEO indexing. Prefer /products/* over legacy /solutions/*.
 */
export const PUBLIC_ROUTES: readonly PublicRouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1, group: "core" },
  { path: "/features", changeFrequency: "weekly", priority: 0.9, group: "core" },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9, group: "core" },
  { path: "/about", changeFrequency: "monthly", priority: 0.8, group: "core" },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7, group: "core" },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7, group: "core" },
  { path: "/use-cases", changeFrequency: "weekly", priority: 0.8, group: "core" },
  { path: "/compare", changeFrequency: "weekly", priority: 0.75, group: "core" },
  { path: "/services", changeFrequency: "weekly", priority: 0.8, group: "core" },
  { path: "/industries", changeFrequency: "weekly", priority: 0.8, group: "core" },
  { path: "/countries", changeFrequency: "weekly", priority: 0.75, group: "core" },
  { path: "/products/create", changeFrequency: "weekly", priority: 0.9, group: "tools" },
  { path: "/products/design", changeFrequency: "weekly", priority: 0.9, group: "tools" },
  { path: "/products/content", changeFrequency: "weekly", priority: 0.9, group: "tools" },
  { path: "/products/business", changeFrequency: "weekly", priority: 0.9, group: "tools" },
  { path: "/products/website-builder", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/landing-page-builder", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/app-builder", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/logo-maker", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/brand-studio", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/image-generator", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/video-studio", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/content-studio", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/social-media-manager", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/marketing-ai", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/business-manager", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/business-intelligence", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/products/feasibility-study", changeFrequency: "monthly", priority: 0.85, group: "tools" },
  { path: "/templates", changeFrequency: "weekly", priority: 0.75, group: "templates" },
  { path: "/resources", changeFrequency: "weekly", priority: 0.7, group: "knowledge" },
  { path: "/learn", changeFrequency: "weekly", priority: 0.75, group: "knowledge" },
  { path: "/docs", changeFrequency: "weekly", priority: 0.8, group: "knowledge" },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6, group: "blog" },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.55, group: "core" },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2, group: "legal" },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2, group: "legal" },
] as const;

export function getSiteUrl(): string {
  return getOptionalSiteUrl();
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl().replace(/\/+$/, "");
  if (!path || path === "/") {
    return base;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";
}
