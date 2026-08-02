import type { PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { buildFileDependencyGraph } from "@/lib/ai-core/file-generation/dependency-graph";
import {
  buildImportRepairEdges,
  canRepairTargetsInParallel,
} from "@/lib/ai-core/repair-engine/import-safety";
import type { RepairWave, RepairWavePlan } from "@/lib/ai-core/repair-engine/types";

function uniqueSorted(paths: string[]): string[] {
  return [...new Set(paths)].sort((a, b) => a.localeCompare(b));
}

/**
 * Plan repair waves from structural + import dependencies.
 * Targets within a wave have no dependency on each other and pass import-safety checks.
 */
export function planRepairWaves(params: {
  targets: string[];
  filePlans: PlannedFile[];
  files: GeneratedProjectFile[];
  composeHomePage?: boolean;
}): RepairWavePlan {
  const targets = uniqueSorted(params.targets);
  if (targets.length === 0) {
    return {
      waves: [],
      serialOnlyTargets: [],
      targetCount: 0,
      parallelizableTargetCount: 0,
    };
  }

  const targetSet = new Set(targets);
  const graph = buildFileDependencyGraph(params.filePlans, {
    composeHomePage: params.composeHomePage ?? true,
  });

  const structuralEdges = graph.edges.filter(
    (edge) => targetSet.has(edge.from) && targetSet.has(edge.to),
  );
  const importEdges = buildImportRepairEdges(targets, params.files);
  const allEdges = [...structuralEdges, ...importEdges];

  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();
  for (const path of targets) {
    incoming.set(path, new Set());
    outgoing.set(path, new Set());
  }

  for (const edge of allEdges) {
    if (!incoming.has(edge.to) || !outgoing.has(edge.from)) continue;
    incoming.get(edge.to)!.add(edge.from);
    outgoing.get(edge.from)!.add(edge.to);
  }

  const waves: RepairWave[] = [];
  const remaining = new Set(targets);
  let waveIndex = 0;

  while (remaining.size > 0) {
    const ready = [...remaining].filter(
      (path) => ![...incoming.get(path)!].some((dep) => remaining.has(dep)),
    );

    if (ready.length === 0) {
      // Cycle fallback — repair one serially.
      const fallback = [...remaining].sort((a, b) => a.localeCompare(b))[0]!;
      waves.push({ index: waveIndex, targets: [fallback] });
      remaining.delete(fallback);
      waveIndex += 1;
      continue;
    }

    const filesByPath = new Map(params.files.map((file) => [file.path, file]));
    const projectPaths = new Set(params.files.map((file) => file.path));
    const waveTargets: string[] = [];

    for (const candidate of ready.sort((a, b) => a.localeCompare(b))) {
      const parallelSafe = waveTargets.every((existing) =>
        canRepairTargetsInParallel(
          existing,
          candidate,
          filesByPath,
          projectPaths,
        ),
      );
      if (parallelSafe) {
        waveTargets.push(candidate);
      }
    }

    const serialOverflow = ready.filter((path) => !waveTargets.includes(path));
    if (waveTargets.length > 0) {
      waves.push({ index: waveIndex, targets: waveTargets });
      for (const path of waveTargets) {
        remaining.delete(path);
      }
      waveIndex += 1;
    }

    for (const path of serialOverflow.sort((a, b) => a.localeCompare(b))) {
      waves.push({ index: waveIndex, targets: [path] });
      remaining.delete(path);
      waveIndex += 1;
    }
  }

  const parallelizableTargetCount = waves.reduce(
    (sum, wave) => sum + (wave.targets.length > 1 ? wave.targets.length : 0),
    0,
  );
  const serialOnlyTargets = waves
    .filter((wave) => wave.targets.length === 1)
    .flatMap((wave) => wave.targets);

  return {
    waves,
    serialOnlyTargets,
    targetCount: targets.length,
    parallelizableTargetCount,
  };
}

/**
 * Estimate serial vs parallel repair wave counts for benchmarking.
 */
export function estimateRepairWaveCounts(targetCount: number): {
  serialWaves: number;
  parallelWaves: number;
} {
  return {
    serialWaves: targetCount,
    parallelWaves: Math.max(1, Math.ceil(targetCount / 4)),
  };
}
