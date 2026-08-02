import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { FileDependencyEdge } from "@/lib/ai-core/file-generation/types";

export type RepairWave = {
  index: number;
  /** Targets repaired in this wave — may run in parallel when length > 1. */
  targets: string[];
};

export type RepairWavePlan = {
  waves: RepairWave[];
  /** Targets that must remain serial (safety partition). */
  serialOnlyTargets: string[];
  /** Total targets scheduled. */
  targetCount: number;
  /** Targets eligible for parallel execution within a wave. */
  parallelizableTargetCount: number;
};

export type RepairExecutionStats = {
  waveCount: number;
  targetsRepaired: number;
  peakConcurrency: number;
  durationMs: number;
  retryCount: number;
  rolledBackWaves: number;
};

export type RepairFileResult = {
  path: string;
  file: GeneratedProjectFile;
  success: boolean;
  error?: string;
};

export type SafeParallelRepairResult = {
  files: GeneratedProjectFile[];
  stats: RepairExecutionStats;
  completedPaths: string[];
};

export type SafeParallelRepairOptions = {
  targets: string[];
  filePlans: PlannedFile[];
  files: GeneratedProjectFile[];
  maxConcurrency?: number;
  composeHomePage?: boolean;
  onProgress?: (message: string) => void;
  repairFile: (
    targetPath: string,
    snapshotFiles: GeneratedProjectFile[],
  ) => Promise<GeneratedProjectFile>;
  validateWave?: (
    files: GeneratedProjectFile[],
    repairedPaths: string[],
  ) => boolean;
};

export type RepairDependencyEdge = FileDependencyEdge;
