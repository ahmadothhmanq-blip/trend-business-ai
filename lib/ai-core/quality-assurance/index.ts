export {
  runQualityAssuranceEngine,
  runQualityAssuranceFromBrief,
  getQualityAssuranceTraceFromBrief,
  getQualitySpecificationFromBrief,
  persistQualityAssuranceOnBrief,
  type RunQualityAssuranceEngineParams,
} from "@/lib/ai-core/quality-assurance/qashe-engine";
export {
  QUALITY_ASSURANCE_TRACE_KEY,
  QUALITY_SPECIFICATION_KEY,
  QUALITY_ASSURANCE_ENGINE_ID,
  QUALITY_ASSURANCE_ENGINE_VERSION,
  type QualityAssuranceTrace,
  type QualityTraceEntry,
  type QualityPolicy,
  type QualitySpecification,
  type QualityAssuranceValidation,
  type QualityAssuranceEngineResult,
  type RemediationAction,
  type ValidationResult,
} from "@/lib/ai-core/quality-assurance/qashe-types";
export { resolveQualityPolicy } from "@/lib/ai-core/quality-assurance/policies";
export {
  validateCrossEngineConsistency,
  validateArtifactContent,
  validateQualitySpecification,
  resetQualityValidationTraceCounter,
} from "@/lib/ai-core/quality-assurance/validate-pipeline";
export { buildQualitySpecification } from "@/lib/ai-core/quality-assurance/build-spec";
export { applySelfHealing } from "@/lib/ai-core/quality-assurance/self-heal";
export {
  getQualityKnowledgeEntry,
  QUALITY_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/quality-assurance/knowledge-base/catalog";
