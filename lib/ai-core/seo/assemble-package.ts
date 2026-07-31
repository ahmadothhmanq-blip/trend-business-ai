/**
 * Assemble CoreSeoPackage from strategy inputs — used by SAIE (EDS-006).
 * Downstream consumers should use runSeoAeoIntelligenceEngine() instead.
 */

import { buildKeywordPlan } from "@/lib/ai-core/seo-performance/keywords";
import { buildRichStructuredData } from "@/lib/ai-core/seo/rich-structured-data";
import type { AgencyGenerationContract } from "@/lib/ai-core/agency-orchestrator/types";
import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";
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

export type AssembleSeoPackageInput = {
  strategy: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  language?: string;
  siteUrl?: string;
  industryId?: string | null;
  premiumSeoTopics?: string[];
  premiumKeywords?: string[];
  heroImageUrl?: string | null;
  agencyContract?: AgencyGenerationContract | null;
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
  if (lang.startsWith("pt")) return "pt_BR";
  if (lang.startsWith("it")) return "it_IT";
  return "en_US";
}

function htmlLangFromLanguage(language?: string): string {
  const { htmlLang } = resolveLocaleFromLanguage(language);
  return htmlLang;
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
  if (raw.includes("law") || raw.includes("legal") || raw.includes("attorney")) {
    return "LegalService";
  }
  if (raw.includes("education") || raw.includes("school") || raw.includes("university")) {
    return "EducationalOrganization";
  }
  if (raw.includes("blog") || raw.includes("article") || raw.includes("news")) {
    return "Blog";
  }
  if (raw.includes("landing") || raw.includes("product launch")) {
    return "WebPage";
  }
  if (raw.includes("agency") || raw.includes("studio")) {
    return "ProfessionalService";
  }
  if (raw.includes("furniture")) {
    return "Store";
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
  language?: string;
}): CoreStructuredDataItem[] {
  const { strategy, profile, metadata, siteUrl, industryId, keywords, language } =
    params;
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
      inLanguage: htmlLangFromLanguage(language),
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

/** Low-level SEO package assembly — prefer runSeoAeoIntelligenceEngine(). */
export function assembleSeoPackage(input: AssembleSeoPackageInput): CoreSeoPackage {
  const { strategy, profile, language, siteUrl, industryId } = input;
  const brand = input.agencyContract?.brandKit.companyName || profile?.projectName || "Business";
  const positioning =
    input.agencyContract?.content.about.mission ||
    strategy.positioning ||
    profile?.summary ||
    brand;

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

  const title = input.agencyContract
    ? truncate(input.agencyContract.content.seo.title, 60)
    : truncate(`${brand} | ${keywordPlan.primary}`.replace(/\s+\|\s+$/, ""), 60);
  const description = input.agencyContract
    ? truncate(input.agencyContract.content.seo.description, 160)
    : truncate(
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
  const structuredData = input.agencyContract
    ? buildRichStructuredData({
        profile: input.agencyContract.businessIntelligence.profile,
        brandKit: input.agencyContract.brandKit,
        content: input.agencyContract.content,
        siteUrl: siteUrl || "https://example.com",
        language,
        pages: strategy.pages?.map((p) =>
          p.path.startsWith("/") ? p.path : `/${p.path}`,
        ),
      })
    : buildStructuredData({
        strategy,
        profile,
        metadata,
        siteUrl,
        industryId: industryId || keywordPlan.source,
        keywords,
        language,
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
