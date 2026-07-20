/**
 * Pre-publish quality gates — block publish when critical issues exist.
 */

import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { conversionPublishChecklist, runConversionOptimization } from "@/lib/ai-core/conversion";
import {
  runSeoPerformanceEngine,
  seoPerformancePublishChecklist,
} from "@/lib/ai-core/seo-performance";
import {
  buildFinalWebsiteQualityReport,
  finalQualityPublishChecklist,
} from "@/lib/ai-core/final-quality";
import { runDesignCritic } from "@/lib/ai-core/design-critic";
import { resolveSiteStructure, runPrePublishQualityControl } from "@/lib/ai-core/website-management";

export type PublishGateResult = {
  publishReady: boolean;
  blockers: string[];
  warnings: string[];
  opportunities: string[];
  scores: {
    overall: number | null;
    seo: number | null;
    conversion: number | null;
    performance: number | null;
    design: number | null;
    ux: number | null;
  };
  conversionChecklist: ReturnType<typeof conversionPublishChecklist> | null;
  seoChecklist: ReturnType<typeof seoPerformancePublishChecklist> | null;
  finalChecklist: ReturnType<typeof finalQualityPublishChecklist> | null;
  managementQuality: ReturnType<typeof runPrePublishQualityControl> | null;
};

function loadProject(generation: WebsiteGeneration): GeneratedWebsiteProject | null {
  const raw = generation.blueprint;
  if (!raw || typeof raw !== "object") return null;
  return raw as unknown as GeneratedWebsiteProject;
}

export function evaluatePublishGates(
  generation: WebsiteGeneration,
): PublishGateResult {
  const project = loadProject(generation);
  const blockers: string[] = [];
  const warnings: string[] = [];
  const opportunities: string[] = [];

  if (!project?.files?.length) {
    return {
      publishReady: false,
      blockers: ["No generated website files found."],
      warnings: [],
      opportunities: [],
      scores: {
        overall: null,
        seo: null,
        conversion: null,
        performance: null,
        design: null,
        ux: null,
      },
      conversionChecklist: null,
      seoChecklist: null,
      finalChecklist: null,
      managementQuality: null,
    };
  }

  const conversionReport =
    project.conversionReport ??
    runConversionOptimization({
      files: project.files,
      strategy: project.strategy as never,
      profile: project.businessProfile as never,
      industryId: project.businessProfile?.industry,
    });
  const conversionChecklist = conversionPublishChecklist(conversionReport);

  const seoPerformanceReport =
    project.seoPerformanceReport ??
    runSeoPerformanceEngine({
      files: project.files,
      strategy: project.strategy as never,
      profile: project.businessProfile as never,
      industryId: project.businessProfile?.industry,
      seoPackage: project.seoPackage,
      performanceReport: project.performanceReport,
      assetManifest: project.assetManifest,
      conversionScore: conversionReport.score,
    });
  const seoChecklist = seoPerformancePublishChecklist(seoPerformanceReport);

  const designCritic =
    project.designCriticReport ?? runDesignCritic({ files: project.files });
  const finalQualityReport = buildFinalWebsiteQualityReport({
    files: project.files,
    designCritic,
    conversion: conversionReport,
    seoPerformance: seoPerformanceReport,
    optimization: project.optimizationReport,
    seoPackage: project.seoPackage,
    performanceReport: project.performanceReport,
    editorSuggestions: project.editorSuggestions,
  });
  const finalChecklist = finalQualityPublishChecklist(finalQualityReport);

  const structure = resolveSiteStructure(
    project.businessProfile?.industry ||
      project.designSystem?.industryPattern ||
      "business",
    project.description || generation.business_description,
  );
  const managementQuality = runPrePublishQualityControl({
    files: project.files,
    structure,
  });

  blockers.push(...(finalChecklist?.blockers ?? []));
  blockers.push(...(conversionChecklist?.blockers ?? []));
  blockers.push(...(seoChecklist?.blockers ?? []));
  blockers.push(
    ...(managementQuality.checks
      .filter((c) => !c.passed && c.severity === "blocker")
      .map((c) => c.detail) ?? []),
  );

  if (!project.seoPackage?.metadata?.title?.trim()) {
    blockers.push("Missing SEO title metadata.");
  }
  if (!project.seoPackage?.metadata?.description?.trim()) {
    blockers.push("Missing SEO meta description.");
  }

  warnings.push(...(finalChecklist?.warnings ?? []));
  warnings.push(...(conversionChecklist?.warnings ?? []));
  warnings.push(...(seoChecklist?.warnings ?? []));
  warnings.push(
    ...(managementQuality.checks
      .filter((c) => !c.passed && c.severity === "warning")
      .map((c) => c.detail) ?? []),
  );

  opportunities.push(...(finalChecklist?.opportunities ?? []));
  opportunities.push(...(conversionChecklist?.opportunities ?? []));
  opportunities.push(...(seoChecklist?.opportunities ?? []));

  const publishReady =
    blockers.length === 0 &&
    (finalChecklist?.publishReady ??
      ((conversionChecklist?.conversionReady ?? true) &&
        (seoChecklist?.publishReady ?? true))) &&
    managementQuality.ready;

  return {
    publishReady,
    blockers: Array.from(new Set(blockers)),
    warnings: Array.from(new Set(warnings)),
    opportunities: Array.from(new Set(opportunities)),
    scores: {
      overall: finalChecklist?.scores.overall ?? null,
      seo: finalChecklist?.scores.seo ?? seoChecklist?.seoScore ?? null,
      conversion: finalChecklist?.scores.conversion ?? conversionChecklist?.score ?? null,
      performance:
        finalChecklist?.scores.performance ?? seoChecklist?.performanceScore ?? null,
      design: finalChecklist?.scores.design ?? null,
      ux: finalChecklist?.scores.ux ?? null,
    },
    conversionChecklist,
    seoChecklist,
    finalChecklist,
    managementQuality,
  };
}
