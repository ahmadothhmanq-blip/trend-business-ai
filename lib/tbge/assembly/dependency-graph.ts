/**
 * File graph dependency analysis and wave scheduling.
 */

import type { FileGraphNode, FileGraphWaveId } from "@/lib/tbge/spec/types";

const WAVE_ORDER: FileGraphWaveId[] = [
  "static-scaffold",
  "foundation",
  "components",
  "hooks-api",
  "pages",
  "inject",
  "configs-tail",
];

export type DependencyGraphValidation =
  | { valid: true; levels: FileGraphNode[][] }
  | { valid: false; errors: string[] };

function waveRank(wave: FileGraphWaveId): number {
  const index = WAVE_ORDER.indexOf(wave);
  return index === -1 ? WAVE_ORDER.length : index;
}

export function buildExecutionLevels(nodes: FileGraphNode[]): FileGraphNode[][] {
  const remaining = new Map(nodes.map((node) => [node.path, node]));
  const completed = new Set<string>();
  const levels: FileGraphNode[][] = [];

  while (remaining.size > 0) {
    const ready = [...remaining.values()].filter((node) =>
      node.deps.every((dep) => completed.has(dep)),
    );

    if (!ready.length) {
      throw new Error("Dependency cycle detected in file graph");
    }

    ready.sort((a, b) => {
      const waveDiff = waveRank(a.wave) - waveRank(b.wave);
      if (waveDiff !== 0) return waveDiff;
      return a.priority - b.priority;
    });

    levels.push(ready);
    for (const node of ready) {
      completed.add(node.path);
      remaining.delete(node.path);
    }
  }

  return levels;
}

export function validateDependencyGraph(nodes: FileGraphNode[]): DependencyGraphValidation {
  const errors: string[] = [];
  const paths = new Set(nodes.map((node) => node.path));

  for (const node of nodes) {
    for (const dep of node.deps) {
      if (!paths.has(dep)) {
        errors.push(`Missing dependency "${dep}" for node "${node.path}"`);
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const adjacency = new Map(nodes.map((node) => [node.path, node.deps]));

  function visit(path: string) {
    if (visited.has(path)) return;
    if (visiting.has(path)) {
      errors.push(`Dependency cycle detected at "${path}"`);
      return;
    }
    visiting.add(path);
    for (const dep of adjacency.get(path) ?? []) {
      visit(dep);
    }
    visiting.delete(path);
    visited.add(path);
  }

  for (const node of nodes) {
    visit(node.path);
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return { valid: true, levels: buildExecutionLevels(nodes) };
}
