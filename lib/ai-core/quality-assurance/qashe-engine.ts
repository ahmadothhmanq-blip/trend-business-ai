import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { getWebsiteGenerationPlanFromBrief } from "@/lib/ai-core/architecture-validation/orchestrate";
import {
  getBusinessIntelligenceFromBrief,
  type BusinessIntelligenceProfile,
} from "@/lib/ai-core/business-intelligence";
import { getMasterWebsitePlan } from "@/lib/ai-core/master-planner/apply";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import { buildQualitySpecification } from "@/lib/ai-core/quality-assurance/build-spec";
import type {
  QualityAssuranceEngineResult,
  QualityAssuranceTrace,
} from "@/lib/ai-core/quality-assurance/qashe-types";
import {
  QUALITY_ASSURANCE_ENGINE_ID,
  QUALITY_ASSURANCE_ENGINE_VERSION,
  QUALITY_SPECIFICATION_KEY,
  QUALITY_ASSURANCE_TRACE_KEY,
} from "@/lib/ai-core/quality-assurance/qashe-types";
import { resolveQualityPolicy } from "@/lib/ai-core/quality-assurance/policies";
import {
  validateCrossEngineConsistency,
  validateQualitySpecification,
  validateArtifactContent,
} from "@/lib/ai-core/quality-assurance/validate-pipeline";
import type { BuildAutoQualityReportInput } from "@/lib/ai-core/quality/report";

export type RunQualityAssuranceEngineParams = BuildAutoQualityReportInput & {
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  onProgress?: (message: string) => void;
};

/**
 * Quality Assurance & Self-Healing Engine (QASHE) — EDS-007 authoritative entry.
 * Validates the entire pipeline as a unified system before production approval.
 */
export function runQualityAssuranceEngine(
  params: RunQualityAssuranceEngineParams,
): QualityAssuranceEngineResult {
  const phases: QualityAssuranceTrace["phases"] = [];
  const entries: QualityAssuranceTrace["entries"] = [];

  params.onProgress?.("[qashe] Phase 1/4 · Resolving quality policy from QKB…");
  phases.push("policy-resolve");

  const policyLookup = resolveQualityPolicy({
    industryId: String(
      params.masterPlan?.industry ||
        params.websiteGenerationPlan?.industryId ||
        params.industryId ||
        params.profile?.industry ||
        "business",
    ),
    masterPlan: params.masterPlan,
    websiteGenerationPlan: params.websiteGenerationPlan,
    businessProfile: params.businessProfile ?? null,
  });
  const policy = policyLookup.value;

  entries.push({
    id: `qashe-policy-${Date.now()}`,
    phase: "policy-resolve",
    ruleId: "qkb-policy",
    passed: true,
    severity: "info",
    message: `QKB ${policyLookup.entryId} · minConfidence=${policy.minConfidenceScore} · engines=${policy.requiredEngineTraces.length}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[qashe] Phase 2/4 · Cross-engine + artifact validation…");
  phases.push(
    "cross-engine-consistency",
    "architectural-integrity",
    "content-quality",
    "design-consistency",
    "image-quality",
    "seo-aeo",
    "hallucination-detection",
    "broken-references",
    "security",
    "compliance",
  );

  const crossEngine = validateCrossEngineConsistency(params.brief, policy);
  entries.push(...crossEngine.entries);

  const artifactEntries =
    params.files?.length
      ? validateArtifactContent(params.files, policy).entries
      : [];
  entries.push(...artifactEntries);

  params.onProgress?.("[qashe] Phase 3/4 · Building QualitySpecification + self-healing…");
  phases.push("remediation-planning", "self-healing", "confidence-scoring", "root-cause-analysis");

  const { spec, files: healedFiles } = buildQualitySpecification({
    policy,
    files: params.files,
    strategy: params.strategy,
    designSystem: params.designSystem,
    assetManifest: params.assetManifest,
    profile: params.profile,
    baseReport: params.baseReport,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
    improveApplied: params.improveApplied,
    improveNotes: params.improveNotes,
    brief: params.brief,
  });

  params.onProgress?.("[qashe] Phase 4/4 · Locking QualitySpecification…");
  phases.push("validation", "spec-lock");

  const validation = validateQualitySpecification(spec, policy);
  entries.push(...validation.trace);

  entries.push({
    id: `qashe-lock-${Date.now()}`,
    phase: "spec-lock",
    ruleId: "quality-specification",
    passed: validation.valid && spec.productionApproved,
    severity: spec.productionApproved ? "info" : "warning",
    message: `QualitySpecification locked · confidence=${spec.confidenceScore} · approved=${spec.productionApproved}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  const trace: QualityAssuranceTrace = {
    version: "1",
    engineId: QUALITY_ASSURANCE_ENGINE_ID,
    engineVersion: QUALITY_ASSURANCE_ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    industryId: policy.industryId,
    phases,
    entries,
    summary: spec.productionApproved
      ? `Production approved · confidence ${spec.confidenceScore}/100${spec.selfHealing.applied ? " · self-healing applied" : ""}`
      : `Production withheld · confidence ${spec.confidenceScore}/100 · ${validation.errors.join("; ") || validation.warnings.join("; ")}`,
  };

  params.onProgress?.(
    `[qashe] Spec locked · confidence=${spec.confidenceScore} · trace=${trace.entries.length} decisions`,
  );

  return {
    spec,
    validation,
    trace,
    policy,
    files: spec.selfHealing.applied ? healedFiles : params.files,
  };
}

export function getQualityAssuranceTraceFromBrief(
  brief: CoreBrief,
): QualityAssuranceTrace | null {
  const raw = brief.metadata?.[QUALITY_ASSURANCE_TRACE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as QualityAssuranceTrace;
}

export function getQualitySpecificationFromBrief(
  brief: CoreBrief,
): QualityAssuranceEngineResult["spec"] | null {
  const raw = brief.metadata?.[QUALITY_SPECIFICATION_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as QualityAssuranceEngineResult["spec"];
}

export function runQualityAssuranceFromBrief(
  brief: CoreBrief,
  params: Omit<
    RunQualityAssuranceEngineParams,
    "masterPlan" | "websiteGenerationPlan" | "brief"
  >,
): QualityAssuranceEngineResult | null {
  if (!params.files?.length && !params.baseReport) return null;
  return runQualityAssuranceEngine({
    ...params,
    brief,
    masterPlan: getMasterWebsitePlan(brief),
    websiteGenerationPlan: getWebsiteGenerationPlanFromBrief(brief),
    businessProfile:
      params.businessProfile ??
      getBusinessIntelligenceFromBrief(brief)?.profile ??
      null,
  });
}

export function persistQualityAssuranceOnBrief(
  brief: CoreBrief,
  result: QualityAssuranceEngineResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [QUALITY_ASSURANCE_TRACE_KEY]: result.trace,
      [QUALITY_SPECIFICATION_KEY]: result.spec,
      qualityAssuranceValidation: result.validation,
    },
  };
}
