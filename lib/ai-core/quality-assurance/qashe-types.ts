import type { CoreAutoQualityReport } from "@/lib/ai-core/quality/types";
import type { CoreQualityDimension } from "@/lib/ai-core/layers/types";

export const QUALITY_ASSURANCE_TRACE_KEY = "qualityAssuranceTrace";
export const QUALITY_SPECIFICATION_KEY = "qualitySpecification";
export const QUALITY_ASSURANCE_ENGINE_ID = "quality-assurance-self-healing-engine";
export const QUALITY_ASSURANCE_ENGINE_VERSION = "1.0.0";

export type QualityAssurancePhaseId =
  | "policy-resolve"
  | "cross-engine-consistency"
  | "architectural-integrity"
  | "content-quality"
  | "design-consistency"
  | "image-quality"
  | "seo-aeo"
  | "accessibility"
  | "performance"
  | "security"
  | "compliance"
  | "completeness"
  | "duplicate-detection"
  | "hallucination-detection"
  | "broken-references"
  | "confidence-scoring"
  | "root-cause-analysis"
  | "remediation-planning"
  | "self-healing"
  | "validation"
  | "spec-lock";

export type QualityTraceEntry = {
  id: string;
  phase: QualityAssurancePhaseId;
  ruleId: string;
  passed: boolean;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  knowledgeEntryId?: string;
  engineId?: string;
  timestamp: string;
};

export type QualityAssuranceTrace = {
  version: "1";
  engineId: typeof QUALITY_ASSURANCE_ENGINE_ID;
  engineVersion: typeof QUALITY_ASSURANCE_ENGINE_VERSION;
  createdAt: string;
  industryId: string;
  phases: QualityAssurancePhaseId[];
  entries: QualityTraceEntry[];
  summary: string;
};

export type QualityPolicy = {
  industryId: string;
  knowledgeEntryId: string;
  minConfidenceScore: number;
  minPublishScore: number;
  requiredEngineTraces: string[];
  requiredDimensions: string[];
  autoHealEnabled: boolean;
  maxAutoHealActions: number;
  forbiddenPlaceholderPhrases: string[];
  securityChecks: string[];
  complianceChecks: string[];
};

export type RemediationAction = {
  id: string;
  category: string;
  description: string;
  autoApplied: boolean;
  requiresHumanReview: boolean;
  rootCause?: string;
};

export type ValidationResult = {
  dimension: string;
  passed: boolean;
  score: number;
  issues: string[];
  engineSource?: string;
};

/** Provider-independent quality specification — SSOT for production approval. */
export type QualitySpecification = {
  version: "1";
  industryId: string;
  confidenceScore: number;
  productionApproved: boolean;
  publishReady: boolean;
  validationResults: ValidationResult[];
  remediationActions: RemediationAction[];
  rootCauses: string[];
  dimensions: CoreQualityDimension[];
  qualityReport: CoreAutoQualityReport;
  selfHealing: {
    applied: boolean;
    actionsApplied: string[];
    filesModified: number;
  };
};

export type QualityAssuranceValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  trace: QualityTraceEntry[];
  corrections: string[];
};

export type QualityAssuranceEngineResult = {
  spec: QualitySpecification;
  validation: QualityAssuranceValidation;
  trace: QualityAssuranceTrace;
  policy: QualityPolicy;
  /** Files after self-healing (when applicable). */
  files?: Array<{ path: string; content: string }>;
};
