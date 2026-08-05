import type {
  Tbge2BusinessAnalysis,
  Tbge2ContentPlan,
  Tbge2IntentAnalysis,
  Tbge2PlanningPlan,
  Tbge2RequirementsAnalysis,
  Tbge2SectionType,
  Tbge2WebsitePlan,
} from "@/lib/ai-core/generation-engine/core/types";
import type {
  MasterPlanAccessibilityTargets,
  MasterPlanCtaStrategy,
  MasterPlanContentStrategy,
  MasterPlanFutureExpansion,
  MasterPlanLegalPage,
  MasterPlanMediaStrategy,
  MasterPlanPerformanceTargets,
  MasterPlanSeoStrategy,
  MasterPlanTrustStrategy,
} from "@/lib/ai-core/generation-engine/master-plan/types";

const SECTION_COMPONENT_MAP: Record<Tbge2SectionType, string> = {
  hero: "components/sections/hero-split.tsx",
  features: "components/sections/feature-grid.tsx",
  services: "components/sections/services-list.tsx",
  testimonials: "components/sections/testimonials-carousel.tsx",
  gallery: "components/sections/gallery-grid.tsx",
  pricing: "components/sections/pricing-table.tsx",
  faq: "components/sections/faq-accordion.tsx",
  cta: "components/sections/cta-banner.tsx",
  footer: "components/sections/site-footer.tsx",
  about: "components/sections/about-split.tsx",
  team: "components/sections/team-grid.tsx",
  stats: "components/sections/stats-row.tsx",
  process: "components/sections/process-steps.tsx",
  contact: "components/sections/contact-form.tsx",
  "blog-preview": "components/sections/blog-preview.tsx",
  menu: "components/sections/menu-grid.tsx",
  locations: "components/sections/locations-map.tsx",
  "portfolio-grid": "components/sections/portfolio-grid.tsx",
  integrations: "components/sections/integrations-logos.tsx",
  comparison: "components/sections/comparison-table.tsx",
  "trust-badges": "components/sections/trust-badges.tsx",
  newsletter: "components/sections/newsletter-signup.tsx",
};

export function resolveComponentForSection(type: Tbge2SectionType): string {
  return SECTION_COMPONENT_MAP[type] ?? "components/sections/feature-grid.tsx";
}

export function buildSeoStrategy(
  intent: Tbge2IntentAnalysis,
  business: Tbge2BusinessAnalysis,
  website: Tbge2WebsitePlan,
  requirements: Tbge2RequirementsAnalysis,
): MasterPlanSeoStrategy {
  const keywords = [
    business.industry,
    business.businessType,
    business.businessName ?? business.industry,
    ...business.goals.slice(0, 2),
  ].filter(Boolean) as string[];

  return {
    priority: requirements.required.includes("seo") ? "high" : "medium",
    targetKeywords: keywords,
    structuredData: ["Organization", "WebSite", intent.category === "restaurant" ? "Restaurant" : "LocalBusiness"],
    hreflang: requirements.required.includes("multi-language"),
    sitemap: true,
    localizedSlugs: requirements.required.includes("multi-language"),
  };
}

export function buildContentStrategy(content: Tbge2ContentPlan): MasterPlanContentStrategy {
  return {
    tone: content.tone,
    voice: content.voice,
    blockCount: content.blocks.length,
    llmOwnedFields: [
      "headlines",
      "subheadlines",
      "body copy",
      "descriptions",
      "titles",
      "texts",
      "meta descriptions",
      "faqs",
      "marketing copy",
      "cta labels",
    ],
    forbiddenLlmFields: [
      "pages",
      "sections",
      "navigation",
      "components",
      "business features",
      "website architecture",
      "industry",
      "language",
      "conversion strategy",
    ],
  };
}

export function buildMediaStrategy(
  intent: Tbge2IntentAnalysis,
  requirements: Tbge2RequirementsAnalysis,
  brandStyle: string,
): MasterPlanMediaStrategy {
  return {
    heroImage: true,
    gallery: requirements.required.includes("gallery"),
    teamPhotos: intent.category === "agency" || intent.category === "medical",
    productImages: requirements.required.includes("ecommerce"),
    imageStyle: brandStyle === "luxury" ? "cinematic" : brandStyle === "playful" ? "vibrant" : "professional",
    altTextRequired: true,
  };
}

export function buildCtaStrategy(
  website: Tbge2WebsitePlan,
  plan: Tbge2PlanningPlan,
): MasterPlanCtaStrategy {
  const homePage = plan.pages.find((p) => p.kind === "home");
  const heroSection = plan.sections.find((s) => s.type === "hero");
  const placement: MasterPlanCtaStrategy["placement"] = [];

  if (homePage && heroSection) {
    placement.push({ pageId: homePage.id, sectionId: heroSection.id });
  }

  const ctaSection = plan.sections.find((s) => s.type === "cta");
  if (homePage && ctaSection) {
    placement.push({ pageId: homePage.id, sectionId: ctaSection.id });
  }

  return {
    primary: website.primaryCta,
    secondary: website.secondaryCta,
    placement,
    conversionGoal: website.conversionStrategy,
  };
}

export function buildTrustStrategy(
  intent: Tbge2IntentAnalysis,
  requirements: Tbge2RequirementsAnalysis,
): MasterPlanTrustStrategy {
  return {
    testimonials: requirements.required.includes("testimonials"),
    trustBadges: intent.category === "medical" || intent.category === "legal" || intent.category === "saas",
    stats: intent.category === "saas" || intent.category === "agency",
    team: intent.category === "agency" || intent.category === "medical",
    caseStudies: intent.category === "agency" || intent.category === "saas",
    certifications: intent.category === "medical" || intent.category === "legal",
  };
}

export function buildLegalPages(requirements: Tbge2RequirementsAnalysis): MasterPlanLegalPage[] {
  const pages: MasterPlanLegalPage[] = [
    { id: "legal-privacy", kind: "privacy", path: "/privacy", required: true },
    { id: "legal-terms", kind: "terms", path: "/terms", required: true },
  ];

  if (requirements.required.includes("ecommerce") || requirements.required.includes("payments")) {
    pages.push({ id: "legal-cookies", kind: "cookies", path: "/cookies", required: true });
  }

  return pages;
}

export function buildPerformanceTargets(websiteType: Tbge2WebsitePlan["websiteType"]): MasterPlanPerformanceTargets {
  const isLanding = websiteType === "landing";
  return {
    lighthousePerformance: isLanding ? 95 : 90,
    lighthouseSeo: 95,
    lighthouseAccessibility: 90,
    firstContentfulPaintMs: isLanding ? 1200 : 1800,
    largestContentfulPaintMs: isLanding ? 2200 : 2800,
  };
}

export function buildAccessibilityTargets(): MasterPlanAccessibilityTargets {
  return {
    wcagLevel: "AA",
    keyboardNavigation: true,
    screenReaderOptimized: true,
    colorContrastRatio: 4.5,
    reducedMotionSupport: true,
  };
}

export function buildFutureExpansion(): MasterPlanFutureExpansion {
  return {
    phases: [
      { id: "phase-2-wiring", label: "Builder Wiring", description: "Wire Master Plan into website builder lifecycle", enabled: false },
      { id: "phase-3-multi-provider", label: "Multi-Provider", description: "OpenAI, Gemini, Claude, Grok execution", enabled: false },
      { id: "phase-4-growth", label: "Growth Strategy", description: "A/B testing, analytics integration", enabled: false },
    ],
    supportedProviders: ["deepseek", "openai", "gemini", "claude", "grok"],
  };
}
