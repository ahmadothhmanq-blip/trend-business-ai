/**
 * App Builder wave scheduler — dependency-aware parallel file generation.
 *
 * Replaces coarse per-category barriers with tier + structural edges so
 * independent files (e.g. components, hooks, api) share a wave.
 */

import {
  inferCategoryFromPath,
  normalizeCategory,
  type FileCategory,
  type PlannedFile,
} from "@/lib/ai/planner";

export type WebAppDependencyEdge = {
  from: string;
  to: string;
  reason: string;
};

export type WebAppDependencyGraph = {
  paths: string[];
  edges: WebAppDependencyEdge[];
  /** Longest-path depth from roots; equal depth ⇒ same parallel wave. */
  depthByPath: Map<string, number>;
};

export type WebAppWaveScheduleAnalysis = {
  waveCount: number;
  maxWaveWidth: number;
  totalFiles: number;
  waves: Array<{ depth: number; paths: string[] }>;
  edges: WebAppDependencyEdge[];
  /** Categories that previously forced separate barriers but now share a wave. */
  removedCategoryBarriers: string[];
};

/** Parallel tiers — same tier ⇒ no barrier between categories. */
export const WEBAPP_WAVE_TIER: Record<FileCategory, number> = {
  configs: 0,
  lib: 1,
  types: 1,
  components: 2,
  hooks: 2,
  api: 2,
  layout: 3,
  pages: 4,
};

/** Legacy category barriers (Phase 2 and earlier). */
export const WEBAPP_LEGACY_CATEGORY_ORDER: FileCategory[] = [
  "configs",
  "lib",
  "types",
  "components",
  "hooks",
  "api",
  "layout",
  "pages",
];

function normalizePlanPath(path: string): string {
  return path.replaceAll("\\", "/");
}

function categoryOf(file: { path: string; category?: string }): FileCategory {
  if (file.category) return normalizeCategory(file.category);
  return inferCategoryFromPath(normalizePlanPath(file.path));
}

function addEdge(
  edges: WebAppDependencyEdge[],
  seen: Set<string>,
  from: string,
  to: string,
  reason: string,
) {
  if (from === to) return;
  const key = `${from}→${to}`;
  if (seen.has(key)) return;
  seen.add(key);
  edges.push({ from, to, reason });
}

function entitySlugFromDashboardPage(path: string): string | null {
  const match = normalizePlanPath(path).match(
    /^app\/dashboard\/([^/]+)\/page\.(ts|tsx|js|jsx)$/,
  );
  return match?.[1] ?? null;
}

/**
 * Structural + tier edges for App Builder AI file generation.
 * Tier edges link every lower-tier file to every higher-tier file (context barrier).
 * Structural edges capture layout/API coupling without serializing peer APIs/pages.
 */
export function buildWebAppDependencyEdges<
  T extends { path: string; category?: string },
>(filePlans: T[]): WebAppDependencyEdge[] {
  const plans = filePlans.map((file) => ({
    path: normalizePlanPath(file.path),
    category: categoryOf(file),
  }));
  const pathSet = new Set(plans.map((plan) => plan.path));
  const edges: WebAppDependencyEdge[] = [];
  const seen = new Set<string>();

  // Structural edges first (more specific reasons win over coarse tiers).
  const rootLayout = "app/layout.tsx";
  if (pathSet.has(rootLayout)) {
    for (const plan of plans) {
      if (plan.path === rootLayout) continue;
      // Layout content must exist before pages — never point layout → components
      // (components are a lower tier and must finish first).
      if (plan.category === "pages") {
        addEdge(edges, seen, rootLayout, plan.path, "root-layout");
      }
    }
  }

  const dashboardLayout = "app/dashboard/layout.tsx";
  if (pathSet.has(dashboardLayout)) {
    for (const plan of plans) {
      if (
        plan.path.startsWith("app/dashboard/") &&
        plan.path !== dashboardLayout
      ) {
        addEdge(edges, seen, dashboardLayout, plan.path, "dashboard-layout");
      }
    }
  }

  // Entity CRUD: API before matching dashboard page.
  for (const plan of plans) {
    const slug = entitySlugFromDashboardPage(plan.path);
    if (!slug) continue;
    const apiPath = `app/api/${slug}/route.ts`;
    if (pathSet.has(apiPath)) {
      addEdge(edges, seen, apiPath, plan.path, "entity-api");
    }
  }

  // Tier barriers (replaces 8 category walls with 5 parallel bands).
  for (let i = 0; i < plans.length; i += 1) {
    for (let j = 0; j < plans.length; j += 1) {
      if (i === j) continue;
      const left = plans[i]!;
      const right = plans[j]!;
      if (WEBAPP_WAVE_TIER[left.category] < WEBAPP_WAVE_TIER[right.category]) {
        addEdge(edges, seen, left.path, right.path, "wave-tier");
      }
    }
  }

  return edges;
}

export function computeWebAppLongestPathDepths(
  paths: string[],
  edges: WebAppDependencyEdge[],
): Map<string, number> {
  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();

  for (const path of paths) {
    incoming.set(path, new Set());
    outgoing.set(path, new Set());
  }

  for (const edge of edges) {
    if (!incoming.has(edge.to) || !outgoing.has(edge.from)) continue;
    incoming.get(edge.to)!.add(edge.from);
    outgoing.get(edge.from)!.add(edge.to);
  }

  const depthByPath = new Map<string, number>();
  const queue: string[] = [];

  for (const path of paths) {
    if ((incoming.get(path)?.size ?? 0) === 0) {
      depthByPath.set(path, 0);
      queue.push(path);
    }
  }

  const visited = new Set<string>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const currentDepth = depthByPath.get(current) ?? 0;

    for (const next of outgoing.get(current) ?? []) {
      const nextDepth = Math.max(depthByPath.get(next) ?? 0, currentDepth + 1);
      depthByPath.set(next, nextDepth);
      const deps = incoming.get(next)!;
      deps.delete(current);
      if (deps.size === 0) {
        queue.push(next);
      }
    }
  }

  for (const path of paths) {
    if (!depthByPath.has(path)) depthByPath.set(path, 0);
  }

  return depthByPath;
}

export function buildWebAppDependencyGraph<
  T extends { path: string; category?: string },
>(filePlans: T[]): WebAppDependencyGraph {
  const paths = filePlans.map((file) => normalizePlanPath(file.path));
  const edges = buildWebAppDependencyEdges(filePlans);
  return {
    paths,
    edges,
    depthByPath: computeWebAppLongestPathDepths(paths, edges),
  };
}

/**
 * Legacy category-barrier scheduler (kept for comparisons / regression tests).
 */
export function groupWebAppFilesIntoWavesLegacy<
  T extends { path: string; category: string },
>(filePlans: T[]): T[][] {
  const remaining = [...filePlans];
  const waves: T[][] = [];

  for (const category of WEBAPP_LEGACY_CATEGORY_ORDER) {
    const batch = remaining
      .filter((file) => normalizeCategory(file.category) === category)
      .sort((a, b) => normalizePlanPath(a.path).localeCompare(normalizePlanPath(b.path)));
    if (batch.length === 0) continue;
    waves.push(batch);
    for (const file of batch) {
      const index = remaining.findIndex((entry) => entry.path === file.path);
      if (index >= 0) remaining.splice(index, 1);
    }
  }

  if (remaining.length > 0) {
    waves.push(
      [...remaining].sort((a, b) =>
        normalizePlanPath(a.path).localeCompare(normalizePlanPath(b.path)),
      ),
    );
  }

  return waves;
}

/**
 * Group planned AI files into parallel waves from the dependency graph.
 * Files at the same longest-path depth run together (one snapshot barrier).
 * Within a wave, paths are sorted for deterministic Promise.all ordering.
 */
export function groupWebAppFilesIntoWaves<
  T extends { path: string; category: string },
>(filePlans: T[]): T[][] {
  if (filePlans.length === 0) return [];

  const graph = buildWebAppDependencyGraph(filePlans);
  const byDepth = new Map<number, T[]>();

  for (const file of filePlans) {
    const path = normalizePlanPath(file.path);
    const depth = graph.depthByPath.get(path) ?? 0;
    const bucket = byDepth.get(depth) ?? [];
    bucket.push(file);
    byDepth.set(depth, bucket);
  }

  return [...byDepth.keys()]
    .sort((a, b) => a - b)
    .map((depth) =>
      (byDepth.get(depth) ?? []).sort((a, b) =>
        normalizePlanPath(a.path).localeCompare(normalizePlanPath(b.path)),
      ),
    );
}

export function analyzeWebAppWaveSchedule<
  T extends { path: string; category: string },
>(filePlans: T[]): WebAppWaveScheduleAnalysis {
  const graph = buildWebAppDependencyGraph(filePlans);
  const waves = groupWebAppFilesIntoWaves(filePlans);
  const legacy = groupWebAppFilesIntoWavesLegacy(filePlans);

  const removedCategoryBarriers: string[] = [];
  if (legacy.length > waves.length) {
    removedCategoryBarriers.push(
      `category-barriers:${legacy.length}→${waves.length}`,
    );
  }
  // Detect merged peer categories that used to be separate waves.
  const legacySingletons = legacy.filter((wave) => wave.length >= 1).map((wave) => {
    const cats = [...new Set(wave.map((f) => normalizeCategory(f.category)))];
    return cats.join("+");
  });
  const newMerged = waves
    .map((wave) => {
      const cats = [...new Set(wave.map((f) => normalizeCategory(f.category)))].sort();
      return cats;
    })
    .filter((cats) => cats.length > 1)
    .map((cats) => cats.join("+"));
  for (const merged of newMerged) {
    removedCategoryBarriers.push(`merged:${merged}`);
  }
  void legacySingletons;

  return {
    waveCount: waves.length,
    maxWaveWidth: waves.reduce((max, wave) => Math.max(max, wave.length), 0),
    totalFiles: filePlans.length,
    waves: waves.map((wave, index) => ({
      depth: index,
      paths: wave.map((file) => normalizePlanPath(file.path)),
    })),
    edges: graph.edges,
    removedCategoryBarriers: [...new Set(removedCategoryBarriers)],
  };
}

/**
 * Scaffold assembly dependency graph (sync templates — documents order only).
 * Used for reports; scaffold build remains synchronous and deterministic.
 */
export function buildWebAppScaffoldAssemblyEdges(
  scaffoldPaths: string[],
): WebAppDependencyEdge[] {
  const paths = scaffoldPaths.map(normalizePlanPath);
  const fakePlans: PlannedFile[] = paths.map((path) => ({
    path,
    purpose: "scaffold",
    language: "typescript",
    category: inferCategoryFromPath(path),
  }));
  return buildWebAppDependencyEdges(fakePlans);
}

/** Estimate wall-clock speedup vs legacy category barriers (unit-time tasks). */
export function estimateWaveScheduleSpeedup(filePlans: Array<{ path: string; category: string }>): {
  legacyWaveCount: number;
  optimizedWaveCount: number;
  legacySerialUnits: number;
  optimizedSerialUnits: number;
  estimatedImprovementPercent: number;
} {
  const legacy = groupWebAppFilesIntoWavesLegacy(filePlans);
  const optimized = groupWebAppFilesIntoWaves(filePlans);
  const legacySerialUnits = legacy.length;
  const optimizedSerialUnits = optimized.length;
  const estimatedImprovementPercent =
    legacySerialUnits === 0
      ? 0
      : Math.round((1 - optimizedSerialUnits / legacySerialUnits) * 100);

  return {
    legacyWaveCount: legacy.length,
    optimizedWaveCount: optimized.length,
    legacySerialUnits,
    optimizedSerialUnits,
    estimatedImprovementPercent,
  };
}
