import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type {
  CoreAssetManifest,
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import { buildAutoQualityReportInternal } from "@/lib/ai-core/quality/report-internal";
import type { QualityCheckFile } from "@/lib/ai-core/quality/report";
import { applySelfHealing } from "@/lib/ai-core/quality-assurance/self-heal";
import type {
  QualityPolicy,
  QualitySpecification,
  RemediationAction,
  ValidationResult,
} from "@/lib/ai-core/quality-assurance/qashe-types";
import {
  validateArtifactContent,
  validateCrossEngineConsistency,
} from "@/lib/ai-core/quality-assurance/validate-pipeline";

export type BuildQualitySpecificationParams = {
  policy: QualityPolicy;
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
  brief?: CoreBrief | null;
};

function computeConfidenceScore(
  validationResults: ValidationResult[],
  qualityScore: number,
): number {
  if (!validationResults.length) return qualityScore;
  const avg =
    validationResults.reduce((sum, r) => sum + r.score, 0) /
    validationResults.length;
  return Math.round(avg * 0.6 + qualityScore * 0.4);
}

function collectRootCauses(
  validationResults: ValidationResult[],
  remediationActions: RemediationAction[],
): string[] {
  const causes = new Set<string>();
  for (const r of validationResults) {
    if (!r.passed && r.issues[0]) {
      causes.add(`${r.dimension}: ${r.issues[0]}`);
    }
  }
  for (const a of remediationActions) {
    if (a.rootCause) causes.add(a.rootCause);
  }
  return [...causes].slice(0, 12);
}

/**
 * Build the authoritative QualitySpecification — unified pipeline validation.
 */
export function buildQualitySpecification(
  params: BuildQualitySpecificationParams,
): { spec: QualitySpecification; files: QualityCheckFile[] } {
  const files = params.files ?? [];
  let workingFiles = [...files];

  const crossEngine = validateCrossEngineConsistency(params.brief, params.policy);
  const artifactValidation = files.length
    ? validateArtifactContent(files, params.policy)
    : { results: [] as ValidationResult[], entries: [] };

  const healing = applySelfHealing(workingFiles, params.policy);
  workingFiles = healing.files;
  const remediationActions: RemediationAction[] = [...healing.remediationActions];

  const qualityReport = buildAutoQualityReportInternal({
    files: workingFiles,
    strategy: params.strategy,
    designSystem: params.designSystem,
    assetManifest: params.assetManifest,
    profile: params.profile,
    baseReport: params.baseReport,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
    improveApplied: params.improveApplied ?? healing.actionsApplied.length > 0,
    improveNotes: [
      ...(params.improveNotes ?? []),
      ...healing.actionsApplied.map((a) => `Self-healed: ${a}`),
    ],
  });

  const validationResults: ValidationResult[] = [
    ...crossEngine.results,
    ...artifactValidation.results,
    ...qualityReport.dimensions.map((d) => ({
      dimension: d.name,
      passed: d.passed,
      score: d.passed ? 85 : 45,
      issues: d.issues,
      engineSource: "QASHE",
    })),
  ];

  const confidenceScore = computeConfidenceScore(
    validationResults,
    qualityReport.score,
  );

  const criticalFailures = validationResults.filter(
    (r) => !r.passed && r.score < 50,
  );
  const productionApproved =
    confidenceScore >= params.policy.minConfidenceScore &&
    qualityReport.score >= params.policy.minPublishScore &&
    criticalFailures.length === 0 &&
    !validationResults.some(
      (r) => r.dimension === "security" && !r.passed,
    );

  for (const r of validationResults.filter((v) => !v.passed)) {
    remediationActions.push({
      id: `remediate-${r.dimension}`,
      category: r.dimension,
      description: r.issues[0] || `${r.dimension} validation failed`,
      autoApplied: false,
      requiresHumanReview: r.score < 50,
      rootCause: r.issues[0],
    });
  }

  return {
    spec: {
      version: "1",
      industryId: params.policy.industryId,
      confidenceScore,
      productionApproved,
      publishReady: productionApproved && qualityReport.publishReady,
      validationResults,
      remediationActions,
      rootCauses: collectRootCauses(validationResults, remediationActions),
      dimensions: qualityReport.dimensions,
      qualityReport,
      selfHealing: {
        applied: healing.actionsApplied.length > 0,
        actionsApplied: healing.actionsApplied,
        filesModified: healing.actionsApplied.length > 0 ? workingFiles.length : 0,
      },
    },
    files: workingFiles,
  };
}
