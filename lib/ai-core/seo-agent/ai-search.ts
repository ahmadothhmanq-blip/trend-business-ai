/**
 * AI Search optimization signals for Google AI Overviews, ChatGPT, Gemini, Perplexity.
 */

import type { SeoAnalysisReport } from "@/lib/ai-core/seo-analysis/types";
import type { SeoOptimizerResult } from "@/lib/ai-core/seo-optimizer/types";
import type { AiSearchOptimization } from "@/lib/ai-core/seo-agent/types";
import type { CoreBusinessProfile } from "@/lib/ai-core/layers/types";

export function buildAiSearchOptimization(params: {
  analysis: SeoAnalysisReport;
  optimizer: SeoOptimizerResult;
  profile?: CoreBusinessProfile | null;
}): AiSearchOptimization {
  const { analysis, optimizer, profile } = params;
  const schemaCoverage = optimizer.assets.structuredDataTypes;
  const brand = profile?.projectName || "Brand";

  const entityOptimization = [
    `Clarify entity: “${brand}” as Organization with offer + geography`,
    `Primary entity topic: ${analysis.keywordPlan.primary}`,
    "Use consistent NAP / brand naming across title, H1, About, and schema",
    "Add knowsAbout topics aligned to target keywords",
  ];

  const brandKnowledgeSignals = [
    `${brand} slogan / offer: ${profile?.offer || "define a one-line offer"}`,
    `Area served: ${profile?.geography || "add service area"}`,
    "FAQ answers that cite brand + service explicitly",
    "About section with founding intent / differentiation",
    "sameAs placeholders ready for LinkedIn / social profiles",
  ];

  let readinessScore = 50;
  if (schemaCoverage.includes("Organization")) readinessScore += 12;
  if (schemaCoverage.includes("FAQPage")) readinessScore += 15;
  if (
    schemaCoverage.includes("LocalBusiness") ||
    schemaCoverage.includes("Product") ||
    schemaCoverage.includes("SoftwareApplication")
  ) {
    readinessScore += 10;
  }
  const aiArea = analysis.areaScores.find((a) => a.area === "ai-search");
  if (aiArea) readinessScore = Math.round(readinessScore * 0.5 + aiArea.score * 0.5);
  readinessScore = Math.max(0, Math.min(100, readinessScore));

  return {
    targets: [
      "google-search",
      "google-ai-overviews",
      "chatgpt-search",
      "gemini-search",
      "perplexity",
    ],
    entityOptimization,
    brandKnowledgeSignals,
    schemaCoverage,
    readinessScore,
    summary: `AI Search readiness ${readinessScore}/100 — schema [${schemaCoverage.join(", ")}] with entity + FAQ signals for Google AI Overviews, ChatGPT Search, Gemini, and Perplexity.`,
  };
}
