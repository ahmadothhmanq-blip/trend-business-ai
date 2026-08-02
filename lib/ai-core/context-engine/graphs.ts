import type { PlannedFile } from "@/lib/ai/planner";
import { buildFileDependencyGraph } from "@/lib/ai-core/file-generation/dependency-graph";
import type { FileDependencyEdge } from "@/lib/ai-core/file-generation/types";
import type { ContextGraphEdge } from "@/lib/ai-core/context-engine/types";

const ROOT_LAYOUT_PATH = "app/layout.tsx";
const HOME_PAGE_PATH = "app/page.tsx";
const SECTION_SHELL_PATH = "components/ui/section-shell.tsx";
const MOTION_PATH = "components/ui/motion.tsx";

function tagEdges(
  edges: FileDependencyEdge[],
  graph: ContextGraphEdge["graph"],
): ContextGraphEdge[] {
  return edges.map((edge) => ({ ...edge, graph }));
}

/** Structural + category dependency graph from file plans. */
export function buildStructuralContextGraph(
  filePlans: PlannedFile[],
  options: { composeHomePage?: boolean } = {},
): ContextGraphEdge[] {
  const graph = buildFileDependencyGraph(filePlans, {
    composeHomePage: options.composeHomePage ?? true,
  });
  return tagEdges(graph.edges, "structural");
}

/** Layout graph: layout → app routes and shared components. */
export function buildLayoutGraph(filePlans: PlannedFile[]): ContextGraphEdge[] {
  const pathSet = new Set(filePlans.map((plan) => plan.path));
  const edges: ContextGraphEdge[] = [];
  const seen = new Set<string>();

  if (!pathSet.has(ROOT_LAYOUT_PATH)) return edges;

  for (const plan of filePlans) {
    if (plan.path === ROOT_LAYOUT_PATH) continue;
    if (plan.path.startsWith("app/") || plan.path.startsWith("components/")) {
      const key = `${ROOT_LAYOUT_PATH}→${plan.path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        from: ROOT_LAYOUT_PATH,
        to: plan.path,
        reason: "layout-shell",
        graph: "layout",
      });
    }
  }

  return edges;
}

/** Route graph: pages and API routes under app/. */
export function buildRouteGraph(filePlans: PlannedFile[]): ContextGraphEdge[] {
  const edges: ContextGraphEdge[] = [];
  const seen = new Set<string>();

  for (const plan of filePlans) {
    if (!plan.path.startsWith("app/")) continue;
    if (plan.path === ROOT_LAYOUT_PATH) continue;

    const key = `${ROOT_LAYOUT_PATH}→${plan.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({
      from: ROOT_LAYOUT_PATH,
      to: plan.path,
      reason: "route-layout",
      graph: "route",
    });
  }

  return edges;
}

/** Component graph: UI primitives → sections and layout components. */
export function buildComponentGraph(filePlans: PlannedFile[]): ContextGraphEdge[] {
  const pathSet = new Set(filePlans.map((plan) => plan.path));
  const edges: ContextGraphEdge[] = [];
  const seen = new Set<string>();

  const primitives = [SECTION_SHELL_PATH, MOTION_PATH].filter((path) =>
    pathSet.has(path),
  );

  for (const primitive of primitives) {
    for (const plan of filePlans) {
      if (!plan.path.startsWith("components/sections/")) continue;
      const key = `${primitive}→${plan.path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        from: primitive,
        to: plan.path,
        reason: "component-primitive",
        graph: "component",
      });
    }
  }

  if (pathSet.has(HOME_PAGE_PATH)) {
    for (const plan of filePlans) {
      if (
        plan.path.startsWith("components/sections/") ||
        plan.path.startsWith("components/layout/")
      ) {
        const key = `${plan.path}→${HOME_PAGE_PATH}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({
          from: plan.path,
          to: HOME_PAGE_PATH,
          reason: "compose-home",
          graph: "component",
        });
      }
    }
  }

  return edges;
}

/** Collect all upstream dependency paths for a target (transitive closure). */
export function collectUpstreamDeps(
  targetPath: string,
  edges: ContextGraphEdge[],
): Set<string> {
  const incoming = new Map<string, Set<string>>();

  for (const edge of edges) {
    if (!incoming.has(edge.to)) incoming.set(edge.to, new Set());
    incoming.get(edge.to)!.add(edge.from);
  }

  const required = new Set<string>();
  const queue = [...(incoming.get(targetPath) ?? [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (required.has(current)) continue;
    required.add(current);
    for (const dep of incoming.get(current) ?? []) {
      queue.push(dep);
    }
  }

  return required;
}

/** Collect category anchor paths required for a target. */
export function collectCategoryAnchors(
  targetPath: string,
  filePlans: PlannedFile[],
): Set<string> {
  const pathSet = new Set(filePlans.map((plan) => plan.path));
  const anchors = new Set<string>();

  if (pathSet.has(ROOT_LAYOUT_PATH)) {
    if (targetPath.startsWith("app/") || targetPath.startsWith("components/")) {
      anchors.add(ROOT_LAYOUT_PATH);
    }
  }

  if (targetPath.startsWith("components/sections/")) {
    if (pathSet.has(SECTION_SHELL_PATH)) anchors.add(SECTION_SHELL_PATH);
    if (pathSet.has(MOTION_PATH)) anchors.add(MOTION_PATH);
  }

  if (targetPath === HOME_PAGE_PATH) {
    for (const plan of filePlans) {
      if (
        plan.path.startsWith("components/sections/") ||
        plan.path.startsWith("components/layout/")
      ) {
        anchors.add(plan.path);
      }
    }
  }

  return anchors;
}
