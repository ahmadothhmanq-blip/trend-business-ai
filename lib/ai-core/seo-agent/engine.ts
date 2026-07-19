/**
 * AI SEO Agent orchestrator — analysis + optimizer + AI search + integrations.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import { runSeoAnalysis } from "@/lib/ai-core/seo-analysis";
import { runSeoOptimizer } from "@/lib/ai-core/seo-optimizer";
import { buildAiSearchOptimization } from "@/lib/ai-core/seo-agent/ai-search";
import { syncKeywordTracking } from "@/lib/ai-core/seo-agent/keyword-tracking";
import type {
  SeoAgentRecommendation,
  SeoAgentReport,
} from "@/lib/ai-core/seo-agent/types";
import type { WebsiteAnalyticsSummary } from "@/lib/ai-core/analytics/types";
import type { ConversionOptimizerReport } from "@/lib/ai-core/conversion-optimizer/types";

export type RunSeoAgentParams = {
  generationId: string;
  files: GeneratedProjectFile[];
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string | null;
  seoPackage?: CoreSeoPackage | null;
  performanceReport?: CorePerformanceReport | null;
  assetManifest?: CoreAssetManifest | null;
  premiumSeoTopics?: string[];
  premiumKeywords?: string[];
  language?: string;
  siteUrl?: string;
  heroImageUrl?: string | null;
  analytics?: WebsiteAnalyticsSummary | null;
  conversionOptimizer?: ConversionOptimizerReport | null;
};

/**
 * Run the full AI SEO Agent pipeline for a generated website.
 */
export function runSeoAgent(params: RunSeoAgentParams): SeoAgentReport {
  const analysis = runSeoAnalysis({
    files: params.files,
    strategy: params.strategy,
    profile: params.profile,
    industryId: params.industryId,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
    assetManifest: params.assetManifest,
    premiumSeoTopics: params.premiumSeoTopics,
    premiumKeywords: params.premiumKeywords,
    conversionScore: params.conversionOptimizer?.overallScore ?? null,
    analytics: params.analytics,
    generationId: params.generationId,
  });

  const optimizer = runSeoOptimizer({
    analysis,
    strategy: params.strategy,
    profile: params.profile,
    industryId: params.industryId,
    existingSeoPackage: params.seoPackage,
    language: params.language,
    siteUrl: params.siteUrl,
    heroImageUrl: params.heroImageUrl,
  });

  const aiSearch = buildAiSearchOptimization({
    analysis,
    optimizer,
    profile: params.profile,
  });

  const keywordTracking = syncKeywordTracking(
    params.generationId,
    analysis.keywordPlan,
  );

  const recommendations: SeoAgentRecommendation[] = analysis.issues
    .slice(0, 12)
    .map((iss) => ({
      id: `rec-${iss.id}`,
      title: iss.title,
      detail: iss.recommendation,
      severity: iss.severity,
      fixId: iss.fixId,
      source: "analysis" as const,
    }));

  recommendations.push({
    id: "rec-ai-search",
    title: "Boost AI Search readiness",
    detail: aiSearch.summary,
    severity: aiSearch.readinessScore < 70 ? "major" : "opportunity",
    fixId: "fix-ai-search",
    source: "ai-search",
  });

  const analyticsHints: string[] = [];
  if (params.analytics) {
    const organic =
      params.analytics.trafficSources.find((s) => s.key === "organic")?.share ??
      0;
    if (organic < 25) {
      analyticsHints.push(
        `Organic share is ${organic}% — prioritize title/meta + content cluster fixes.`,
      );
      recommendations.push({
        id: "rec-analytics-organic",
        title: "Low organic traffic share",
        detail: `Analytics show ${organic}% organic. Apply SEO title, meta, and FAQ fixes.`,
        severity: "major",
        fixId: "fix-meta-description",
        source: "analytics",
      });
    }
    const topPage = params.analytics.topPages[0];
    if (topPage) {
      analyticsHints.push(
        `Top page ${topPage.label} (${topPage.share}% views) — ensure strongest SEO title/H1 there.`,
      );
    }
  }

  const conversionHints: string[] = [];
  if (params.conversionOptimizer) {
    for (const seo of params.conversionOptimizer.seoImprovements.slice(0, 3)) {
      conversionHints.push(seo);
    }
    if (params.conversionOptimizer.missingTrustSections.length) {
      recommendations.push({
        id: "rec-conversion-trust",
        title: "Trust sections help SEO + conversion",
        detail: params.conversionOptimizer.missingTrustSections[0]!,
        severity: "minor",
        fixId: "fix-faq-section",
        source: "conversion",
      });
    }
  }

  const seoScore = Math.round(
    analysis.overallScore * 0.7 + aiSearch.readinessScore * 0.3,
  );

  const summary = `AI SEO Agent score ${seoScore}/100 · ${recommendations.length} recommendations · AI Search ${aiSearch.readinessScore}/100 · tracking ${keywordTracking.length} keywords.`;

  return {
    generationId: params.generationId,
    seoScore,
    analysis,
    optimizer,
    aiSearch,
    keywordTracking,
    recommendations: recommendations.slice(0, 16),
    analyticsHints,
    conversionHints,
    summary,
    generatedAt: new Date().toISOString(),
  };
}
