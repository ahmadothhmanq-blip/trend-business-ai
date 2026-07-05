import { getOptionalSiteUrl } from "@/lib/env";

export const SITE_NAME = "Trend Business AI";

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
] as const;

/** Public routes included in the sitemap. */
export const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/signup", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/forgot-password", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.2 },
] as const;

export function getSiteUrl(): string {
  return getOptionalSiteUrl();
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") {
    return base;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
