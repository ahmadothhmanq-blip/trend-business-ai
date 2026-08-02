export {
  isParallelRepairEnabled,
  repairEngineFlags,
  resolveRepairConcurrencyCap,
} from "@/lib/ai-core/repair-engine/flags";
export {
  runSafeParallelRepair,
  runSerialRepair,
} from "@/lib/ai-core/repair-engine/executor";
export {
  buildImportRepairEdges,
  canRepairTargetsInParallel,
  fileImportsPath,
} from "@/lib/ai-core/repair-engine/import-safety";
export {
  estimateRepairWaveCounts,
  planRepairWaves,
} from "@/lib/ai-core/repair-engine/wave-planner";
export type {
  RepairExecutionStats,
  RepairWave,
  RepairWavePlan,
  SafeParallelRepairOptions,
  SafeParallelRepairResult,
} from "@/lib/ai-core/repair-engine/types";
