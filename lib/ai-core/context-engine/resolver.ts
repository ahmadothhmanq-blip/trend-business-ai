import { sortFilesByDependency, truncateForContext } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  isSmartContextEnabled,
  resolveContextCharBudget,
  resolveContextCharLimit,
} from "@/lib/ai-core/context-engine/flags";
import {
  buildComponentGraph,
  buildLayoutGraph,
  buildRouteGraph,
  buildStructuralContextGraph,
  collectCategoryAnchors,
  collectUpstreamDeps,
} from "@/lib/ai-core/context-engine/graphs";
import { collectForwardImportDeps } from "@/lib/ai-core/context-engine/import-graph";
import type {
  ContextResolutionOptions,
  ContextResolutionResult,
  PromptContextFile,
} from "@/lib/ai-core/context-engine/types";

function uniqueSorted(paths: string[]): string[] {
  return [...new Set(paths)].sort((a, b) => a.localeCompare(b));
}

function totalChars(files: GeneratedProjectFile[]): number {
  return files.reduce((sum, file) => sum + file.content.length, 0);
}

function buildRequiredPaths(options: ContextResolutionOptions): Set<string> {
  const { targetPath, filePlans, availableFiles, dependsOn = [] } = options;
  const availablePaths = new Set(availableFiles.map((file) => file.path));

  const structuralEdges = buildStructuralContextGraph(filePlans, {
    composeHomePage: options.composeHomePage,
  }).filter((edge) => edge.reason !== "category-rank");
  const layoutEdges = buildLayoutGraph(filePlans);
  const routeEdges = buildRouteGraph(filePlans);
  const componentEdges = buildComponentGraph(filePlans);

  const allEdges = [
    ...structuralEdges,
    ...layoutEdges,
    ...routeEdges,
    ...componentEdges,
  ];

  const required = collectUpstreamDeps(targetPath, allEdges);
  const anchors = collectCategoryAnchors(targetPath, filePlans);
  const importDeps = collectForwardImportDeps(targetPath, availableFiles);

  for (const path of anchors) {
    if (availablePaths.has(path)) required.add(path);
  }
  for (const path of importDeps) {
    if (availablePaths.has(path)) required.add(path);
  }
  for (const path of dependsOn) {
    if (availablePaths.has(path)) required.add(path);
  }

  // Transitive closure over structural + component edges (conservative, targeted).
  let grew = true;
  while (grew) {
    grew = false;
    const snapshot = [...required];
    for (const path of snapshot) {
      for (const dep of collectUpstreamDeps(path, [
        ...structuralEdges,
        ...componentEdges,
      ])) {
        if (availablePaths.has(dep) && !required.has(dep)) {
          required.add(dep);
          grew = true;
        }
      }
    }
  }

  return required;
}

function applyCharBudget(
  files: GeneratedProjectFile[],
  charLimitPerFile: number,
  charBudget: number,
): GeneratedProjectFile[] {
  if (charBudget <= 0) {
    return files.map((file) => ({
      ...file,
      content: truncateForContext(file.content, charLimitPerFile),
    }));
  }

  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  let remaining = charBudget;
  const result: GeneratedProjectFile[] = [];

  for (const file of sorted) {
    const cap = Math.min(charLimitPerFile, remaining);
    const content =
      cap <= 0
        ? `/* context budget exhausted for ${file.path} */`
        : truncateForContext(file.content, cap);
    result.push({ ...file, content });
    remaining -= content.length;
  }

  return result;
}

/**
 * Resolve minimal deterministic context files for a generation task.
 * Never removes structural/import/category-required dependencies.
 */
export function resolveSmartContextFiles(
  options: ContextResolutionOptions,
): ContextResolutionResult {
  const inputChars = totalChars(options.availableFiles);
  const charLimitPerFile =
    options.charLimitPerFile ?? resolveContextCharLimit();
  const charBudget = options.charBudget ?? resolveContextCharBudget();

  if (!isSmartContextEnabled() || options.availableFiles.length === 0) {
    const files = applyCharBudget(
      sortFilesByDependency(
        options.availableFiles.map((file) => ({
          ...file,
          category: options.filePlans.find((plan) => plan.path === file.path)
            ?.category ?? "components",
          path: file.path,
        })),
      ),
      charLimitPerFile,
      charBudget,
    );
    return {
      files,
      stats: {
        inputFileCount: options.availableFiles.length,
        outputFileCount: files.length,
        inputChars,
        outputChars: totalChars(files),
        requiredPaths: files.map((file) => file.path),
        charsSaved: Math.max(0, inputChars - totalChars(files)),
        filesPruned: 0,
      },
    };
  }

  const requiredPaths = buildRequiredPaths(options);
  const planByPath = new Map(options.filePlans.map((plan) => [plan.path, plan]));

  const selected = options.availableFiles
    .filter((file) => requiredPaths.has(file.path))
    .map((file) => ({
      ...file,
      category: planByPath.get(file.path)?.category ?? "components",
    }));

  const sorted = sortFilesByDependency(selected);
  const budgeted = applyCharBudget(sorted, charLimitPerFile, charBudget);

  const outputChars = totalChars(budgeted);

  return {
    files: budgeted,
    stats: {
      inputFileCount: options.availableFiles.length,
      outputFileCount: budgeted.length,
      inputChars,
      outputChars,
      requiredPaths: uniqueSorted([...requiredPaths]),
      charsSaved: Math.max(0, inputChars - outputChars),
      filesPruned: options.availableFiles.length - budgeted.length,
    },
  };
}

/** Shape files for prompt embedding with per-file truncation. */
export function mapFilesForPromptContext(
  files: GeneratedProjectFile[],
  charLimitPerFile?: number,
): PromptContextFile[] {
  const limit = charLimitPerFile ?? resolveContextCharLimit();
  return files.map((file) => ({
    path: file.path,
    language: file.language,
    content: truncateForContext(file.content, limit),
  }));
}

/**
 * Single entry point for product generate loops.
 * Resolves smart context (when enabled) and maps for prompt embedding.
 */
export function resolvePromptContext(
  options: ContextResolutionOptions,
): ContextResolutionResult & { promptFiles: PromptContextFile[] } {
  const result = resolveSmartContextFiles(options);
  return {
    ...result,
    promptFiles: mapFilesForPromptContext(
      result.files,
      options.charLimitPerFile,
    ),
  };
}
