/**
 * Wave Checkpoint Engine — batches Supabase persistence for wave-scheduled file generation.
 * Infrastructure only; does not alter generation output or scheduler execution order.
 */

import { isWaveSchedulerEnabled } from "@/lib/ai-core/file-generation/flags";
import type { WaveCheckpointPolicy } from "@/lib/ai-core/file-generation/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "true" || value === "1";
}

/** WB_WAVE_CHECKPOINT_ENGINE=0 disables; default on when WB_WAVE_SCHEDULER=1. */
export function isWaveCheckpointEngineEnabled(): boolean {
  const explicit = process.env.WB_WAVE_CHECKPOINT_ENGINE;
  if (explicit === "0" || explicit === "false") return false;
  if (envTruthy("WB_WAVE_CHECKPOINT_ENGINE")) return true;
  return isWaveSchedulerEnabled();
}

export type WaveCheckpointEventMeta = {
  type: "task" | "wave-end";
  waveName: string;
  policy: WaveCheckpointPolicy;
};

export type FilesCheckpointMeta = {
  message: string;
  waveCheckpoint?: WaveCheckpointEventMeta;
};

export type WaveGenerationState = {
  completedWaves: string[];
  completedPaths: string[];
  lastFlushedAt: string | null;
  schedulerMode: "serial" | "wave";
  checkpointWriteCount: number;
};

export type WaveCheckpointFlushArgs = {
  files: GeneratedProjectFile[];
  message: string;
  waveState: WaveGenerationState;
};

export type WaveCheckpointEngineOptions = {
  enabled: boolean;
  schedulerMode: "serial" | "wave";
  coalesceMs?: number;
  flush: (args: WaveCheckpointFlushArgs) => Promise<void>;
};

export type WaveCheckpointEngine = {
  handleFilesCheckpoint: (
    files: GeneratedProjectFile[],
    meta: FilesCheckpointMeta,
  ) => Promise<void>;
  drain: () => Promise<void>;
  getState: () => WaveGenerationState;
  getWriteCount: () => number;
};

function mergeFilesByPath(
  current: GeneratedProjectFile[],
  incoming: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const byPath = new Map(current.map((file) => [file.path, file]));
  for (const file of incoming) {
    byPath.set(file.path, file);
  }
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function createWaveCheckpointEngine(
  options: WaveCheckpointEngineOptions,
): WaveCheckpointEngine {
  let files: GeneratedProjectFile[] = [];
  let flushQueue: Promise<void> = Promise.resolve();
  let coalesceTimer: ReturnType<typeof setTimeout> | null = null;
  let coalesceMessage = "";
  let writeCount = 0;

  const waveState: WaveGenerationState = {
    completedWaves: [],
    completedPaths: [],
    lastFlushedAt: null,
    schedulerMode: options.schedulerMode,
    checkpointWriteCount: 0,
  };

  const commitFlush = (message: string): Promise<void> => {
    flushQueue = flushQueue
      .then(async () => {
        waveState.lastFlushedAt = new Date().toISOString();
        waveState.checkpointWriteCount += 1;
        writeCount += 1;
        await options.flush({
          files: [...files],
          message,
          waveState: {
            ...waveState,
            completedWaves: [...waveState.completedWaves],
            completedPaths: [...waveState.completedPaths],
            checkpointWriteCount: writeCount,
          },
        });
      })
      .catch(() => {
        // Flush failures are non-fatal; caller logs at persistence layer.
      });
    return flushQueue;
  };

  const scheduleCoalescedFlush = (message: string) => {
    coalesceMessage = message;
    if (coalesceTimer) {
      clearTimeout(coalesceTimer);
    }
    coalesceTimer = setTimeout(() => {
      coalesceTimer = null;
      void commitFlush(coalesceMessage);
    }, options.coalesceMs ?? 300);
  };

  const cancelCoalescedFlush = async () => {
    if (!coalesceTimer) return;
    clearTimeout(coalesceTimer);
    coalesceTimer = null;
    await commitFlush(coalesceMessage || "Checkpoint coalesce flush");
  };

  return {
    getState: () => ({
      ...waveState,
      completedWaves: [...waveState.completedWaves],
      completedPaths: [...waveState.completedPaths],
      checkpointWriteCount: writeCount,
    }),
    getWriteCount: () => writeCount,

    async handleFilesCheckpoint(
      incomingFiles: GeneratedProjectFile[],
      meta: FilesCheckpointMeta,
    ) {
      files = mergeFilesByPath(files, incomingFiles);
      waveState.completedPaths = files.map((file) => file.path);

      if (!options.enabled) {
        await commitFlush(meta.message);
        return;
      }

      const wave = meta.waveCheckpoint;
      if (!wave) {
        await commitFlush(meta.message);
        return;
      }

      if (wave.policy === "none") {
        return;
      }

      if (wave.type === "wave-end") {
        await cancelCoalescedFlush();
        if (!waveState.completedWaves.includes(wave.waveName)) {
          waveState.completedWaves.push(wave.waveName);
        }
        await commitFlush(meta.message);
        return;
      }

      if (wave.policy === "end") {
        return;
      }

      scheduleCoalescedFlush(meta.message);
    },

    async drain() {
      await cancelCoalescedFlush();
      await flushQueue;
    },
  };
}

/**
 * Legacy per-file checkpoint count estimator (one Supabase write per file checkpoint).
 */
export function estimateLegacyCheckpointWrites(fileCheckpointEvents: number): number {
  return fileCheckpointEvents;
}

/**
 * Estimate writes under wave checkpoint policy without hitting the database.
 */
export function estimateWaveCheckpointWrites(
  waves: Array<{ name: string; checkpoint: WaveCheckpointPolicy; taskCount: number }>,
): number {
  let writes = 0;
  for (const wave of waves) {
    if (wave.checkpoint === "none") continue;
    if (wave.checkpoint === "end") {
      writes += 1;
      continue;
    }
    // per-task: coalesced to one write per wave in practice
    writes += 1;
  }
  return writes;
}
