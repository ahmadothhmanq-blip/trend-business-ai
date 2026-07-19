import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import { detectConversionGoal } from "@/lib/ai-core/conversion/goals";
import { getIndustryConversionRules } from "@/lib/ai-core/conversion/rules";
import type {
  ConversionGoalDetection,
  ConversionOptimizationReport,
  ConversionRecommendation,
  IndustryConversionRule,
} from "@/lib/ai-core/conversion/types";

function corpus(files: GeneratedProjectFile[], strategy?: CoreProductStrategy) {
  const fileText = files
    .filter((f) => /\.(tsx?|jsx?|md|css)$/i.test(f.path))
    .map((f) => f.content)
    .join("\n")
    .toLowerCase();
  const strategyText = [
    strategy?.positioning,
    ...(strategy?.ctas ?? []),
    ...(strategy?.conversionFunnel ?? []),
    ...(strategy?.contentStructure ?? []),
    ...(strategy?.sectionPlan ?? []).map(
      (s) => `${s.name} ${s.goal} ${s.contentNotes}`,
    ),
    ...(strategy?.pages ?? []).map(
      (p) => `${p.name} ${p.purpose} ${(p.keySections ?? []).join(" ")} ${p.primaryCta ?? ""}`,
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return `${fileText}\n${strategyText}`;
}

function hasAny(text: string, needles: string[]): boolean {
  return needles.some((n) => text.includes(n.toLowerCase()));
}

function countCtas(text: string): number {
  const patterns = [
    /book\s*(now|a|your)?/g,
    /get\s*started/g,
    /contact\s*(us)?/g,
    /request\s*(a\s*)?(demo|quote|consultation|viewing|info)/g,
    /start\s*(free\s*)?trial/g,
    /shop\s*now/g,
    /reserve/g,
    /inquire|enquiry/g,
    /sign\s*up/g,
    /apply\s*now/g,
  ];
  let count = 0;
  for (const re of patterns) {
    const m = text.match(re);
    if (m) count += m.length;
  }
  return count;
}

function heroStrength(text: string, rules: IndustryConversionRule): ConversionRecommendation[] {
  const out: ConversionRecommendation[] = [];
  const hasHero = /hero|min-h-\[|min-h-screen|full-bleed/i.test(text);
  if (!hasHero) {
    out.push({
      id: "hero-missing",
      area: "hero",
      severity: "critical",
      title: "Hero section is weak or missing",
      detail: "Visitors need an immediate value proposition and CTA in the first viewport.",
      action: rules.heroGuidance,
      target: "Hero",
    });
  } else if (!hasAny(text, ["cta", "get started", "book", "contact", "trial", "shop", "reserve", "inquire"])) {
    out.push({
      id: "hero-cta",
      area: "hero",
      severity: "major",
      title: "Hero lacks a clear primary CTA",
      detail: "A strong hero without a next step loses conversion intent.",
      action: rules.heroGuidance,
      target: "Hero",
    });
  }
  return out;
}

function ctaPlacement(
  text: string,
  goal: ConversionGoalDetection,
): ConversionRecommendation[] {
  const out: ConversionRecommendation[] = [];
  const ctaCount = countCtas(text);
  if (ctaCount < 2) {
    out.push({
      id: "cta-sparse",
      area: "cta",
      severity: "critical",
      title: "CTA placement is too sparse",
      detail: `Only ~${ctaCount} conversion CTA signals found across the site.`,
      action:
        goal.goal === "bookings"
          ? "Add booking CTAs in hero, mid-page, and closing band."
          : goal.goal === "sales"
            ? "Add Shop / Buy CTAs near products and in a closing offer band."
            : "Add primary CTAs in hero, after proof, and before the footer.",
    });
  } else if (ctaCount < 4) {
    out.push({
      id: "cta-mid",
      area: "cta",
      severity: "major",
      title: "Add mid-funnel CTA reinforcement",
      detail: "Conversion improves when CTAs appear after trust and offer sections.",
      action: "Repeat the primary CTA after testimonials/features and again near contact.",
    });
  }
  return out;
}

function trustElements(
  text: string,
  rules: IndustryConversionRule,
): ConversionRecommendation[] {
  const out: ConversionRecommendation[] = [];
  const trustHits = rules.trustElements.filter((el) => {
    const tokens = el.toLowerCase().split(/\s+/).slice(0, 2);
    return tokens.some((t) => t.length > 3 && text.includes(t));
  });
  const hasTestimonial = /testimonial|review|quote|rating/i.test(text);
  if (!hasTestimonial) {
    out.push({
      id: "trust-testimonials",
      area: "trust",
      severity: "major",
      title: "Missing social proof / testimonials",
      detail: "Trust elements are essential before high-intent CTAs.",
      action: `Add testimonials or reviews. Prefer: ${rules.trustElements.slice(0, 3).join(", ")}.`,
      target: "Testimonials",
    });
  }
  if (trustHits.length < 2) {
    out.push({
      id: "trust-signals",
      area: "trust",
      severity: "opportunity",
      title: "Strengthen industry trust signals",
      detail: `Only ${trustHits.length} of ${rules.trustElements.length} recommended trust cues detected.`,
      action: `Surface: ${rules.trustElements.join(", ")}.`,
    });
  }
  return out;
}

function missingIndustryElements(
  text: string,
  rules: IndustryConversionRule,
): { missing: string[]; recommendations: ConversionRecommendation[] } {
  const missing = rules.requiredElements.filter((el) => !text.includes(el.toLowerCase()));
  const recommendations: ConversionRecommendation[] = missing.slice(0, 5).map((el, i) => ({
    id: `industry-missing-${i}`,
    area: "industry" as const,
    severity: (i < 2 ? "major" : "opportunity") as ConversionRecommendation["severity"],
    title: `Add ${el} for ${rules.label} conversion`,
    detail: `${rules.label} sites convert better when "${el}" is clearly present.`,
    action: `Add a section or content block covering ${el}. Suggested order: ${rules.sectionOrder.join(" → ")}.`,
    target: el,
  }));
  return { missing, recommendations };
}

function sectionOrderHints(
  strategy: CoreProductStrategy | undefined,
  rules: IndustryConversionRule,
): ConversionRecommendation[] {
  const labels = (strategy?.sectionPlan ?? []).map((s) => s.name);
  if (labels.length < 3) {
    return [
      {
        id: "section-order-thin",
        area: "section-order",
        severity: "major",
        title: "Section structure is too thin for conversion",
        detail: "A converting homepage needs a guided sequence from desire → proof → action.",
        action: `Prefer order: ${rules.sectionOrder.join(" → ")}.`,
      },
    ];
  }

  // Soft check: booking/contact should not appear only at the very start.
  const last = labels[labels.length - 1]?.toLowerCase() ?? "";
  if (!/contact|booking|cta|reserv|inquiry/i.test(last)) {
    return [
      {
        id: "section-order-close",
        area: "section-order",
        severity: "opportunity",
        title: "End the page with a conversion closer",
        detail: "Last section should reinforce the primary action (booking, contact, or CTA).",
        action: `Close with ${rules.sectionOrder[rules.sectionOrder.length - 1] || "Contact / CTA"}.`,
      },
    ];
  }
  return [];
}

function journeyAndContent(
  rules: IndustryConversionRule,
  goal: ConversionGoalDetection,
): ConversionRecommendation[] {
  return [
    {
      id: "journey",
      area: "journey",
      severity: "opportunity",
      title: "Align the user journey to the conversion goal",
      detail: `Goal=${goal.goal}. Ideal journey: ${rules.journeySteps.join(" → ")}.`,
      action: `Ensure each journey step maps to a visible section. ${rules.ctaGuidance}`,
    },
    {
      id: "content-structure",
      area: "content",
      severity: "opportunity",
      title: "Tighten content structure for decisions",
      detail: `Recommended content pillars: ${rules.contentStructure.join(", ")}.`,
      action:
        "Rewrite thin blurbs into benefit-led copy with one clear next step per section.",
    },
  ];
}

/**
 * Analyze generated website + strategy for conversion readiness.
 */
export function analyzeConversion(params: {
  files: GeneratedProjectFile[];
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string;
  explicitGoal?: string | null;
  websiteGoal?: string | null;
}): ConversionOptimizationReport {
  const industryId =
    params.industryId ||
    params.profile?.industry ||
    "agency";
  const rules = getIndustryConversionRules(industryId);
  const goal = detectConversionGoal({
    explicitGoal: params.explicitGoal,
    websiteGoal: params.websiteGoal,
    businessGoals: params.profile?.businessGoals,
    positioning: params.strategy?.positioning,
    ctaTypes: params.strategy?.ctas,
    industryId: rules.industryId,
    conversionFunnel: params.strategy?.conversionFunnel,
  });

  const text = corpus(params.files, params.strategy);
  const recommendations: ConversionRecommendation[] = [
    ...heroStrength(text, rules),
    ...ctaPlacement(text, goal),
    ...trustElements(text, rules),
    ...sectionOrderHints(params.strategy, rules),
  ];

  const { missing, recommendations: industryRecs } = missingIndustryElements(
    text,
    rules,
  );
  recommendations.push(...industryRecs);
  recommendations.push(...journeyAndContent(rules, goal));

  // Score: start 100, deduct by severity
  let score = 100;
  for (const rec of recommendations) {
    if (rec.severity === "critical") score -= 14;
    else if (rec.severity === "major") score -= 8;
    else if (rec.severity === "minor") score -= 4;
    else score -= 2;
  }
  score = Math.max(20, Math.min(100, score));

  const critical = recommendations.filter((r) => r.severity === "critical").length;
  const major = recommendations.filter((r) => r.severity === "major").length;
  const conversionReady = score >= 62 && critical === 0 && major <= 2;

  const improveThemes = recommendations
    .filter((r) => r.severity === "critical" || r.severity === "major")
    .slice(0, 8)
    .map((r) => `${r.title}: ${r.action}`);

  const summary = conversionReady
    ? `${rules.label} site is conversion-ready for ${goal.goal} (score ${score}).`
    : `${rules.label} conversion gaps for ${goal.goal}: ${critical} critical, ${major} major (score ${score}).`;

  return {
    goal,
    industryId: rules.industryId,
    score,
    conversionReady,
    recommendations: recommendations
      .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
      .slice(0, 16),
    missingElements: missing,
    suggestedSectionOrder: rules.sectionOrder,
    suggestedJourney: rules.journeySteps,
    improveThemes,
    summary,
    generatedAt: new Date().toISOString(),
  };
}

function severityRank(
  s: ConversionRecommendation["severity"],
): number {
  switch (s) {
    case "critical":
      return 0;
    case "major":
      return 1;
    case "minor":
      return 2;
    default:
      return 3;
  }
}
