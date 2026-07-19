/**
 * Analyze analytics + experiments and produce actionable conversion insights.
 */

import { buildWebsiteAnalyticsSummary } from "@/lib/ai-core/analytics";
import { listExperimentResults } from "@/lib/ai-core/ab-testing";
import type {
  ConversionInsight,
  ConversionOptimizerReport,
} from "@/lib/ai-core/conversion-optimizer/types";
import type { ConversionOptimizationReport } from "@/lib/ai-core/conversion/types";

export type RunConversionOptimizerParams = {
  generationId: string;
  /** Optional build-time conversion report from generation pipeline. */
  conversionReport?: ConversionOptimizationReport | null;
  industry?: string | null;
  projectName?: string | null;
};

function insight(
  partial: Omit<ConversionInsight, "id"> & { id?: string },
): ConversionInsight {
  return {
    id:
      partial.id ||
      `ins-${partial.category}-${Math.random().toString(36).slice(2, 8)}`,
    ...partial,
  };
}

/**
 * AI Conversion Optimizer — runtime + structural recommendations.
 */
export function runConversionOptimizer(
  params: RunConversionOptimizerParams,
): ConversionOptimizerReport {
  const analytics = buildWebsiteAnalyticsSummary(params.generationId, 14);
  const experiments = listExperimentResults(params.generationId);
  const insights: ConversionInsight[] = [];

  const betterCtaSuggestions: string[] = [];
  const layoutSuggestions: string[] = [];
  const missingTrustSections: string[] = [];
  const seoImprovements: string[] = [];
  const uxImprovements: string[] = [];

  // CTA analysis from click heatmap
  const topButton = analytics.topButtons[0];
  const weakCta =
    analytics.buttonClicks > 0 &&
    analytics.conversions / Math.max(1, analytics.buttonClicks) < 0.12;

  if (weakCta || analytics.conversionRate < 4) {
    betterCtaSuggestions.push(
      "Book a free consult — low-friction, outcome-led CTA",
      "See pricing — for visitors comparing options",
      "Get a custom quote — stronger for service businesses",
    );
    insights.push(
      insight({
        category: "cta",
        severity: "high",
        title: "Primary CTA under-converting",
        detail: `Conversion rate is ${analytics.conversionRate}% with ${analytics.buttonClicks} clicks tracked.`,
        suggestion:
          "Rewrite the hero and pricing CTAs to lead with a concrete outcome and reduce form friction.",
        impact: "Typically +15–35% conversion lift on hero tests",
        relatedMetric: "conversionRate",
      }),
    );
  } else if (topButton) {
    betterCtaSuggestions.push(
      `Keep emphasis on “${topButton.label}” — it already drives most clicks`,
      "Test a secondary soft CTA for hesitant visitors",
    );
  }

  // Layout / bounce
  if (analytics.bounceRate > 55) {
    layoutSuggestions.push(
      "Move social proof above the fold",
      "Shorten the hero and place a clear next step within the first viewport",
      "Collapse dense feature grids into a 3-step journey",
    );
    insights.push(
      insight({
        category: "layout",
        severity: "high",
        title: "High bounce rate",
        detail: `Bounce rate is ${analytics.bounceRate}% — visitors leave without exploring.`,
        suggestion:
          "Tighten the first viewport: one headline, one proof line, one CTA. Defer secondary content.",
        impact: "Lower bounce improves session depth and conversion opportunities",
        relatedMetric: "bounceRate",
      }),
    );
  } else {
    layoutSuggestions.push(
      "Test a sticky mobile CTA bar",
      "Add a mid-page conversion band after services",
    );
  }

  // Device UX
  const mobileShare =
    analytics.devices.find((d) => d.key === "mobile")?.share ?? 0;
  if (mobileShare >= 40) {
    uxImprovements.push(
      "Increase tap targets for primary buttons on mobile",
      "Ensure pricing tables stack cleanly under 640px",
      "Reduce hero image weight for faster LCP on mobile",
    );
    insights.push(
      insight({
        category: "ux",
        severity: "medium",
        title: "Mobile-heavy traffic",
        detail: `${mobileShare}% of views are mobile.`,
        suggestion:
          "Prioritize mobile CTA visibility and simplify pricing/forms for small screens.",
        impact: "Protects majority traffic from UX drop-off",
        relatedMetric: "devices.mobile",
      }),
    );
  } else {
    uxImprovements.push(
      "Keep desktop density premium but avoid long unbroken text blocks",
      "Add hover states that clarify interactive CTAs",
    );
  }

  // Traffic source SEO / acquisition
  const organic =
    analytics.trafficSources.find((s) => s.key === "organic")?.share ?? 0;
  if (organic < 20) {
    seoImprovements.push(
      "Add a focused H1 matching primary intent keywords",
      "Expand FAQ / services copy for long-tail organic queries",
      "Ensure unique meta titles on Pricing and Contact pages",
    );
    insights.push(
      insight({
        category: "seo",
        severity: "medium",
        title: "Low organic share",
        detail: `Organic traffic is only ${organic}% of views.`,
        suggestion:
          "Strengthen on-page SEO for money pages and publish a trust/FAQ section targeting search intent.",
        impact: "Improves free acquisition quality over time",
        relatedMetric: "trafficSources.organic",
      }),
    );
  } else {
    seoImprovements.push(
      "Protect ranking pages with clear internal links from the homepage",
      "Add structured data for services / local business where relevant",
    );
  }

  // Trust gaps from build-time conversion report + heuristics
  const missing = params.conversionReport?.missingElements || [];
  if (missing.length) {
    for (const m of missing.slice(0, 5)) {
      missingTrustSections.push(m);
    }
  } else {
    missingTrustSections.push(
      "Testimonials with names and outcomes",
      "Trust logos / press / certifications",
      "Guarantee or risk-reversal near pricing",
    );
  }

  if (
    !analytics.topPages.some((p) => p.key.includes("about")) ||
    analytics.conversionRate < 5
  ) {
    insights.push(
      insight({
        category: "trust",
        severity: "medium",
        title: "Missing trust reinforcement",
        detail:
          "Conversion and page mix suggest visitors may lack proof before committing.",
        suggestion:
          "Add a testimonials band and a short “why us” trust strip near the primary CTA.",
        impact: "Raises confidence especially for first-time visitors",
      }),
    );
  }

  // Experiment-informed insights
  let experimentScore = 55;
  const runningOrDone = experiments[0];
  if (runningOrDone) {
    const winner = runningOrDone.winnerVariantId
      ? runningOrDone.conversionRates.find(
          (v) => v.variantId === runningOrDone.winnerVariantId,
        )
      : null;
    if (winner) {
      experimentScore = 88;
      betterCtaSuggestions.unshift(
        `Adopt winning variant “${winner.name}” (${winner.conversionRate}% CR)`,
      );
      insights.push(
        insight({
          category: "experiment",
          severity: "high",
          title: "Winning variant ready to ship",
          detail: runningOrDone.summary,
          suggestion: `Apply variant ${winner.key} changes site-wide and archive the experiment.`,
          impact: `Measured CR ${winner.conversionRate}%` +
            (runningOrDone.liftPercent != null
              ? ` · lift ${runningOrDone.liftPercent}%`
              : ""),
        }),
      );
    } else {
      experimentScore = 70;
      insights.push(
        insight({
          category: "experiment",
          severity: "low",
          title: "Experiment still learning",
          detail: runningOrDone.summary,
          suggestion:
            "Keep traffic split active; avoid editing both variants until a winner is declared.",
          impact: "Protects statistical validity",
        }),
      );
    }
  } else {
    insights.push(
      insight({
        category: "experiment",
        severity: "medium",
        title: "No active experiment",
        detail: "A/B testing is available for headlines, CTAs, pricing, and layouts.",
        suggestion:
          "Start a Variant A/B test on the hero CTA — highest leverage for conversion lift.",
        impact: "Structured learning vs guessing",
      }),
    );
  }

  // Merge build-time conversion recommendations if present
  if (params.conversionReport?.recommendations?.length) {
    for (const rec of params.conversionReport.recommendations.slice(0, 4)) {
      insights.push(
        insight({
          category:
            rec.area === "cta"
              ? "cta"
              : rec.area === "trust"
                ? "trust"
                : rec.area === "hero" || rec.area === "section-order"
                  ? "layout"
                  : "ux",
          severity:
            rec.severity === "critical" || rec.severity === "major"
              ? "high"
              : rec.severity === "minor"
                ? "low"
                : "medium",
          title: rec.title,
          detail: rec.detail,
          suggestion: rec.action,
          impact: "From generation conversion intelligence",
        }),
      );
    }
  }

  const analyticsScore = analytics.conversionScore;
  const structuralScore = params.conversionReport?.score ?? 72;
  const overallScore = Math.round(
    analyticsScore * 0.45 + structuralScore * 0.35 + experimentScore * 0.2,
  );

  const severityRank = { high: 0, medium: 1, low: 2 } as const;
  insights.sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity],
  );

  const industry = params.industry || "this business";
  const summary = `${params.projectName || "Website"} conversion intelligence: score ${overallScore}/100. Analytics CR ${analytics.conversionRate}% · bounce ${analytics.bounceRate}%. Focus next on ${insights[0]?.title || "CTA clarity"} for ${industry}.`;

  return {
    generationId: params.generationId,
    conversionScore: structuralScore,
    analyticsScore,
    experimentScore,
    overallScore,
    insights: insights.slice(0, 12),
    betterCtaSuggestions: [...new Set(betterCtaSuggestions)].slice(0, 5),
    layoutSuggestions: [...new Set(layoutSuggestions)].slice(0, 5),
    missingTrustSections: [...new Set(missingTrustSections)].slice(0, 5),
    seoImprovements: [...new Set(seoImprovements)].slice(0, 5),
    uxImprovements: [...new Set(uxImprovements)].slice(0, 5),
    summary,
    generatedAt: new Date().toISOString(),
  };
}
