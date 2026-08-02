export {
  COMPONENTS_SECTIONS_PREFIX,
  COMPONENTS_WAVE_NAME,
  isComponentsSectionsPath,
} from "@/lib/ai-core/file-generation/constants";

export {
  fileGenerationFlags,
  isWaveSchedulerEnabled,
  resolveLlmConcurrencyCap,
  resolvePhase21MaxConcurrency,
} from "@/lib/ai-core/file-generation/flags";

export {
  buildCategoryRankEdges,
  buildFileDependencyGraph,
  computeLongestPathDepths,
} from "@/lib/ai-core/file-generation/dependency-graph";
export type { DependencyGraph, WebsiteDependencyGraphOptions } from "@/lib/ai-core/file-generation/dependency-graph";

export {
  assertWavePlanCoversFiles,
  buildFileGenerationWavePlan,
  flattenWavePlanTasks,
} from "@/lib/ai-core/file-generation/wave-planner";

export {
  createContextSnapshot,
  mergeSnapshotFile,
  snapshotFilesForTask,
} from "@/lib/ai-core/file-generation/context-snapshot";
export type { ContextSnapshot } from "@/lib/ai-core/file-generation/context-snapshot";

export { LlmConcurrencyGate, isRateLimitError } from "@/lib/ai-core/file-generation/llm-gate";
export type { LlmConcurrencyGateOptions } from "@/lib/ai-core/file-generation/llm-gate";

export { runBoundedWorkerPool } from "@/lib/ai-core/file-generation/worker-pool";

export { runFileGenerationScheduler } from "@/lib/ai-core/file-generation/scheduler";

export type {
  BuildWavePlanOptions,
  FileDependencyEdge,
  FileGenerationProductAdapter,
  FileGenerationSchedulerOptions,
  FileGenerationSchedulerResult,
  FileGenerationSchedulerStats,
  FileGenerationWave,
  FileGenerationWavePlan,
  FileGenerationTask,
  FileTaskExecutionContext,
  FileTaskExecutor,
  FileTaskKind,
  FileTaskKindContext,
  WaveCheckpointPolicy,
} from "@/lib/ai-core/file-generation/types";
