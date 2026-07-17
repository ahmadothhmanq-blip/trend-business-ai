import { MARKETING_PRODUCTS, REF_FAQ } from "@/lib/constants/marketing-content";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";
import type { CompetitorIntelligenceReport } from "@/types/ai-search";

type CompetitorDef = {
  name: string;
  category: string;
  strengths: string[];
  weaknesses: string[];
  capabilities: string[];
};

/**
 * Competitor capability matrix — qualitative product intelligence,
 * compared against live MARKETING_PRODUCTS + programmatic coverage.
 */
const COMPETITORS: CompetitorDef[] = [
  {
    name: "Wix",
    category: "Website builder",
    strengths: ["Polished site editor", "Hosting", "App market"],
    weaknesses: ["Limited AI business planning depth", "Weak multi-product AI suite"],
    capabilities: ["website-builder", "landing-page-builder"],
  },
  {
    name: "Webflow",
    category: "Design-first websites",
    strengths: ["Designer control", "CMS", "Interactions"],
    weaknesses: ["Steeper learning curve", "No full AI brand/content/business suite"],
    capabilities: ["website-builder", "landing-page-builder"],
  },
  {
    name: "Framer",
    category: "Marketing sites",
    strengths: ["Fast visual building", "Motion", "Modern aesthetics"],
    weaknesses: ["Narrower business intelligence", "Limited feasibility/strategy AI"],
    capabilities: ["website-builder", "landing-page-builder"],
  },
  {
    name: "Lovable",
    category: "AI app builder",
    strengths: ["AI app generation speed", "Developer-friendly outputs"],
    weaknesses: ["Less brand/marketing depth", "Limited SEO/AEO knowledge center"],
    capabilities: ["app-builder", "website-builder"],
  },
  {
    name: "Bolt",
    category: "AI coding workspace",
    strengths: ["Rapid prototyping", "Code-centric generation"],
    weaknesses: ["Not a full GTM/brand suite", "Limited business planning products"],
    capabilities: ["app-builder"],
  },
  {
    name: "v0",
    category: "UI generation",
    strengths: ["Component generation", "Design system speed"],
    weaknesses: ["UI-focused", "No market/feasibility/CRM growth stack"],
    capabilities: ["app-builder", "landing-page-builder"],
  },
  {
    name: "Canva",
    category: "Creative design",
    strengths: ["Massive template library", "Brand kits", "Easy creative"],
    weaknesses: ["Not a full AI business OS", "Limited technical SEO/AEO tooling"],
    capabilities: ["logo-maker", "brand-studio", "image-generator", "content-studio"],
  },
  {
    name: "HubSpot",
    category: "CRM + marketing",
    strengths: ["CRM maturity", "Marketing automation", "Analytics"],
    weaknesses: ["Heavier implementation", "Weaker AI website/brand generation suite"],
    capabilities: ["marketing-ai", "content-studio", "business-intelligence"],
  },
];

export function buildCompetitorIntelligence(): CompetitorIntelligenceReport {
  const ourSlugs = MARKETING_PRODUCTS.map((p) => p.slug);
  const ourCoverage = MARKETING_PRODUCTS.map((p) => p.title);
  const programmatic = getPublishedProgrammaticPages();

  const competitors = COMPETITORS.map((competitor) => {
    const overlap = competitor.capabilities.filter((cap) => ourSlugs.includes(cap as (typeof ourSlugs)[number]));
    const missingVsUs = ourSlugs.filter((slug) => !competitor.capabilities.includes(slug));
    const opportunities: string[] = [];

    if (missingVsUs.includes("feasibility-study")) {
      opportunities.push(`Own “AI feasibility study” demand vs ${competitor.name}.`);
    }
    if (missingVsUs.includes("business-intelligence")) {
      opportunities.push(`Position integrated BI + creation against ${competitor.name}.`);
    }
    if (competitor.capabilities.includes("website-builder") && programmatic.length) {
      opportunities.push(`Publish comparison pages: Trend Business AI vs ${competitor.name}.`);
    }
    if (REF_FAQ.length && competitor.name !== "HubSpot") {
      opportunities.push(`Expand AEO FAQ clusters that ${competitor.name} does not own.`);
    }

    return {
      name: competitor.name,
      category: competitor.category,
      strengths: competitor.strengths,
      weaknesses: competitor.weaknesses,
      overlap: overlap.map((slug) => MARKETING_PRODUCTS.find((p) => p.slug === slug)?.title ?? slug),
      missingVsUs: missingVsUs
        .map((slug) => MARKETING_PRODUCTS.find((p) => p.slug === slug)?.title ?? slug)
        .slice(0, 8),
      opportunities: opportunities.slice(0, 4),
    };
  });

  const platformGaps: string[] = [];
  const comparisonPages = programmatic.filter((p) => p.cluster === "comparisons");
  if (comparisonPages.length < COMPETITORS.length / 2) {
    platformGaps.push("Expand published comparison pages against major AI builders and design platforms.");
  }
  if (!ourSlugs.includes("social-media-manager" as never) && !MARKETING_PRODUCTS.some((p) => p.slug === "social-media-manager")) {
    platformGaps.push("Ensure social media product marketing page remains visible in competitive narratives.");
  }
  platformGaps.push("Ship dedicated AEO/GEO educational content to differentiate from pure builders.");

  const recommendations = [
    ...platformGaps,
    "Create use-case pages for agency and SaaS buyers evaluating Wix/Webflow/Framer alternatives.",
    "Use Competitor Intelligence opportunities to prioritize programmatic comparison drafts.",
    "Highlight unified AI Search Center + Growth Engine as category-defining advantages.",
  ];

  return {
    generatedAt: new Date().toISOString(),
    ourCoverage,
    competitors,
    platformGaps,
    recommendations: recommendations.slice(0, 12),
  };
}
