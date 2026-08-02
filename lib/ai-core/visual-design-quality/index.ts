export type {
  VisualDesignQualityContext,
  VisualDesignQualityReport,
  VisualQualityDimension,
  VisualQualityIssue,
  VisualQualityScores,
  VisualQualitySeverity,
} from "@/lib/ai-core/visual-design-quality/types";

export { isVisualDesignQualityEnabled } from "@/lib/ai-core/visual-design-quality/flags";

export {
  runVisualDesignQuality,
  type RunVisualDesignQualityParams,
} from "@/lib/ai-core/visual-design-quality/analyze";

export { buildVisualDesignRepairInstruction } from "@/lib/ai-core/visual-design-quality/build-repair";
export { buildVisualDesignQualityContext } from "@/lib/ai-core/visual-design-quality/policies";
export {
  buildVisualDesignQualitySummary,
  computeVisualQualityScores,
} from "@/lib/ai-core/visual-design-quality/score";
