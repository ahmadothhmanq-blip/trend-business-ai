import { listProfessionalScaffoldPaths } from "@/lib/ai-core/components";
import {
  inferCategoryFromPath,
  sortFilesByDependency,
  type PlannedFile,
} from "@/lib/ai/planner";
import { SCAFFOLD_PATHS } from "@/lib/ai/website-scaffold";
import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { sanitizeProjectPath } from "@/lib/ai/zipper";

/** Paths required for a minimal publishable marketing site + template components. */
const FAST_REQUIRED_PATHS = new Set([
  "app/layout.tsx",
  "app/page.tsx",
  "components/ui/section-shell.tsx",
  "components/ui/motion.tsx",
]);

const ULTRA_MAX_COMPONENT_PATHS = 8;

function addPlannedFile(
  byPath: Map<string, PlannedFile>,
  rawPath: string,
  purpose: string,
): void {
  const path = sanitizeProjectPath(rawPath);
  if (!path || byPath.has(path)) return;
  byPath.set(path, {
    path,
    purpose,
    language: path.endsWith(".css")
      ? "css"
      : path.endsWith(".ts")
        ? "typescript"
        : "tsx",
    category: inferCategoryFromPath(path),
  });
}

/**
 * Deterministic file plan for ultra-fast generation — no dynamic plan LLM.
 */
export function buildEssentialWebsiteFilePlan(params: {
  componentPaths?: string[];
  componentIds?: readonly string[];
  flags: ProjectCapabilityFlags;
  blueprintPages?: string[];
}): PlannedFile[] {
  const byPath = new Map<string, PlannedFile>();

  for (const path of FAST_REQUIRED_PATHS) {
    addPlannedFile(byPath, path, `Essential production file: ${path}`);
  }

  for (const path of listProfessionalScaffoldPaths([...(params.componentIds ?? [])])) {
    addPlannedFile(byPath, path, `Professional component library: ${path}`);
  }

  for (const rawPath of (params.componentPaths ?? []).slice(
    0,
    ULTRA_MAX_COMPONENT_PATHS,
  )) {
    addPlannedFile(
      byPath,
      rawPath,
      `Design renderer section: ${rawPath.split("/").pop() ?? rawPath}`,
    );
  }

  if (params.flags.requiresAuth) {
    addPlannedFile(byPath, "middleware.ts", "Auth middleware");
    addPlannedFile(byPath, "app/login/page.tsx", "Login page");
    addPlannedFile(byPath, "lib/auth/session.ts", "Session helpers");
  }

  if (params.flags.requiresDashboard) {
    addPlannedFile(byPath, "app/dashboard/layout.tsx", "Dashboard layout");
    addPlannedFile(byPath, "app/dashboard/page.tsx", "Dashboard home");
  }

  return sortFilesByDependency([...byPath.values()]);
}

/**
 * Keep scaffold files, root layout, home page, and professional component paths only.
 * Drops secondary pages, API routes, hooks, and optional UX shells (loading/error).
 */
export function filterFilePlansForFastGeneration(
  filePlans: PlannedFile[],
  params: {
    componentPaths?: string[];
    componentIds?: readonly string[];
    flags: ProjectCapabilityFlags;
  },
): PlannedFile[] {
  const allowed = new Set<string>(FAST_REQUIRED_PATHS);
  for (const path of params.componentPaths ?? []) {
    allowed.add(path);
  }
  for (const path of listProfessionalScaffoldPaths([...(params.componentIds ?? [])])) {
    allowed.add(path);
  }

  return filePlans.filter((plan) => {
    if (SCAFFOLD_PATHS.has(plan.path)) return true;
    if (allowed.has(plan.path)) return true;

    if (params.flags.requiresAuth) {
      if (
        plan.path === "middleware.ts" ||
        plan.path === "app/login/page.tsx" ||
        plan.path === "lib/auth/session.ts"
      ) {
        return true;
      }
    }

    if (params.flags.requiresDashboard) {
      if (
        plan.path === "app/dashboard/layout.tsx" ||
        plan.path === "app/dashboard/page.tsx" ||
        plan.path.startsWith("components/dashboard/")
      ) {
        return true;
      }
    }

    return false;
  });
}
