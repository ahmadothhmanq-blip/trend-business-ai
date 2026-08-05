import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";
import type {
  AwqeDimensionEvaluation,
  AwqeEvaluationResult,
  AwqeQualityScores,
} from "@/lib/ai-core/generation-engine/quality-engine/types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function evaluateBusiness(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 60;

  if (plan.business.offer) { score += 10; signals.push("clear offer"); }
  if (plan.audience.length >= 2) { score += 8; signals.push("defined audience"); }
  if (plan.goals.length >= 2) { score += 8; signals.push("business goals"); }
  if (plan.business.confidence >= 0.8) { score += 6; signals.push("high confidence"); }
  if (!plan.business.offer) issues.push("Missing business offer statement");

  return { dimension: "business", score: clampScore(score), signals, issues };
}

function evaluateConversion(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 55;

  if (plan.ctaStrategy.primary) { score += 15; signals.push("primary CTA"); }
  if (plan.ctaStrategy.secondary) { score += 8; signals.push("secondary CTA"); }
  if (plan.ctaStrategy.placement.length >= 2) { score += 10; signals.push("CTA placement"); }
  if (plan.businessFeatures.includes("forms")) { score += 8; signals.push("lead capture"); }
  if (!plan.sections.some((s) => s.type === "cta")) issues.push("No dedicated CTA section");

  return { dimension: "conversion", score: clampScore(score), signals, issues };
}

function evaluateContent(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 50;

  const blockCount = plan.sections.reduce((n, s) => n + s.contentBlocks.length, 0);
  if (blockCount >= 10) { score += 15; signals.push("rich content blocks"); }
  if (plan.contentStrategy.tone) { score += 10; signals.push("defined tone"); }
  if (plan.contentStrategy.blockCount >= 8) { score += 10; signals.push("content plan"); }
  if (plan.sections.some((s) => s.type === "faq")) { score += 8; signals.push("FAQ content"); }
  if (blockCount < 5) issues.push("Insufficient content blocks");

  return { dimension: "content", score: clampScore(score), signals, issues };
}

function evaluateUx(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 55;

  if (plan.navigation.length >= 3 && plan.navigation.length <= 7) {
    score += 12; signals.push("balanced navigation");
  }
  if (plan.sections.some((s) => s.type === "hero")) { score += 12; signals.push("hero section"); }
  if (plan.sections.some((s) => s.type === "footer")) { score += 8; signals.push("footer"); }
  if (plan.pages.length >= 3) { score += 8; signals.push("multi-page UX"); }
  if (plan.navigation.length > 8) issues.push("Navigation may be too complex");

  return { dimension: "ux", score: clampScore(score), signals, issues };
}

function evaluateAccessibility(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 60;

  if (plan.accessibilityTargets.wcagLevel === "AA") { score += 12; signals.push("WCAG AA"); }
  if (plan.accessibilityTargets.keyboardNavigation) { score += 10; signals.push("keyboard nav"); }
  if (plan.accessibilityTargets.screenReaderOptimized) { score += 10; signals.push("screen reader"); }
  if (plan.mediaStrategy.altTextRequired) { score += 8; signals.push("alt text required"); }
  if (plan.accessibilityTargets.colorContrastRatio < 4.5) {
    issues.push("Contrast ratio below WCAG AA minimum");
    score -= 10;
  }

  return { dimension: "accessibility", score: clampScore(score), signals, issues };
}

function evaluateSeo(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 55;

  if (plan.seoStrategy.targetKeywords.length >= 3) { score += 12; signals.push("target keywords"); }
  if (plan.seoStrategy.sitemap) { score += 8; signals.push("sitemap"); }
  if (plan.seoStrategy.structuredData.length >= 2) { score += 10; signals.push("structured data"); }
  if (plan.pages.some((p) => p.seoPriority === "high")) { score += 8; signals.push("SEO priority pages"); }
  if (plan.seoStrategy.priority !== "high") issues.push("SEO not marked high priority");

  return { dimension: "seo", score: clampScore(score), signals, issues };
}

function evaluateTrust(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 50;

  if (plan.trustStrategy.testimonials) { score += 12; signals.push("testimonials"); }
  if (plan.trustStrategy.trustBadges) { score += 10; signals.push("trust badges"); }
  if (plan.trustStrategy.stats) { score += 8; signals.push("stats"); }
  if (plan.legalPages.length >= 2) { score += 10; signals.push("legal pages"); }
  if (!plan.sections.some((s) => s.type === "testimonials" || s.type === "trust-badges")) {
    issues.push("No trust section on site");
  }

  return { dimension: "trust", score: clampScore(score), signals, issues };
}

function evaluateVisualHierarchy(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 55;

  const homeSections = plan.sections.filter((s) => {
    const page = plan.pages.find((p) => p.id === s.pageId);
    return page?.kind === "home";
  });
  const hero = homeSections.find((s) => s.type === "hero");
  if (hero && hero.order === 0) { score += 15; signals.push("hero first"); }
  if (homeSections.some((s) => s.type === "cta")) { score += 10; signals.push("home CTA"); }
  if (plan.brand.style) { score += 8; signals.push("brand style"); }
  if (!hero) issues.push("Missing hero for visual hierarchy");

  return { dimension: "visualHierarchy", score: clampScore(score), signals, issues };
}

function evaluatePerformance(plan: MasterPlan): AwqeDimensionEvaluation {
  const signals: string[] = [];
  const issues: string[] = [];
  let score = 60;

  if (plan.performanceTargets.lighthousePerformance >= 90) { score += 12; signals.push("performance target"); }
  if (plan.performanceTargets.firstContentfulPaintMs <= 1800) { score += 8; signals.push("FCP target"); }
  if (!plan.mediaStrategy.gallery || plan.mediaStrategy.altTextRequired) {
    score += 6; signals.push("image discipline");
  }
  if (plan.performanceTargets.largestContentfulPaintMs > 3000) {
    issues.push("LCP target may be too slow");
    score -= 8;
  }

  return { dimension: "performance", score: clampScore(score), signals, issues };
}

/** Evaluate all quality dimensions — deterministic, no LLM. */
export function evaluateQuality(plan: MasterPlan): AwqeEvaluationResult {
  const dimensions = [
    evaluateBusiness(plan),
    evaluateConversion(plan),
    evaluateContent(plan),
    evaluateUx(plan),
    evaluateAccessibility(plan),
    evaluateSeo(plan),
    evaluateTrust(plan),
    evaluateVisualHierarchy(plan),
    evaluatePerformance(plan),
  ];

  const scores: AwqeQualityScores = {
    business: dimensions.find((d) => d.dimension === "business")!.score,
    conversion: dimensions.find((d) => d.dimension === "conversion")!.score,
    content: dimensions.find((d) => d.dimension === "content")!.score,
    ux: dimensions.find((d) => d.dimension === "ux")!.score,
    accessibility: dimensions.find((d) => d.dimension === "accessibility")!.score,
    seo: dimensions.find((d) => d.dimension === "seo")!.score,
    performance: dimensions.find((d) => d.dimension === "performance")!.score,
    overall: 0,
  };

  scores.overall = clampScore(
    (scores.business + scores.conversion + scores.content + scores.ux +
      scores.accessibility + scores.seo + scores.performance) / 7,
  );

  return { dimensions, scores };
}
