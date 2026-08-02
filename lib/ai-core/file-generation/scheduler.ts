import { performance } from "node:perf_hooks";
import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  COMPONENTS_WAVE_NAME,
  isComponentsSectionsPath,
} from "@/lib/ai-core/file-generation/constants";
import {
  createContextSnapshot,
  mergeSnapshotFile,
  resolveTaskContextFiles,
  snapshotFilesForTask,
  type ContextSnapshot,
} from "@/lib/ai-core/file-generation/context-snapshot";
import { runBoundedWorkerPool } from "@/lib/ai-core/file-generation/worker-pool";
import type {
  FileGenerationSchedulerOptions,
  FileGenerationSchedulerResult,
  FileGenerationTask,
  FileGenerationWave,
  FileTaskExecutionContext,
} from "@/lib/ai-core/file-generation/types";

type WaveGroup = {
  wave: FileGenerationWave;
  tasks: FileGenerationTask[];
};

type RunState = {
  snapshot: ContextSnapshot;
  workingFiles: GeneratedProjectFile[];
  completedWaves: string[];
  completedPaths: string[];
  failedPaths: Array<{ path: string; error: string }>;
  stats: FileGenerationSchedulerResult["stats"];
};

function groupTasksByWave(
  executionOrder: FileGenerationTask[],
  waveById: Map<string, FileGenerationWave>,
): WaveGroup[] {
  const groups: WaveGroup[] = [];

  for (const task of executionOrder) {
    const wave = waveById.get(task.waveId);
    if (!wave) {
      throw new Error(`Wave scheduler missing wave definition: ${task.waveId}`);
    }

    const last = groups[groups.length - 1];
    if (last && last.wave.id === wave.id) {
      last.tasks.push(task);
      continue;
    }

    groups.push({ wave, tasks: [task] });
  }

  return groups;
}

function applyTaskResult(
  state: RunState,
  task: FileGenerationTask,
  result: GeneratedProjectFile | null,
  options: FileGenerationSchedulerOptions,
): void {
  state.stats.tasksExecuted += 1;
  if (task.kind === "llm") {
    state.stats.llmTasks += 1;
  }

  if (result) {
    state.workingFiles = state.workingFiles.filter(
      (file) => file.path !== result.path,
    );
    state.workingFiles.push(result);
    state.snapshot = mergeSnapshotFile(state.snapshot, result);
    state.completedPaths.push(result.path);
    options.onTaskComplete?.(task, result, [...state.workingFiles]);
  } else {
    state.stats.tasksSkipped += 1;
    options.onTaskComplete?.(task, null, [...state.workingFiles]);
  }
}

async function executeSingleTask(
  options: FileGenerationSchedulerOptions,
  state: RunState,
  task: FileGenerationTask,
  wave: FileGenerationWave,
  taskIndex: number,
  totalTasks: number,
  waveEntrySnapshot: ContextSnapshot,
): Promise<GeneratedProjectFile | null> {
  const contextFiles = snapshotFilesForTask(
    waveEntrySnapshot,
    state.workingFiles,
    task.contextPolicy,
  );

  const resolvedContextFiles = options.filePlans
    ? resolveTaskContextFiles({
        targetPath: task.path,
        targetCategory: task.plannedFile.category,
        contextFiles,
        filePlans: options.filePlans,
        dependsOn: task.dependsOn,
        contextPolicy: task.contextPolicy,
        composeHomePage: options.composeHomePage,
      })
    : contextFiles;

  const executionContext: FileTaskExecutionContext = {
    waveId: wave.id,
    task,
    snapshotFiles: waveEntrySnapshot.files,
    contextFiles: resolvedContextFiles,
    workingFiles: [...state.workingFiles],
    taskIndex,
    totalTasks,
  };

  const run = () => options.executeTask(executionContext);

  if (task.kind === "llm" && options.llmGate) {
    return options.llmGate.run(run);
  }

  return run();
}

async function runWaveSerial(
  options: FileGenerationSchedulerOptions,
  state: RunState,
  wave: FileGenerationWave,
  tasks: FileGenerationTask[],
): Promise<void> {
  const totalTasks = tasks.length;

  for (let index = 0; index < tasks.length; index += 1) {
    const task = tasks[index]!;
    try {
      const result = await executeSingleTask(
        options,
        state,
        task,
        wave,
        index + 1,
        totalTasks,
        state.snapshot,
      );
      applyTaskResult(state, task, result, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      state.failedPaths.push({ path: task.path, error: message });
      throw error;
    }
  }
}

async function runComponentsWave(
  options: FileGenerationSchedulerOptions,
  state: RunState,
  wave: FileGenerationWave,
  tasks: FileGenerationTask[],
): Promise<void> {
  const totalTasks = tasks.length;
  let taskIndex = 0;
  let parallelBatch: FileGenerationTask[] = [];

  const flushParallelBatch = async () => {
    if (parallelBatch.length === 0) return;

    const batch = [...parallelBatch].sort((a, b) =>
      a.path.localeCompare(b.path),
    );
    parallelBatch = [];
    const batchSnapshot = state.snapshot;

    const concurrency = Math.min(wave.maxConcurrency, batch.length);

    const results = await runBoundedWorkerPool({
      items: batch,
      concurrency,
      worker: async (task) => {
        const result = await executeSingleTask(
          options,
          state,
          task,
          wave,
          tasks.indexOf(task) + 1,
          totalTasks,
          batchSnapshot,
        );
        return { task, result };
      },
    });

    for (const entry of results.sort((a, b) =>
      a.task.path.localeCompare(b.task.path),
    )) {
      applyTaskResult(state, entry.task, entry.result, options);
    }
  };

  for (const task of tasks) {
    taskIndex += 1;

    const canParallelize =
      wave.name === COMPONENTS_WAVE_NAME &&
      isComponentsSectionsPath(task.path) &&
      wave.maxConcurrency > 1;

    if (canParallelize) {
      parallelBatch.push(task);
      continue;
    }

    await flushParallelBatch();

    try {
      const result = await executeSingleTask(
        options,
        state,
        task,
        wave,
        taskIndex,
        totalTasks,
        state.snapshot,
      );
      applyTaskResult(state, task, result, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      state.failedPaths.push({ path: task.path, error: message });
      throw error;
    }
  }

  await flushParallelBatch();
}

function shouldRunComponentsWaveParallel(wave: FileGenerationWave): boolean {
  return wave.name === COMPONENTS_WAVE_NAME && wave.maxConcurrency > 1;
}

/**
 * Execute a wave plan.
 * Phase 2.2: parallel bounded pool for components/sections/* only; all other waves serial.
 */
export async function runFileGenerationScheduler(
  options: FileGenerationSchedulerOptions,
): Promise<FileGenerationSchedulerResult> {
  const started = performance.now();
  const state: RunState = {
    snapshot: createContextSnapshot(options.initialFiles),
    workingFiles: [...options.initialFiles],
    completedWaves: [],
    completedPaths: [],
    failedPaths: [],
    stats: {
      wavesExecuted: 0,
      tasksExecuted: 0,
      tasksSkipped: 0,
      llmTasks: 0,
      totalDurationMs: 0,
    },
  };

  const waveById = new Map(
    options.wavePlan.waves.map((wave) => [wave.id, wave]),
  );

  const waveGroups = groupTasksByWave(
    options.wavePlan.executionOrder,
    waveById,
  );

  for (const { wave, tasks } of waveGroups) {
    options.onWaveStart?.(wave);

    if (shouldRunComponentsWaveParallel(wave)) {
      await runComponentsWave(options, state, wave, tasks);
    } else {
      await runWaveSerial(options, state, wave, tasks);
    }

    state.completedWaves.push(wave.id);
    state.stats.wavesExecuted += 1;
    options.onWaveComplete?.(wave, [...state.workingFiles]);
  }

  state.stats.totalDurationMs = Math.round(performance.now() - started);

  return {
    files: state.workingFiles,
    completedWaves: state.completedWaves,
    completedPaths: state.completedPaths,
    failedPaths: state.failedPaths,
    stats: state.stats,
  };
}
