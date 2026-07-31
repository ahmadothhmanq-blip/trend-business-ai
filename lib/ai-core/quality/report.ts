/**
 * Auto Quality Engine — EDS-007 delegates to Quality Assurance & Self-Healing Engine (QASHE).
 */

import type {
  CoreAssetManifest,
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { CoreAutoQualityReport } from "@/lib/ai-core/quality/types";
import { runQualityAssuranceEngine } from "@/lib/ai-core/quality-assurance/qashe-engine";

export type QualityCheckFile = {
  path: string;
  content: string;
};

export type BuildAutoQualityReportInput = {
  files?: QualityCheckFile[];
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  assetManifest?: CoreAssetManifest;
  profile?: CoreBusinessProfile;
  baseReport?: CoreQualityReport;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  improveApplied?: boolean;
  improveNotes?: string[];
  brief?: import("@/lib/ai-core/layers/types").CoreBrief;
  industryId?: string | null;
};

/**
 * Build Auto Quality Report — routed through QASHE for EDS-007 compliance.
 */
export function buildAutoQualityReport(
  input: BuildAutoQualityReportInput,
): CoreAutoQualityReport {
  return runQualityAssuranceEngine({
    files: input.files,
    strategy: input.strategy,
    designSystem: input.designSystem,
    assetManifest: input.assetManifest,
    profile: input.profile,
    baseReport: input.baseReport,
    seoPackage: input.seoPackage,
    performanceReport: input.performanceReport,
    improveApplied: input.improveApplied,
    improveNotes: input.improveNotes,
    brief: input.brief,
    industryId: input.industryId,
  }).spec.qualityReport;
}

/** Finalize quality after SEO + Performance layers for publish gate. */
export function finalizeQualityForPublish(params: {
  qualityReport: CoreQualityReport | CoreAutoQualityReport;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  files?: QualityCheckFile[];
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  assetManifest?: CoreAssetManifest;
  profile?: CoreBusinessProfile;
  brief?: import("@/lib/ai-core/layers/types").CoreBrief;
  industryId?: string | null;
}): CoreAutoQualityReport {
  return buildAutoQualityReport({
    baseReport: params.qualityReport,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
    files: params.files,
    strategy: params.strategy,
    designSystem: params.designSystem,
    assetManifest: params.assetManifest,
    profile: params.profile,
    brief: params.brief,
    industryId: params.industryId,
    improveApplied:
      "improveApplied" in params.qualityReport
        ? params.qualityReport.improveApplied
        : false,
    improveNotes:
      "improveNotes" in params.qualityReport
        ? params.qualityReport.improveNotes
        : undefined,
  });
}
