/**
 * Generate SEO titles, meta, FAQs, schema, alt text + applyable fixes.
 */

import { buildSeoPackageFromStrategy } from "@/lib/ai-core/seo/build";
import type { CoreSeoPackage, CoreStructuredDataItem } from "@/lib/ai-core/seo/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { SeoAnalysisReport } from "@/lib/ai-core/seo-analysis/types";
import type {
  SeoFix,
  SeoGeneratedAssets,
  SeoOptimizerResult,
} from "@/lib/ai-core/seo-optimizer/types";

export type RunSeoOptimizerParams = {
  analysis: SeoAnalysisReport;
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string | null;
  existingSeoPackage?: CoreSeoPackage | null;
  language?: string;
  siteUrl?: string;
  heroImageUrl?: string | null;
};

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function buildFaqItems(params: {
  brand: string;
  primary: string;
  offer?: string;
  geography?: string;
}): Array<{ question: string; answer: string }> {
  const { brand, primary, offer, geography } = params;
  return [
    {
      question: `What does ${brand} offer?`,
      answer: `${brand} specializes in ${primary}${
        offer ? ` — ${offer}` : ""
      }. Visitors can explore services and contact the team for a tailored next step.`,
    },
    {
      question: `Who is ${brand} for?`,
      answer: `${brand} is built for customers seeking ${primary}${
        geography ? ` in ${geography}` : ""
      }. Clear pricing, proof, and contact paths help visitors decide faster.`,
    },
    {
      question: `How do I get started with ${brand}?`,
      answer: `Use the primary call-to-action on the homepage to book a consult or request a quote. The team responds with next steps aligned to your goals.`,
    },
    {
      question: `Why choose ${brand} for ${primary}?`,
      answer: `${brand} combines specialist expertise, transparent process, and conversion-focused web experience so prospects can evaluate fit quickly.`,
    },
  ];
}

function enhanceStructuredData(
  pkg: CoreSeoPackage,
  faqs: Array<{ question: string; answer: string }>,
  profile?: CoreBusinessProfile,
  industryId?: string | null,
): CoreStructuredDataItem[] {
  const existing = [...(pkg.structuredData || [])];
  const types = new Set(existing.map((i) => i.type));
  const brand = profile?.projectName || pkg.metadata.title.split("|")[0]?.trim() || "Business";
  const url = "https://example.com";

  if (!types.has("FAQPage")) {
    existing.push({
      type: "FAQPage",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        })),
      },
    });
  }

  if (!types.has("Product") && !types.has("SoftwareApplication")) {
    const industry = (industryId || profile?.industry || "").toLowerCase();
    if (industry.includes("saas") || industry.includes("software") || industry.includes("tech")) {
      existing.push({
        type: "SoftwareApplication",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: brand,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: pkg.metadata.description,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      });
    } else if (
      industry.includes("ecommerce") ||
      industry.includes("shop") ||
      industry.includes("store")
    ) {
      existing.push({
        type: "Product",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Product",
          name: brand,
          description: pkg.metadata.description,
          brand: { "@type": "Brand", name: brand },
        },
      });
    }
  }

  if (!types.has("LocalBusiness") && profile?.geography) {
    existing.push({
      type: "LocalBusiness",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: brand,
        description: pkg.metadata.description,
        url,
        areaServed: profile.geography,
        knowsAbout: pkg.keywords.slice(0, 8),
      },
    });
  }

  // Enrich Organization with brand knowledge signals
  const org = existing.find((i) => i.type === "Organization");
  if (org) {
    org.jsonLd = {
      ...org.jsonLd,
      knowsAbout: pkg.keywords.slice(0, 10),
      areaServed: profile?.geography || org.jsonLd.areaServed,
      slogan: profile?.offer || org.jsonLd.slogan,
      sameAs: Array.isArray(org.jsonLd.sameAs) ? org.jsonLd.sameAs : [],
    };
  }

  return existing;
}

/**
 * Produce optimized SEO assets and Apply Fix payloads from an analysis report.
 */
export function runSeoOptimizer(params: RunSeoOptimizerParams): SeoOptimizerResult {
  const { analysis, strategy, profile } = params;
  const brand = profile?.projectName || "Business";
  const plan = analysis.keywordPlan;
  const primary = plan.primary;

  const fallbackStrategy: CoreProductStrategy = strategy || {
    positioning: profile?.summary || `${brand} — ${primary}`,
    sitemap: ["/", "/about", "/contact", "/pricing"],
    pages: [
      {
        name: "Home",
        path: "/",
        purpose: "Primary landing",
        keySections: ["hero", "services", "faq"],
      },
      {
        name: "About",
        path: "/about",
        purpose: "Brand story",
        keySections: ["about"],
      },
      {
        name: "Contact",
        path: "/contact",
        purpose: "Conversion",
        keySections: ["contact"],
      },
    ],
    sectionPlan: [],
    conversionFunnel: ["visit", "engage", "convert"],
    contentStructure: ["hero", "services", "proof", "faq", "cta"],
    contentStrategy: {
      brandVoice: "professional",
      messagingPillars: [primary, ...plan.secondary.slice(0, 2)],
      proofPoints: [profile?.offer || primary],
      objectionHandlers: ["Clear pricing", "Fast response"],
      seoTopics: [primary, ...plan.longTail.slice(0, 3)],
    },
    ctas: ["Get started", "Contact us"],
    seoFocus: [primary, ...plan.secondary.slice(0, 4)],
  };

  let seoPackage = buildSeoPackageFromStrategy({
    strategy: fallbackStrategy,
    profile: profile || undefined,
    language: params.language,
    siteUrl: params.siteUrl,
    industryId: params.industryId,
    premiumKeywords: plan.secondary,
    premiumSeoTopics: plan.longTail,
    heroImageUrl: params.heroImageUrl,
  });

  // Prefer freshly optimized meta
  const seoTitle = truncate(`${brand} | ${primary}`, 60);
  const metaDescription = truncate(
    `${profile?.summary || fallbackStrategy.positioning || brand}. ${
      profile?.offer || `Expert ${primary}`
    }${profile?.geography ? ` serving ${profile.geography}` : ""}. Get started today.`.trim(),
    160,
  );

  seoPackage = {
    ...seoPackage,
    metadata: {
      ...seoPackage.metadata,
      title: seoTitle,
      description: metaDescription,
      keywords: [primary, ...plan.secondary, ...plan.longTail.slice(0, 3)].slice(0, 16),
    },
    openGraph: {
      ...seoPackage.openGraph,
      title: seoTitle,
      description: metaDescription,
      imageAlt: `${brand} — ${primary}`,
    },
    twitter: seoPackage.twitter
      ? {
          ...seoPackage.twitter,
          title: seoTitle,
          description: metaDescription,
          imageAlt: `${brand} — ${primary}`,
        }
      : undefined,
    keywords: [primary, ...plan.secondary, ...plan.longTail.slice(0, 4)].slice(0, 16),
  };

  const faqItems = buildFaqItems({
    brand,
    primary,
    offer: profile?.offer,
    geography: profile?.geography,
  });

  seoPackage = {
    ...seoPackage,
    structuredData: enhanceStructuredData(
      seoPackage,
      faqItems,
      profile || undefined,
      params.industryId,
    ),
  };

  const blogSuggestions = [
    `How to choose the right ${primary} partner in ${new Date().getFullYear()}`,
    `${brand} guide: ${plan.longTail[0] || primary} explained`,
    `Top mistakes buyers make with ${primary}`,
    `FAQ: ${primary} costs, timelines, and results`,
    `Case study outline: results with ${brand}`,
  ];

  const imageAltTexts = [
    { target: "hero", alt: `${brand} ${primary} hero visual` },
    { target: "services", alt: `${brand} ${primary} services overview` },
    { target: "about", alt: `${brand} team and brand story` },
    { target: "cta", alt: `Contact ${brand} for ${primary}` },
  ];

  const assets: SeoGeneratedAssets = {
    seoTitle,
    metaDescription,
    targetKeywords: seoPackage.keywords,
    keywordPlan: plan,
    blogSuggestions,
    faqItems,
    imageAltTexts,
    structuredDataTypes: seoPackage.structuredData.map((s) => s.type),
    seoPackage,
  };

  const fixes: SeoFix[] = [
    {
      id: "fix-seo-title",
      title: "Apply optimized SEO title",
      detail: seoTitle,
      applyMode: "seo-package",
      injectSeoPackage: true,
      category: "title",
    },
    {
      id: "fix-meta-description",
      title: "Apply optimized meta description",
      detail: metaDescription,
      applyMode: "seo-package",
      injectSeoPackage: true,
      category: "meta",
    },
    {
      id: "fix-keywords",
      title: "Apply target keyword set",
      detail: assets.targetKeywords.slice(0, 8).join(", "),
      applyMode: "seo-package",
      injectSeoPackage: true,
      category: "keywords",
      command: `Strengthen on-page SEO for primary keyword “${primary}” in the hero H1 and intro paragraph without keyword stuffing.`,
      actions: [
        {
          type: "rewrite-content",
          target: "hero",
          notes: `Include primary keyword “${primary}” naturally in headline and subcopy.`,
        },
      ],
    },
    {
      id: "fix-faq-section",
      title: "Add FAQ section for SEO + AI search",
      detail: `${faqItems.length} FAQ items ready`,
      applyMode: "both",
      injectSeoPackage: true,
      category: "faq",
      command:
        "Add an FAQ accordion section near the bottom of the homepage with clear questions and concise answers that reinforce trust and SEO.",
      actions: [
        {
          type: "add-section",
          sectionKind: "faq",
          componentId: "FaqAccordion",
          notes: faqItems.map((f) => `${f.question}`).join(" | "),
        },
      ],
    },
    {
      id: "fix-faq-schema",
      title: "Inject FAQPage structured data",
      detail: "FAQPage JSON-LD for Google + AI Overviews",
      applyMode: "seo-package",
      injectSeoPackage: true,
      category: "schema",
    },
    {
      id: "fix-schema-pack",
      title: "Inject Organization / Product / Local schema pack",
      detail: assets.structuredDataTypes.join(", "),
      applyMode: "seo-package",
      injectSeoPackage: true,
      category: "schema",
    },
    {
      id: "fix-image-alt",
      title: "Apply image alt text recommendations",
      detail: imageAltTexts.map((i) => i.alt).join(" · "),
      applyMode: "editor",
      category: "images",
      command:
        "Ensure hero and key section images use descriptive alt text that includes the brand and primary service keyword.",
      actions: [
        {
          type: "rewrite-content",
          notes: imageAltTexts.map((i) => `${i.target}: ${i.alt}`).join("; "),
        },
      ],
    },
    {
      id: "fix-ai-search",
      title: "Optimize for AI search engines",
      detail:
        "Entity clarity + FAQ schema + brand knowledge signals for Google AI Overviews, ChatGPT, Gemini, Perplexity",
      applyMode: "both",
      injectSeoPackage: true,
      category: "ai-search",
      command:
        "Improve About and trust copy so the brand entity, offer, and geography are explicit for AI search citation.",
      actions: [
        {
          type: "rewrite-content",
          target: "about",
          notes: "Clarify who we are, what we offer, and who we serve.",
        },
        {
          type: "add-section",
          sectionKind: "faq",
          componentId: "FaqAccordion",
        },
      ],
    },
    {
      id: "fix-entity-brand",
      title: "Strengthen brand entity signals",
      detail: "Organization knowsAbout + areaServed + slogan",
      applyMode: "seo-package",
      injectSeoPackage: true,
      category: "ai-search",
    },
    {
      id: "fix-headings",
      title: "Fix heading structure",
      detail: "Single H1 + supporting H2s",
      applyMode: "editor",
      category: "content",
      command:
        "Ensure the homepage has exactly one H1 with the primary keyword and clear H2s for services, proof, and FAQ.",
      actions: [{ type: "improve-layout", notes: "Heading hierarchy for SEO" }],
    },
    {
      id: "fix-internal-links",
      title: "Improve internal links",
      detail: "Link to pricing, services, about, contact",
      applyMode: "editor",
      category: "technical",
      command:
        "Add clear internal links from the homepage hero and footer to Pricing, Services, About, and Contact pages.",
      actions: [{ type: "improve-conversion", notes: "Internal linking for SEO journeys" }],
    },
    {
      id: "fix-page-speed",
      title: "Page speed guidance apply",
      detail: "Lazy-load and compress media cues",
      applyMode: "editor",
      category: "technical",
      command:
        "Optimize media for performance: ensure below-fold images can lazy-load and hero media stays lightweight.",
      actions: [{ type: "improve-layout", notes: "Performance-oriented media structure" }],
    },
    {
      id: "fix-mobile-seo",
      title: "Mobile SEO improvements",
      detail: "Responsive CTA and typography",
      applyMode: "editor",
      category: "technical",
      command:
        "Improve mobile UX for SEO: larger tap targets on primary CTAs and readable hero typography on small screens.",
      actions: [{ type: "improve-layout", notes: "Mobile SEO layout polish" }],
    },
  ];

  // Attach perf-* passthrough fixes as editor rewrites
  for (const iss of analysis.issues) {
    if (iss.fixId?.startsWith("perf-") && !fixes.some((f) => f.id === iss.fixId)) {
      fixes.push({
        id: iss.fixId,
        title: iss.title,
        detail: iss.recommendation,
        applyMode: "editor",
        category: "technical",
        command: iss.recommendation,
        actions: [{ type: "rewrite-content", notes: iss.detail }],
      });
    }
  }

  return {
    assets,
    fixes,
    summary: `Generated SEO title, meta, ${assets.targetKeywords.length} keywords, ${faqItems.length} FAQs, and schema types: ${assets.structuredDataTypes.join(", ")}.`,
    generatedAt: new Date().toISOString(),
  };
}

/** Resolve a fix by id from optimizer result. */
export function getSeoFix(
  result: SeoOptimizerResult,
  fixId: string,
): SeoFix | null {
  return result.fixes.find((f) => f.id === fixId) ?? null;
}
