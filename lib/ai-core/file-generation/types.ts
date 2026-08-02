import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { LlmConcurrencyGate } from "@/lib/ai-core/file-generation/llm-gate";

/** How a planned file will be produced during generation. */
export type FileTaskKind =
  | "scaffold"
  | "library-scaffold"
  | "deferred"
  | "reuse"
  | "llm";

/** Directed edge in the file dependency graph (from → to). */
export type FileDependencyEdge = {
  from: string;
  to: string;
  reason: string;
};

export type FileGenerationTask = {
  id: string;
  path: string;
  waveId: string;
  kind: FileTaskKind;
  plannedFile: PlannedFile;
  dependsOn: string[];
  contextPolicy: "snapshot" | "strict-serial";
};

export type WaveCheckpointPolicy = "none" | "end" | "per-task";

export type FileGenerationWave = {
  id: string;
  index: number;
  name: string;
  tasks: FileGenerationTask[];
  maxConcurrency: number;
  checkpoint: WaveCheckpointPolicy;
};

export type FileGenerationWavePlan = {
  waves: FileGenerationWave[];
  /** Deterministic serial order — matches upstream filePlans in Phase 2.1. */
  executionOrder: FileGenerationTask[];
  strictSerialContext: boolean;
  maxGlobalConcurrency: number;
  taskByPath: Map<string, FileGenerationTask>;
};

export type FileGenerationSchedulerStats = {
  wavesExecuted: number;
  tasksExecuted: number;
  tasksSkipped: number;
  llmTasks: number;
  totalDurationMs: number;
};

export type FileGenerationSchedulerResult = {
  files: GeneratedProjectFile[];
  completedWaves: string[];
  completedPaths: string[];
  failedPaths: Array<{ path: string; error: string }>;
  stats: FileGenerationSchedulerStats;
};

export type FileTaskExecutionContext = {
  waveId: string;
  task: FileGenerationTask;
  /** Files completed in all prior waves (snapshot context). */
  snapshotFiles: GeneratedProjectFile[];
  /** Files to pass into prompt construction for this task. */
  contextFiles: GeneratedProjectFile[];
  /** Mutable accumulator — strict-serial mode includes prior tasks in this wave. */
  workingFiles: GeneratedProjectFile[];
  taskIndex: number;
  totalTasks: number;
};

export type FileTaskExecutor = (
  context: FileTaskExecutionContext,
) => Promise<GeneratedProjectFile | null>;

export type FileGenerationSchedulerOptions = {
  wavePlan: FileGenerationWavePlan;
  initialFiles: GeneratedProjectFile[];
  /** Required for Smart Context Engine resolution in scheduler. */
  filePlans?: PlannedFile[];
  composeHomePage?: boolean;
  executeTask: FileTaskExecutor;
  llmGate?: LlmConcurrencyGate;
  onWaveStart?: (wave: FileGenerationWave) => void;
  onWaveComplete?: (wave: FileGenerationWave, files: GeneratedProjectFile[]) => void;
  onTaskComplete?: (
    task: FileGenerationTask,
    file: GeneratedProjectFile | null,
    files: GeneratedProjectFile[],
  ) => void;
};

/** Product adapter — builds graph edges and resolves task kinds. */
export type FileGenerationProductAdapter = {
  productId: string;
  resolveTaskKind: (plannedFile: PlannedFile, context: FileTaskKindContext) => FileTaskKind;
  buildDependencyEdges: (
    filePlans: PlannedFile[],
    context: FileTaskKindContext,
  ) => FileDependencyEdge[];
  waveConcurrencyForProfile: (
    profile: string,
    waveName: string,
  ) => number;
};

export type FileTaskKindContext = {
  scaffoldPaths: ReadonlySet<string>;
  localizedCopy: boolean;
  composeHomePage: boolean;
  generationProfile: string;
  reusePrevious: boolean;
  previousPaths: ReadonlySet<string>;
  hasLibraryScaffold: (path: string) => boolean;
  shouldDeferHomePage: (path: string) => boolean;
};

export type BuildWavePlanOptions = {
  filePlans: PlannedFile[];
  adapter: FileGenerationProductAdapter;
  kindContext: FileTaskKindContext;
  strictSerialContext?: boolean;
  maxGlobalConcurrency?: number;
};
