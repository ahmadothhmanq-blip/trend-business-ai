/**
 * Final Website Quality Intelligence Engine.
 * Orchestrates auditor + design critic + conversion + SEO + scores + actions.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { DesignCriticReport } from "@/lib/ai-core/design-critic/types";
import type { ConversionOptimizationReport } from "@/lib/ai-core/conversion/types";
import type { SeoPerformanceReport } from "@/lib/ai-core/seo-performance/types";
import type { WebsiteOptimizationReport } from "@/lib/ai-core/optimizer/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { WebsiteEditorSuggestionsReport } from "@/lib/ai-core/website-editor/types";
import { runWebsiteQualityAuditor } from "@/lib/ai-core/final-quality/auditor";
import { runFinalSeoReview } from "@/lib/ai-core/final-quality/seo-review";
import {
  computeFinalWebsiteScores,
  isFinalPublishReady,
} from "@/lib/ai-core/final-quality/score";
import {
  buildFinalImprovementActions,
  finalActionsToOptimizeThemes,
} from "@/lib/ai-core/final-quality/actions";
import type {
  FinalQualityFinding,
  FinalWebsiteQualityReport,
} from "@/lib/ai-core/final-quality/types";

export type RunFinalWebsiteQualityParams = {
  files: GeneratedProjectFile[];
  designCritic?: DesignCriticReport | null;
  conversion?: ConversionOptimizationReport | null;
  seoPerformance?: SeoPerformanceReport | null;
  optimization?: WebsiteOptimizationReport | null;
  seoPackage?: CoreSeoPackage | null;
  performanceReport?: CorePerformanceReport | null;
  editorSuggestions?: WebsiteEditorSuggestionsReport | null;
  /** When true, also run design-critic / conversion / seo-perf if missing. */
  runMissingEngines?: boolean;
  onProgress?: (message: string) => void;
};

function findingsFromDesignCritic(
  report: DesignCriticReport,
): FinalQualityFinding[] {
  return report.findings.map((f) => ({
    id: `critic-${f.id}`,
    dimension:
      f.area === "imagery"
        ? "visual"
        : f.area === "mobile"
          ? "mobile"
          : f.area === "typography"
            ? "typography"
            : f.area === "spacing"
              ? "spacing"
              : f.area === "ux"
                ? "journey"
                : "layout",
    severity: f.severity,
    title: f.title,
    detail: f.detail,
    action: f.action,
    source: "design-critic" as const,
  }));
}

function findingsFromConversion(
  report: ConversionOptimizationReport,
): FinalQualityFinding[] {
  return report.recommendations.map((r) => ({
    id: `conv-${r.id}`,
    dimension: "conversion" as const,
    severity: r.severity,
    title: r.title,
    detail: r.detail,
    action: r.action,
    source: "conversion" as const,
  }));
}

/**
 * Run Final Website Quality Intelligence — single scored report before publish.
 */
export async function runFinalWebsiteQualityIntelligence(
  params: RunFinalWebsiteQualityParams,
): Promise<FinalWebsiteQualityReport> {
  params.onProgress?.(
    "Final Quality Intelligence: auditing design, UX, SEO, and conversion…",
  );

  let designCritic = params.designCritic ?? null;
  let conversion = params.conversion ?? null;
  let seoPerformance = params.seoPerformance ?? null;

  if (params.runMissingEngines) {
    if (!designCritic) {
      const { runDesignCritic } = await import("@/lib/ai-core/design-critic");
      designCritic = runDesignCritic({
        files: params.files,
        onProgress: params.onProgress,
      });
    }
    if (!conversion) {
      const { runConversionOptimization } = await import(
        "@/lib/ai-core/conversion"
      );
      conversion = runConversionOptimization({
        files: params.files,
        onProgress: params.onProgress,
      });
    }
    if (!seoPerformance) {
      const { runSeoPerformanceEngine } = await import(
        "@/lib/ai-core/seo-performance"
      );
      seoPerformance = runSeoPerformanceEngine({
        files: params.files,
        seoPackage: params.seoPackage ?? undefined,
        performanceReport: params.performanceReport ?? undefined,
        conversionScore: conversion?.score ?? null,
        onProgress: params.onProgress,
      });
    }
  }

  const auditor = runWebsiteQualityAuditor({ files: params.files });
  params.onProgress?.(auditor.summary);

  const seoReview = runFinalSeoReview({
    files: params.files,
    seoPackage: params.seoPackage,
    seoPerformance,
  });
  params.onProgress?.(seoReview.summary);

  const findings: FinalQualityFinding[] = [
    ...auditor.findings,
    ...(designCritic ? findingsFromDesignCritic(designCritic) : []),
    ...(conversion ? findingsFromConversion(conversion) : []),
    ...seoReview.findings,
  ];

  // Dedupe by title
  const seen = new Set<string>();
  const uniqueFindings = findings.filter((f) => {
    const k = f.title.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const scores = computeFinalWebsiteScores({
    auditor,
    seoReview,
    designCritic,
    conversion,
    seoPerformance,
    optimization: params.optimization,
    performanceReport: params.performanceReport,
  });

  const actions = buildFinalImprovementActions(uniqueFindings);

  const blockers = uniqueFindings
    .filter((f) => f.severity === "critical")
    .map((f) => f.title);
  const warnings = uniqueFindings
    .filter((f) => f.severity === "major")
    .map((f) => f.title);
  const opportunities = uniqueFindings
    .filter((f) => f.severity === "minor" || f.severity === "opportunity")
    .map((f) => f.title);

  const publishReady = isFinalPublishReady({
    scores,
    hasCriticalFindings: blockers.length > 0,
    designReady: designCritic?.designReady,
    conversionReady: conversion?.conversionReady,
    seoReady: seoPerformance?.publishReady ?? seoReview.metadataOk,
  });

  const summary = `Final Quality ${scores.overall}/100 — design ${scores.design} · UX ${scores.ux} · SEO ${scores.seo} · conversion ${scores.conversion} · performance ${scores.performance}${
    publishReady ? " — publish ready" : " — improve before publish"
  }`;

  params.onProgress?.(summary);

  return {
    scores,
    publishReady,
    findings: uniqueFindings,
    actions,
    auditor,
    seoReview,
    designCritic: designCritic ?? undefined,
    conversion: conversion ?? undefined,
    seoPerformance: seoPerformance ?? undefined,
    optimization: params.optimization ?? undefined,
    editorSuggestions: params.editorSuggestions ?? undefined,
    blockers,
    warnings,
    opportunities,
    summary,
    generatedAt: new Date().toISOString(),
  };
}

/** Sync wrapper when all subsystem reports are already available. */
export function buildFinalWebsiteQualityReport(
  params: Omit<RunFinalWebsiteQualityParams, "runMissingEngines">,
): FinalWebsiteQualityReport {
  const auditor = runWebsiteQualityAuditor({ files: params.files });
  const seoReview = runFinalSeoReview({
    files: params.files,
    seoPackage: params.seoPackage,
    seoPerformance: params.seoPerformance,
  });

  const findings: FinalQualityFinding[] = [
    ...auditor.findings,
    ...(params.designCritic
      ? findingsFromDesignCritic(params.designCritic)
      : []),
    ...(params.conversion ? findingsFromConversion(params.conversion) : []),
    ...seoReview.findings,
  ];

  const seen = new Set<string>();
  const uniqueFindings = findings.filter((f) => {
    const k = f.title.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const scores = computeFinalWebsiteScores({
    auditor,
    seoReview,
    designCritic: params.designCritic,
    conversion: params.conversion,
    seoPerformance: params.seoPerformance,
    optimization: params.optimization,
    performanceReport: params.performanceReport,
  });

  const actions = buildFinalImprovementActions(uniqueFindings);
  const blockers = uniqueFindings
    .filter((f) => f.severity === "critical")
    .map((f) => f.title);
  const warnings = uniqueFindings
    .filter((f) => f.severity === "major")
    .map((f) => f.title);
  const opportunities = uniqueFindings
    .filter((f) => f.severity === "minor" || f.severity === "opportunity")
    .map((f) => f.title);

  const publishReady = isFinalPublishReady({
    scores,
    hasCriticalFindings: blockers.length > 0,
    designReady: params.designCritic?.designReady,
    conversionReady: params.conversion?.conversionReady,
    seoReady: params.seoPerformance?.publishReady ?? seoReview.metadataOk,
  });

  return {
    scores,
    publishReady,
    findings: uniqueFindings,
    actions,
    auditor,
    seoReview,
    designCritic: params.designCritic ?? undefined,
    conversion: params.conversion ?? undefined,
    seoPerformance: params.seoPerformance ?? undefined,
    optimization: params.optimization ?? undefined,
    editorSuggestions: params.editorSuggestions ?? undefined,
    blockers,
    warnings,
    opportunities,
    summary: `Final Quality ${scores.overall}/100 — design ${scores.design} · UX ${scores.ux} · SEO ${scores.seo} · conversion ${scores.conversion} · performance ${scores.performance}${
      publishReady ? " — publish ready" : " — improve before publish"
    }`,
    generatedAt: new Date().toISOString(),
  };
}

export { finalActionsToOptimizeThemes };
