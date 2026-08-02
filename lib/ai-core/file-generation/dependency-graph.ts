import {
  inferCategoryFromPath,
  type FileCategory,
  type PlannedFile,
} from "@/lib/ai/planner";
import type { FileDependencyEdge } from "@/lib/ai-core/file-generation/types";

const CATEGORY_ORDER: FileCategory[] = [
  "layout",
  "lib",
  "types",
  "hooks",
  "components",
  "pages",
  "api",
  "configs",
];

const SECTION_SHELL_PATH = "components/ui/section-shell.tsx";
const MOTION_PATH = "components/ui/motion.tsx";
const ROOT_LAYOUT_PATH = "app/layout.tsx";
const HOME_PAGE_PATH = "app/page.tsx";

export type DependencyGraph = {
  paths: string[];
  edges: FileDependencyEdge[];
  depthByPath: Map<string, number>;
};

function categoryRank(path: string, planned?: PlannedFile): number {
  const category = planned?.category ?? inferCategoryFromPath(path);
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function addEdge(
  edges: FileDependencyEdge[],
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

/** Category-rank edges: every lower-rank file is a dependency of higher-rank files. */
export function buildCategoryRankEdges(filePlans: PlannedFile[]): FileDependencyEdge[] {
  const edges: FileDependencyEdge[] = [];
  const seen = new Set<string>();
  const sorted = [...filePlans].sort((a, b) => {
    const rankDelta = categoryRank(a.path, a) - categoryRank(b.path, b);
    if (rankDelta !== 0) return rankDelta;
    return a.path.localeCompare(b.path);
  });

  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const left = sorted[i];
      const right = sorted[j];
      if (categoryRank(left.path, left) < categoryRank(right.path, right)) {
        addEdge(edges, seen, left.path, right.path, "category-rank");
      }
    }
  }

  return edges;
}

export type WebsiteDependencyGraphOptions = {
  composeHomePage?: boolean;
  extraEdges?: FileDependencyEdge[];
};

/**
 * Build a dependency graph for planned files.
 * Combines coarse category ordering with website-specific structural edges.
 */
export function buildFileDependencyGraph(
  filePlans: PlannedFile[],
  options: WebsiteDependencyGraphOptions = {},
): DependencyGraph {
  const pathSet = new Set(filePlans.map((f) => f.path));
  const edges: FileDependencyEdge[] = [];
  const seen = new Set<string>();

  edges.push(...buildCategoryRankEdges(filePlans));

  const hasPath = (path: string) => pathSet.has(path);

  if (hasPath(ROOT_LAYOUT_PATH)) {
    for (const plan of filePlans) {
      if (plan.path.startsWith("app/") && plan.path !== ROOT_LAYOUT_PATH) {
        addEdge(edges, seen, ROOT_LAYOUT_PATH, plan.path, "app-layout");
      }
      if (plan.path.startsWith("components/")) {
        addEdge(edges, seen, ROOT_LAYOUT_PATH, plan.path, "layout-shell");
      }
    }
  }

  if (hasPath(SECTION_SHELL_PATH)) {
    for (const plan of filePlans) {
      if (plan.path.startsWith("components/sections/")) {
        addEdge(edges, seen, SECTION_SHELL_PATH, plan.path, "section-primitive");
      }
    }
  }

  if (hasPath(MOTION_PATH)) {
    for (const plan of filePlans) {
      if (plan.path.startsWith("components/sections/")) {
        addEdge(edges, seen, MOTION_PATH, plan.path, "motion-primitive");
      }
    }
  }

  if (options.composeHomePage !== false && hasPath(HOME_PAGE_PATH)) {
    for (const plan of filePlans) {
      if (
        plan.path.startsWith("components/sections/") ||
        plan.path.startsWith("components/layout/")
      ) {
        addEdge(edges, seen, plan.path, HOME_PAGE_PATH, "compose-home");
      }
    }
  }

  for (const edge of options.extraEdges ?? []) {
    if (pathSet.has(edge.from) && pathSet.has(edge.to)) {
      addEdge(edges, seen, edge.from, edge.to, edge.reason);
    }
  }

  const depthByPath = computeLongestPathDepths(filePlans.map((f) => f.path), edges);

  return {
    paths: filePlans.map((f) => f.path),
    edges,
    depthByPath,
  };
}

/** Longest-path depth from roots (Kahn-style level assignment). */
export function computeLongestPathDepths(
  paths: string[],
  edges: FileDependencyEdge[],
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
    if (!depthByPath.has(path)) {
      depthByPath.set(path, 0);
    }
  }

  return depthByPath;
}
