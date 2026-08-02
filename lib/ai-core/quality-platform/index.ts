export type {
  UnifiedPublishGateResult,
  UnifiedQualityDashboardModel,
  UnifiedQualityIssue,
  UnifiedQualityReport,
  UnifiedQualityTelemetry,
  UnifiedQualityTrace,
  UnifiedRepairQueueItem,
} from "@/lib/ai-core/quality-platform/types";

export {
  isUnifiedQualityPlatformEnabled,
  QUALITY_PLATFORM_VERSION,
} from "@/lib/ai-core/quality-platform/flags";

export {
  collapseOverlappingMessages,
  dedupeRepairInstructions,
  dedupeStrings,
  issueFingerprint,
  normalizeQualityMessage,
} from "@/lib/ai-core/quality-platform/heuristics";

export {
  buildUnifiedRepairQueue,
  mergeWeakSections,
} from "@/lib/ai-core/quality-platform/repair-queue";

export {
  buildQualityTrace,
  buildUnifiedQualityReport,
  createQualityTelemetry,
} from "@/lib/ai-core/quality-platform/report";

export { toQualityDashboardModel } from "@/lib/ai-core/quality-platform/dashboard";
export { evaluateUnifiedPublishGates } from "@/lib/ai-core/quality-platform/publish";

export {
  runUnifiedQualityPipeline,
  type UnifiedQualityPipelineParams,
  type UnifiedQualityPipelineResult,
} from "@/lib/ai-core/quality-platform/pipeline";
