/**
 * Build SEO metadata package from Strategy (+ optional profile / generation signals).
 */

import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type {
  CoreOpenGraphData,
  CoreSeoMetadata,
  CoreSeoPackage,
  CoreSitemapEntry,
  CoreStructuredDataItem,
} from "@/lib/ai-core/seo/types";

export type BuildSeoPackageInput = {
  strategy: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  language?: string;
  /** Optional site origin for absolute canonical URLs in schema */
  siteUrl?: string;
};

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function uniqueKeywords(values: string[], limit = 16): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const k = raw.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(raw.trim());
    if (out.length >= limit) break;
  }
  return out;
}

function localeFromLanguage(language?: string): string {
  const lang = (language || "en").toLowerCase();
  if (lang.startsWith("ar")) return "ar_SA";
  if (lang.startsWith("fr")) return "fr_FR";
  if (lang.startsWith("de")) return "de_DE";
  if (lang.startsWith("es")) return "es_ES";
  return "en_US";
}

function buildSitemap(strategy: CoreProductStrategy): CoreSitemapEntry[] {
  const paths = Array.from(
    new Set([
      "/",
      ...strategy.sitemap,
      ...strategy.pages.map((p) => (p.path.startsWith("/") ? p.path : `/${p.path}`)),
    ]),
  );

  return paths.map((path) => {
    const normalized = path === "" ? "/" : path;
    const isHome = normalized === "/";
    return {
      path: normalized,
      priority: isHome ? 1 : normalized.split("/").filter(Boolean).length <= 1 ? 0.8 : 0.6,
      changefreq: (isHome ? "weekly" : "monthly") as CoreSitemapEntry["changefreq"],
    };
  });
}

function buildStructuredData(params: {
  strategy: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  metadata: CoreSeoMetadata;
  siteUrl?: string;
}): CoreStructuredDataItem[] {
  const { strategy, profile, metadata, siteUrl } = params;
  const name = profile?.projectName || metadata.title.split("|")[0]?.trim() || "Business";
  const description = metadata.description;
  const url = siteUrl || "https://example.com";

  const organization: CoreStructuredDataItem = {
    type: "Organization",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      description,
      url,
      areaServed: profile?.geography || undefined,
      knowsAbout: strategy.seoFocus.slice(0, 8),
    },
  };

  const website: CoreStructuredDataItem = {
    type: "WebSite",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name,
      description,
      url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  };

  const industry = (profile?.industry || "").toLowerCase();
  const localTypes =
    industry.includes("restaurant") || industry.includes("real estate")
      ? "LocalBusiness"
      : industry.includes("ecommerce") || industry.includes("shop")
        ? "Store"
        : industry.includes("saas") || industry.includes("software")
          ? "SoftwareApplication"
          : null;

  const items = [organization, website];
  if (localTypes) {
    items.push({
      type: localTypes,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": localTypes,
        name,
        description,
        url,
        applicationCategory:
          localTypes === "SoftwareApplication" ? "BusinessApplication" : undefined,
        offers: profile?.offer
          ? {
              "@type": "Offer",
              description: profile.offer,
            }
          : undefined,
      },
    });
  }

  return items;
}

/**
 * Deterministic SEO package from Strategy — adapters may refine further.
 */
export function buildSeoPackageFromStrategy(
  input: BuildSeoPackageInput,
): CoreSeoPackage {
  const { strategy, profile, language, siteUrl } = input;
  const brand = profile?.projectName || "Business";
  const positioning = strategy.positioning || profile?.summary || brand;
  const primaryKeyword =
    strategy.seoFocus[0] ||
    strategy.contentStrategy.seoTopics[0] ||
    profile?.industry ||
    brand;

  const keywords = uniqueKeywords([
    ...strategy.seoFocus,
    ...strategy.contentStrategy.seoTopics,
    brand,
    profile?.industry || "",
    profile?.offer || "",
    ...strategy.ctas.slice(0, 2),
  ]);

  const title = truncate(
    `${brand} | ${primaryKeyword}`.replace(/\s+\|\s+$/, ""),
    60,
  );
  const description = truncate(
    `${positioning} ${profile?.offer ? `— ${profile.offer}` : ""}`.trim(),
    160,
  );

  const metadata: CoreSeoMetadata = {
    title,
    description,
    keywords,
    canonicalPath: "/",
    robots: "index,follow",
  };

  const openGraph: CoreOpenGraphData = {
    title,
    description,
    type: "website",
    siteName: brand,
    locale: localeFromLanguage(language),
    imageAlt: `${brand} hero visual`,
  };

  const sitemap = buildSitemap(strategy);
  const structuredData = buildStructuredData({
    strategy,
    profile,
    metadata,
    siteUrl,
  });

  return {
    metadata,
    openGraph,
    keywords,
    structuredData,
    sitemap,
    readiness: {
      passed: true,
      score: 100,
      issues: [],
    },
    generatedAt: new Date().toISOString(),
  };
}

/** Serialize package for generated project helpers / JSON artifacts. */
export function seoPackageToSerializable(pkg: CoreSeoPackage): Record<string, unknown> {
  return {
    metadata: pkg.metadata,
    openGraph: pkg.openGraph,
    keywords: pkg.keywords,
    structuredData: pkg.structuredData.map((s) => s.jsonLd),
    sitemap: pkg.sitemap,
    readiness: pkg.readiness,
    generatedAt: pkg.generatedAt,
  };
}
