import type { MasterPlan, MasterPlanSection } from "@/lib/ai-core/generation-engine/master-plan/types";
import type {
  AwqeAccessibilitySpec,
  AwqeConversionSpec,
  AwqePerformanceSpec,
  AwqeSeoSpec,
  AwqeSpecPage,
  AwqeSpecSection,
} from "@/lib/ai-core/generation-engine/quality-engine/types";

export function optimizeSeo(
  plan: MasterPlan,
  sections: MasterPlanSection[],
): AwqeSeoSpec {
  const pageTitles: Record<string, string> = {};
  const headingHierarchy: Record<string, string[]> = {};

  for (const page of plan.pages) {
    const title = `${page.name} | ${plan.business.name}`;
    pageTitles[page.id] = title;
    headingHierarchy[page.id] = ["h1", "h2", "h3"];
  }

  const internalLinks = plan.navigation
    .filter((n) => n.href !== "/")
    .map((n) => ({
      from: plan.pages.find((p) => p.kind === "home")?.id ?? plan.pages[0]!.id,
      to: plan.pages.find((p) => p.path === n.href)?.id ?? "",
      label: n.label,
    }))
    .filter((l) => l.to);

  return {
    pageTitles,
    headingHierarchy,
    internalLinks,
    schemaRecommendations: plan.seoStrategy.structuredData,
    metadataRequirements: [
      "meta description per page",
      "canonical URL",
      "og:title",
      "og:description",
      plan.seoStrategy.hreflang ? "hreflang alternates" : "single-locale meta",
    ],
    targetKeywords: plan.seoStrategy.targetKeywords,
    contentDepthPolicy:
      plan.websiteType === "landing" ? "hero-focused" :
      plan.websiteType === "blog" ? "comprehensive" : "minimum-300-words-per-page",
  };
}

export function optimizeConversion(
  plan: MasterPlan,
  sections: MasterPlanSection[],
): AwqeConversionSpec {
  const ctaSections = sections.filter((s) => s.type === "cta" || s.type === "hero");
  const socialProof = sections.filter((s) =>
    s.type === "testimonials" || s.type === "trust-badges" || s.type === "stats",
  );

  return {
    primaryCta: plan.ctaStrategy.primary,
    secondaryCta: plan.ctaStrategy.secondary,
    leadCaptureSections: sections
      .filter((s) => s.type === "contact" || s.type === "newsletter")
      .map((s) => s.id),
    trustIndicators: socialProof.map((s) => s.id),
    urgencySignals: plan.websiteType === "ecommerce" || plan.websiteType === "saas"
      ? ["limited-time-offer", "free-trial"]
      : [],
    socialProofSections: sections.filter((s) => s.type === "testimonials").map((s) => s.id),
    ctaPlacements: ctaSections.map((s, i) => ({
      pageId: s.pageId,
      sectionId: s.id,
      priority: s.type === "hero" ? 1 : i + 2,
    })),
  };
}

export function optimizeAccessibility(
  plan: MasterPlan,
  sections: MasterPlanSection[],
): AwqeAccessibilitySpec {
  const headingStructure: Record<string, string[]> = {};
  for (const page of plan.pages) {
    const pageSections = sections.filter((s) => s.pageId === page.id).sort((a, b) => a.order - b.order);
    headingStructure[page.id] = pageSections.map((s, i) =>
      i === 0 ? "h1" : i < 3 ? "h2" : "h3",
    );
  }

  return {
    wcagLevel: plan.accessibilityTargets.wcagLevel,
    headingStructure,
    ariaRecommendations: sections.map((s) => ({
      sectionId: s.id,
      recommendation:
        s.type === "hero" ? "role=banner aria-label=Hero" :
        s.type === "footer" ? "role=contentinfo" :
        `aria-labelledby=${s.id}-heading`,
    })),
    contrastRequirements: {
      minimumRatio: plan.accessibilityTargets.colorContrastRatio,
      largeTextRatio: 3.0,
    },
    keyboardNavigationHints: [
      "Skip to main content link",
      "Focus visible on all interactive elements",
      plan.accessibilityTargets.keyboardNavigation ? "Tab order follows visual order" : "Verify tab order",
      plan.accessibilityTargets.reducedMotionSupport ? "Respect prefers-reduced-motion" : "Add reduced motion support",
    ],
  };
}

export function optimizePerformance(
  plan: MasterPlan,
  sections: MasterPlanSection[],
): AwqePerformanceSpec {
  const homePageId = plan.pages.find((p) => p.kind === "home")?.id ?? plan.pages[0]?.id;
  const homeSections = sections
    .filter((s) => s.pageId === homePageId)
    .sort((a, b) => a.order - b.order);

  const aboveTheFold = homeSections
    .filter((s) => s.order <= 1 || s.type === "hero")
    .map((s) => s.id);

  return {
    imageStrategy: plan.mediaStrategy.gallery ? "lazy-load-below-fold" : "eager-hero-only",
    lazyLoading: true,
    criticalContentSections: aboveTheFold,
    aboveTheFoldSections: aboveTheFold,
    targets: {
      lighthousePerformance: plan.performanceTargets.lighthousePerformance,
      firstContentfulPaintMs: plan.performanceTargets.firstContentfulPaintMs,
      largestContentfulPaintMs: plan.performanceTargets.largestContentfulPaintMs,
    },
  };
}

export function buildSpecPages(
  plan: MasterPlan,
  seo: AwqeSeoSpec,
): AwqeSpecPage[] {
  return plan.pages.map((page) => ({
    id: page.id,
    name: page.name,
    path: page.path,
    purpose: page.purpose,
    sections: page.sections,
    metaTitle: seo.pageTitles[page.id] ?? `${page.name} | ${plan.business.name}`,
    metaDescription: `${plan.business.offer ?? plan.business.industry} — ${page.purpose}`,
    headingHierarchy: seo.headingHierarchy[page.id] ?? ["h1", "h2"],
    internalLinks: seo.internalLinks
      .filter((l) => l.from === page.id || l.to === page.id)
      .map((l) => ({ label: l.label, href: plan.pages.find((p) => p.id === l.to)?.path ?? "/" })),
    contentDepth: page.seoPriority === "high" ? "deep" : page.seoPriority === "medium" ? "medium" : "shallow",
    seoPriority: page.seoPriority,
  }));
}

export function buildSpecSections(
  sections: MasterPlanSection[],
  performance: AwqePerformanceSpec,
  accessibility: AwqeAccessibilitySpec,
): AwqeSpecSection[] {
  return sections.map((section) => ({
    ...section,
    aboveTheFold: performance.aboveTheFoldSections.includes(section.id),
    ariaLabel: accessibility.ariaRecommendations.find((a) => a.sectionId === section.id)?.recommendation,
  }));
}
