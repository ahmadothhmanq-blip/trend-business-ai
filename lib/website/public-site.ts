/**
 * Production public-site HTML + SEO for hosted /w/{slug} URLs.
 * Keeps static hosting (no Next build) while exposing real meta, OG, JSON-LD.
 */

import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import {
  buildStaticPreviewHtml,
  extractStaticPreviewHtml,
  sanitizePreviewHtml,
  type StaticPreviewInput,
} from "@/lib/website/build-static-preview";
import { previewInputFromGeneration } from "@/lib/website/live-preview";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

function isGeneratedWebsiteProject(
  value: unknown,
): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

/** Strip executable scripts but keep JSON-LD for production SEO. */
export function sanitizePublicHtml(html: string): string {
  return html
    .replace(
      /<script\b(?![^>]*type\s*=\s*["']application\/ld\+json["'])[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    )
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function seoPackageFromGeneration(
  generation: WebsiteGeneration,
): CoreSeoPackage | null {
  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;
  return blueprint?.seoPackage ?? null;
}

/**
 * Inject title, meta description, Open Graph, Twitter, canonical, JSON-LD into HTML head.
 */
export function applySeoToPublicHtml(params: {
  html: string;
  seoPackage?: CoreSeoPackage | null;
  publicUrl: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}): string {
  const { html, seoPackage, publicUrl } = params;
  const title =
    seoPackage?.metadata.title?.trim() ||
    params.fallbackTitle?.trim() ||
    "Website";
  const description =
    seoPackage?.metadata.description?.trim() ||
    params.fallbackDescription?.trim() ||
    "";
  const keywords = (seoPackage?.keywords ?? seoPackage?.metadata.keywords ?? [])
    .filter(Boolean)
    .join(", ");
  const og = seoPackage?.openGraph;
  const twitter = seoPackage?.twitter ?? {
    card: "summary_large_image" as const,
    title,
    description,
    imageAlt: og?.imageAlt || title,
  };
  const canonical = publicUrl.replace(/\/$/, "") || "/";
  const robots = seoPackage?.metadata.robots || "index,follow";

  const metaTags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    keywords
      ? `<meta name="keywords" content="${escapeAttr(keywords)}" />`
      : "",
    `<meta name="robots" content="${escapeAttr(robots)}" />`,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    `<meta property="og:title" content="${escapeAttr(og?.title || title)}" />`,
    `<meta property="og:description" content="${escapeAttr(og?.description || description)}" />`,
    `<meta property="og:type" content="${escapeAttr(og?.type || "website")}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `<meta property="og:site_name" content="${escapeAttr(og?.siteName || title)}" />`,
    `<meta property="og:locale" content="${escapeAttr(og?.locale || "en_US")}" />`,
    og?.imageAlt
      ? `<meta property="og:image:alt" content="${escapeAttr(og.imageAlt)}" />`
      : "",
    `<meta name="twitter:card" content="${escapeAttr(twitter.card)}" />`,
    `<meta name="twitter:title" content="${escapeAttr(twitter.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(twitter.description)}" />`,
    twitter.imageAlt
      ? `<meta name="twitter:image:alt" content="${escapeAttr(twitter.imageAlt)}" />`
      : "",
  ]
    .filter(Boolean)
    .join("\n  ");

  const absoluteStructured = (seoPackage?.structuredData ?? []).map((item) => {
    const jsonLd = { ...item.jsonLd };
    if (typeof jsonLd.url === "string" && jsonLd.url.includes("example.com")) {
      jsonLd.url = canonical;
    }
    if (
      jsonLd.potentialAction &&
      typeof jsonLd.potentialAction === "object" &&
      jsonLd.potentialAction !== null &&
      "target" in jsonLd.potentialAction
    ) {
      const action = jsonLd.potentialAction as { target?: string };
      if (typeof action.target === "string" && action.target.includes("example.com")) {
        action.target = `${canonical}/search?q={search_term_string}`;
      }
    }
    return {
      type: item.type,
      jsonLd,
    };
  });

  const jsonLdBlocks = absoluteStructured
    .map(
      (item) =>
        `<script type="application/ld+json">${JSON.stringify(item.jsonLd)}</script>`,
    )
    .join("\n  ");

  let next = html;
  // Remove preview-oriented title/meta so we can replace cleanly
  next = next.replace(/<title[^>]*>[\s\S]*?<\/title>/i, "");
  next = next.replace(
    /<meta\s+name=["']description["'][^>]*>/gi,
    "",
  );
  next = next.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");

  if (/<\/head>/i.test(next)) {
    next = next.replace(
      /<\/head>/i,
      `  ${metaTags}\n  ${jsonLdBlocks}\n</head>`,
    );
  } else {
    next = `<!DOCTYPE html><html lang="en"><head>${metaTags}\n${jsonLdBlocks}</head><body>${next}</body></html>`;
  }

  // Soften preview footer for public sites
  next = next.replace(
    /Live product preview inside Trend Business AI[^<]*/gi,
    escapeHtml(`${title} · Powered by Trend Business AI`),
  );

  return sanitizePublicHtml(next);
}

export function buildPublicRobotsTxt(publicUrl: string): string {
  const base = publicUrl.replace(/\/$/, "");
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");
}

export function buildPublicSitemapXml(params: {
  publicUrl: string;
  seoPackage?: CoreSeoPackage | null;
}): string {
  const base = params.publicUrl.replace(/\/$/, "");
  const entries =
    params.seoPackage?.sitemap?.length
      ? params.seoPackage.sitemap
      : [{ path: "/", priority: 1, changefreq: "weekly" as const }];

  const urls = entries.map((entry) => {
    const path = entry.path === "/" ? "" : entry.path.startsWith("/")
      ? entry.path
      : `/${entry.path}`;
    // For static hosted sites, page anchors map to hash routes on the same URL
    const loc =
      path === "" || path === "/"
        ? base
        : `${base}#${path.replace(/^\//, "").replace(/\//g, "-")}`;
    return `  <url><loc>${escapeHtml(loc)}</loc><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`;
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

export function resolveProductionPublishHtml(
  generation: WebsiteGeneration,
  publicUrl: string,
): {
  html: string;
  robotsTxt: string;
  sitemapXml: string;
  seoPackage: CoreSeoPackage | null;
} {
  const input: StaticPreviewInput = previewInputFromGeneration(generation);
  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;
  const seoPackage = blueprint?.seoPackage ?? null;

  let html: string;
  if (blueprint?.files?.length) {
    html = extractStaticPreviewHtml(blueprint.files, input);
  } else {
    html = buildStaticPreviewHtml(input);
  }

  // extractStaticPreviewHtml already ran preview sanitize — re-apply SEO on top
  const withSeo = applySeoToPublicHtml({
    html: sanitizePreviewHtml(html),
    seoPackage,
    publicUrl,
    fallbackTitle: input.title || generation.project_name,
    fallbackDescription:
      input.description || generation.business_description || undefined,
  });

  return {
    html: withSeo,
    robotsTxt: buildPublicRobotsTxt(publicUrl),
    sitemapXml: buildPublicSitemapXml({ publicUrl, seoPackage }),
    seoPackage,
  };
}

/** Public hosted page headers — indexable, allows https/data images. */
export function publicSiteResponseHeaders(options?: {
  indexable?: boolean;
}): Record<string, string> {
  const indexable = options?.indexable !== false;
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline'; img-src data: https: blob:; font-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Robots-Tag": indexable ? "index, follow" : "noindex",
  };
}
