export type {
  ExperimentStatus,
  ExperimentChangeType,
  ExperimentVariant,
  ExperimentVariantChange,
  WebsiteExperiment,
  CreateExperimentInput,
  ExperimentAssignment,
  ExperimentResults,
} from "@/lib/ai-core/ab-testing/types";

export {
  listExperiments,
  getExperiment,
  createExperiment,
  updateExperimentStatus,
  duplicateSectionForVariant,
  recordVariantMetric,
  setWinner,
  ensureDemoExperiment,
} from "@/lib/ai-core/ab-testing/store";

export {
  assignVariant,
  computeWinnerConfidence,
  evaluateExperimentResults,
  getRunningAssignment,
  listExperimentResults,
} from "@/lib/ai-core/ab-testing/engine";
