export type {
  ClassifiedQualityIssue,
  PostRepairVerificationResult,
  QualityDimension,
  QualityGateResult,
  QualityGateSeverity,
  QualityIssueCategory,
  UnifiedQualityScoreInput,
  UnifiedQualityScores,
} from "@/lib/ai-core/quality-authority/types";

export { isPaidWebsitePlan } from "@/lib/ai-core/quality-authority/billing";
export { QualityGateBlockedError } from "@/lib/ai-core/quality-authority/errors";
export { isQualityGateEnforcementEnabled } from "@/lib/ai-core/quality-authority/flags";
export {
  classifyValidationGateIssues,
  countBlockingIssues,
  evaluateProjectQualityGate,
  issueCategory,
} from "@/lib/ai-core/quality-authority/gates";
export { computeUnifiedQualityScores } from "@/lib/ai-core/quality-authority/score";
export { verifyPostRepair } from "@/lib/ai-core/quality-authority/verification";
