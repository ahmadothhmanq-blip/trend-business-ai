/**
 * Build SEO metadata package from Strategy (+ industry intelligence / premium topics).
 */

import { buildKeywordPlan } from "@/lib/ai-core/seo-performance/keywords";
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
  CoreTwitterCardData,
} from "@/lib/ai-core/seo/types";

export type BuildSeoPackageInput = {
  strategy: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  language?: string;
  /** Optional site origin for absolute canonical URLs in schema */
  siteUrl?: string;
  industryId?: string | null;
  premiumSeoTopics?: string[];
  premiumKeywords?: string[];
  /** Hero photo URL from Advanced AI Assets Engine (OG / social). */
  heroImageUrl?: string | null;
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
  const sitemap = Array.isArray(strategy.sitemap) ? strategy.sitemap : [];
  const pages = Array.isArray(strategy.pages) ? strategy.pages : [];
  const paths = Array.from(
    new Set([
      "/",
      ...sitemap,
      ...pages.map((p) => (p.path.startsWith("/") ? p.path : `/${p.path}`)),
    ]),
  );

  return paths.map((path) => {
    const normalized = path === "" ? "/" : path;
    const isHome = normalized === "/";
    return {
      path: normalized,
      priority: isHome
        ? 1
        : normalized.split("/").filter(Boolean).length <= 1
          ? 0.8
          : 0.6,
      changefreq: (isHome ? "weekly" : "monthly") as CoreSitemapEntry["changefreq"],
    };
  });
}

function industrySchemaType(industryId?: string | null, industryLabel?: string): string | null {
  const raw = `${industryId || ""} ${industryLabel || ""}`.toLowerCase();
  if (raw.includes("restaurant") || raw.includes("food") || raw.includes("cafe")) {
    return "Restaurant";
  }
  if (raw.includes("real-estate") || raw.includes("real estate") || raw.includes("property")) {
    return "RealEstateAgent";
  }
  if (raw.includes("tourism") || raw.includes("travel") || raw.includes("tour")) {
    return "TravelAgency";
  }
  if (raw.includes("saas") || raw.includes("software")) {
    return "SoftwareApplication";
  }
  if (raw.includes("ecommerce") || raw.includes("shop") || raw.includes("store")) {
    return "Store";
  }
  if (raw.includes("auto") || raw.includes("vehicle") || raw.includes("car")) {
    return "AutomotiveBusiness";
  }
  if (raw.includes("clinic") || raw.includes("health") || raw.includes("medical")) {
    return "MedicalBusiness";
  }
  if (raw.includes("education") || raw.includes("school") || raw.includes("university")) {
    return "EducationalOrganization";
  }
  if (raw.includes("agency") || raw.includes("studio")) {
    return "ProfessionalService";
  }
  return "LocalBusiness";
}

function buildStructuredData(params: {
  strategy: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  metadata: CoreSeoMetadata;
  siteUrl?: string;
  industryId?: string | null;
  keywords: string[];
}): CoreStructuredDataItem[] {
  const { strategy, profile, metadata, siteUrl, industryId, keywords } = params;
  const name =
    profile?.projectName || metadata.title.split("|")[0]?.trim() || "Business";
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
      knowsAbout: keywords.slice(0, 8),
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
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: `${url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  };

  const verticalType = industrySchemaType(industryId, profile?.industry);
  const items = [organization, website];
  if (verticalType) {
    items.push({
      type: verticalType,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": verticalType,
        name,
        description,
        url,
        applicationCategory:
          verticalType === "SoftwareApplication"
            ? "BusinessApplication"
            : undefined,
        servesCuisine:
          verticalType === "Restaurant" ? profile?.offer || undefined : undefined,
        offers: profile?.offer
          ? {
              "@type": "Offer",
              description: profile.offer,
            }
          : undefined,
        areaServed: profile?.geography || undefined,
        knowsAbout: strategy.seoFocus?.slice?.(0, 6) ?? keywords.slice(0, 6),
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
  const { strategy, profile, language, siteUrl, industryId } = input;
  const brand = profile?.projectName || "Business";
  const positioning = strategy.positioning || profile?.summary || brand;

  const keywordPlan = buildKeywordPlan({
    strategy,
    profile,
    industryId,
    premiumSeoTopics: input.premiumSeoTopics,
    premiumKeywords: input.premiumKeywords,
  });

  const keywords = uniqueKeywords([
    keywordPlan.primary,
    ...keywordPlan.secondary,
    ...keywordPlan.longTail.slice(0, 3),
    ...keywordPlan.industryKeywords,
  ]);

  const title = truncate(`${brand} | ${keywordPlan.primary}`.replace(/\s+\|\s+$/, ""), 60);
  const description = truncate(
    `${positioning}${profile?.offer ? ` — ${profile.offer}` : ""}${
      keywordPlan.longTail[0] ? ` ${keywordPlan.longTail[0]}.` : ""
    }`.trim(),
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
    imageAlt: `${brand} — ${keywordPlan.primary}`,
    imagePath: input.heroImageUrl || "/og-image.jpg",
  };

  const twitter: CoreTwitterCardData = {
    card: "summary_large_image",
    title,
    description,
    imageAlt: openGraph.imageAlt,
  };

  const sitemap = buildSitemap(strategy);
  const structuredData = buildStructuredData({
    strategy,
    profile,
    metadata,
    siteUrl,
    industryId: industryId || keywordPlan.source,
    keywords,
  });

  return {
    metadata,
    openGraph,
    twitter,
    keywords,
    structuredData,
    sitemap,
    readiness: {
      passed: true,
      score: 100,
      issues: [],
      recommendations: [
        `Primary keyword: ${keywordPlan.primary}`,
        "Use one H1 with the primary keyword in the hero",
        "Keep meta title ≤60 and description ≤160 characters",
        "Ship sitemap.xml + robots.txt and Schema.org JSON-LD",
      ],
    },
    generatedAt: new Date().toISOString(),
  };
}

/** Serialize package for generated project helpers / JSON artifacts. */
export function seoPackageToSerializable(
  pkg: CoreSeoPackage,
): Record<string, unknown> {
  return {
    metadata: pkg.metadata,
    openGraph: pkg.openGraph,
    twitter: pkg.twitter ?? {
      card: "summary_large_image",
      title: pkg.openGraph.title,
      description: pkg.openGraph.description,
      imageAlt: pkg.openGraph.imageAlt,
    },
    keywords: pkg.keywords,
    structuredData: pkg.structuredData.map((s) => s.jsonLd),
    sitemap: pkg.sitemap,
    readiness: pkg.readiness,
    generatedAt: pkg.generatedAt,
  };
}
