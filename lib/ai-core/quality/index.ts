/**
 * Auto Quality Engine (Phase 8).
 */

export type {
  CoreAutoQualityReport,
  CorePublishReadiness,
} from "@/lib/ai-core/quality/types";

export {
  buildAutoQualityReport,
  finalizeQualityForPublish,
  type BuildAutoQualityReportInput,
} from "@/lib/ai-core/quality/report";
