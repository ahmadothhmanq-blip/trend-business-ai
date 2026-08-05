import { randomUUID } from "node:crypto";
import {
  WQBS_MODE_RECOMMENDATION_LIMIT,
  WQBS_WEAK_SCORE_THRESHOLD,
} from "@/lib/website/quality-benchmark/constants";
import type {
  WqbsBenchmarkMode,
  WqbsCategoryEvaluation,
  WqbsEffortEstimate,
  WqbsImpactEstimate,
  WqbsRecommendation,
  WqbsRecommendationPriority,
} from "@/lib/website/quality-benchmark/types";

const RECOMMENDATION_LIBRARY: Record<
  string,
  { recommendation: string; effort: WqbsEffortEstimate; impact: WqbsImpactEstimate }
> = {
  layout: {
    recommendation: "Add semantic layout landmarks (header, main, footer) for clear page structure.",
    effort: "low",
    impact: "high",
  },
  spacing: {
    recommendation: "Introduce a consistent spacing scale using design tokens or utility classes.",
    effort: "medium",
    impact: "medium",
  },
  typography: {
    recommendation: "Define heading and body font families with a clear typographic hierarchy.",
    effort: "medium",
    impact: "high",
  },
  hierarchy: {
    recommendation: "Ensure exactly one H1 per page and logical heading order (H1 → H2 → H3).",
    effort: "low",
    impact: "high",
  },
  navigation: {
    recommendation: "Add a persistent navigation component with clear labels and internal links.",
    effort: "medium",
    impact: "high",
  },
  mobileUx: {
    recommendation: "Add responsive breakpoints (@media queries) for mobile and tablet viewports.",
    effort: "medium",
    impact: "high",
  },
  cta: {
    recommendation: "Add prominent primary and secondary CTAs above the fold and at section ends.",
    effort: "low",
    impact: "high",
  },
  leadCapture: {
    recommendation: "Include a contact or lead capture form with clear value proposition.",
    effort: "medium",
    impact: "high",
  },
  pricing: {
    recommendation: "Add a dedicated pricing section with clear tiers and feature comparison.",
    effort: "medium",
    impact: "medium",
  },
  socialProof: {
    recommendation: "Add testimonials, client logos, or trust badges to build credibility.",
    effort: "low",
    impact: "medium",
  },
  metadata: {
    recommendation: "Add unique page title and meta description for each page.",
    effort: "low",
    impact: "high",
  },
  schema: {
    recommendation: "Add JSON-LD structured data (Organization, WebSite, or Product schema).",
    effort: "medium",
    impact: "medium",
  },
  internalLinks: {
    recommendation: "Strengthen internal linking between related pages and sections.",
    effort: "low",
    impact: "medium",
  },
  contentDepth: {
    recommendation: "Expand page content to at least 300 words with industry-relevant copy.",
    effort: "medium",
    impact: "high",
  },
  lazyLoading: {
    recommendation: "Apply loading='lazy' to below-the-fold images.",
    effort: "low",
    impact: "medium",
  },
  bundleSize: {
    recommendation: "Reduce generated file size by splitting components and removing unused CSS.",
    effort: "high",
    impact: "medium",
  },
  wcag: {
    recommendation: "Add lang attribute to html and ensure main landmark is present.",
    effort: "low",
    impact: "high",
  },
  aria: {
    recommendation: "Add ARIA labels to interactive elements and landmark regions.",
    effort: "medium",
    impact: "high",
  },
  focus: {
    recommendation: "Add :focus-visible styles for keyboard navigation visibility.",
    effort: "low",
    impact: "medium",
  },
  language: {
    recommendation: "Set lang attribute on the document root for screen readers and SEO.",
    effort: "low",
    impact: "high",
  },
  rtlLtr: {
    recommendation: "Declare dir='rtl' or dir='ltr' when serving bidirectional content.",
    effort: "low",
    impact: "medium",
  },
};

function priorityFromGap(gap: number): WqbsRecommendationPriority {
  if (gap >= 35) return "critical";
  if (gap >= 25) return "high";
  if (gap >= 15) return "medium";
  return "low";
}

function lookupRecommendation(subId: string): {
  recommendation: string;
  effort: WqbsEffortEstimate;
  impact: WqbsImpactEstimate;
} {
  return (
    RECOMMENDATION_LIBRARY[subId] ?? {
      recommendation: `Improve ${subId} to meet world-class quality standards.`,
      effort: "medium",
      impact: "medium",
    }
  );
}

/**
 * Generate prioritized improvement recommendations for weak sub-dimensions.
 */
export function generateRecommendations(
  evaluations: WqbsCategoryEvaluation[],
  mode: WqbsBenchmarkMode,
): WqbsRecommendation[] {
  const limit = WQBS_MODE_RECOMMENDATION_LIMIT[mode];
  const candidates: WqbsRecommendation[] = [];

  for (const cat of evaluations) {
    for (const sub of cat.subDimensions) {
      if (sub.score >= WQBS_WEAK_SCORE_THRESHOLD) continue;

      const targetScore = Math.min(90, sub.score + 20);
      const gap = targetScore - sub.score;
      const lib = lookupRecommendation(sub.id);

      candidates.push({
        id: randomUUID(),
        category: cat.category,
        subDimension: sub.label,
        priority: priorityFromGap(gap),
        reason: sub.issues[0] ?? `${sub.label} scored ${sub.score}/100 — below benchmark threshold`,
        recommendation: lib.recommendation,
        expectedImpact: lib.impact,
        estimatedEffort: lib.effort,
        currentScore: sub.score,
        targetScore,
      });
    }
  }

  const priorityOrder: WqbsRecommendationPriority[] = ["critical", "high", "medium", "low"];
  candidates.sort(
    (a, b) =>
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority) ||
      a.currentScore - b.currentScore,
  );

  return candidates.slice(0, limit);
}
