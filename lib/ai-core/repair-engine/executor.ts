import { performance } from "node:perf_hooks";
import { runBoundedWorkerPool } from "@/lib/ai-core/file-generation/worker-pool";
import { resolveRepairConcurrencyCap } from "@/lib/ai-core/repair-engine/flags";
import { planRepairWaves } from "@/lib/ai-core/repair-engine/wave-planner";
import type {
  RepairExecutionStats,
  SafeParallelRepairOptions,
  SafeParallelRepairResult,
} from "@/lib/ai-core/repair-engine/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

function mergeFiles(
  current: GeneratedProjectFile[],
  updates: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const byPath = new Map(current.map((file) => [file.path, file]));
  for (const file of updates) {
    byPath.set(file.path, file);
  }
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function cloneFiles(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  return files.map((file) => ({ ...file }));
}

/**
 * Execute repairs in dependency-ordered waves with bounded parallelism.
 * Rolls back a wave if post-wave validation fails.
 */
export async function runSafeParallelRepair(
  options: SafeParallelRepairOptions,
): Promise<SafeParallelRepairResult> {
  const started = performance.now();
  const maxConcurrency = options.maxConcurrency ?? resolveRepairConcurrencyCap();
  const plan = planRepairWaves({
    targets: options.targets,
    filePlans: options.filePlans,
    files: options.files,
    composeHomePage: options.composeHomePage,
  });

  let currentFiles = [...options.files];
  const completedPaths: string[] = [];
  let peakConcurrency = 0;
  let retryCount = 0;
  let rolledBackWaves = 0;

  for (const wave of plan.waves) {
    const waveSnapshot = cloneFiles(currentFiles);
    peakConcurrency = Math.max(peakConcurrency, wave.targets.length);

    options.onProgress?.(
      `[repair-engine] Wave ${wave.index + 1}/${plan.waves.length} · ${wave.targets.length} target(s)`,
    );

    const repairs = await runBoundedWorkerPool({
      items: wave.targets,
      concurrency: Math.min(maxConcurrency, wave.targets.length),
      worker: async (targetPath) => {
        try {
          const repaired = await options.repairFile(targetPath, waveSnapshot);
          return { path: targetPath, file: repaired, success: true as const };
        } catch (error) {
          retryCount += 1;
          const existing = waveSnapshot.find((file) => file.path === targetPath);
          return {
            path: targetPath,
            file: existing ?? {
              path: targetPath,
              content: "",
              language: "tsx",
            },
            success: false as const,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    });

    const successful = repairs.filter((entry) => entry.success);
    currentFiles = mergeFiles(
      currentFiles,
      successful.map((entry) => entry.file),
    );
    completedPaths.push(...successful.map((entry) => entry.path));

    const waveValid =
      options.validateWave?.(
        currentFiles,
        successful.map((entry) => entry.path),
      ) ?? true;

    if (!waveValid) {
      currentFiles = waveSnapshot;
      rolledBackWaves += 1;
      options.onProgress?.(
        `[repair-engine] Wave ${wave.index + 1} rolled back — validation regression`,
      );
    }
  }

  const stats: RepairExecutionStats = {
    waveCount: plan.waves.length,
    targetsRepaired: completedPaths.length,
    peakConcurrency: Math.min(peakConcurrency, maxConcurrency),
    durationMs: Math.round(performance.now() - started),
    retryCount,
    rolledBackWaves,
  };

  return {
    files: currentFiles,
    stats,
    completedPaths: uniqueSorted(completedPaths),
  };
}

function uniqueSorted(paths: string[]): string[] {
  return [...new Set(paths)].sort((a, b) => a.localeCompare(b));
}

/**
 * Serial repair fallback — one target at a time (legacy behavior).
 */
export async function runSerialRepair(
  options: SafeParallelRepairOptions,
): Promise<SafeParallelRepairResult> {
  const started = performance.now();
  let currentFiles = [...options.files];
  const completedPaths: string[] = [];
  let retryCount = 0;

  for (const targetPath of [...new Set(options.targets)].sort((a, b) =>
    a.localeCompare(b),
  )) {
    const snapshot = cloneFiles(currentFiles);
    try {
      const repaired = await options.repairFile(targetPath, snapshot);
      currentFiles = mergeFiles(currentFiles, [repaired]);
      completedPaths.push(targetPath);
    } catch {
      retryCount += 1;
    }
  }

  return {
    files: currentFiles,
    stats: {
      waveCount: options.targets.length,
      targetsRepaired: completedPaths.length,
      peakConcurrency: 1,
      durationMs: Math.round(performance.now() - started),
      retryCount,
      rolledBackWaves: 0,
    },
    completedPaths,
  };
}
