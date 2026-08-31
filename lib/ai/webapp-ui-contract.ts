/**
 * App Builder UI barrel contract — detect missing exports/imports before the repair loop.
 * Canonical UI gaps are always fixed by the hardener; never DeepSeek.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  CANONICAL_UI_PRIMITIVES,
  isCanonicalUiPrimitive,
  isUiBarrelPath,
} from "@/lib/ai/webapp-ui-primitives";

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

export function collectUiBarrelImportNames(files: GeneratedProjectFile[]): Set<string> {
  const names = new Set<string>();
  const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui['"]/g;

  for (const file of files) {
    const path = normalizePath(file.path);
    if (!/\.(ts|tsx|js|jsx)$/.test(path)) continue;
    if (isUiBarrelPath(path)) continue;

    let match = importRe.exec(file.content);
    while (match) {
      for (const part of match[1].split(",")) {
        const ident = part
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0]
          .trim();
        if (ident) names.add(ident);
      }
      match = importRe.exec(file.content);
    }
    importRe.lastIndex = 0;
  }

  return names;
}

export function collectUiBarrelExportNames(content: string): Set<string> {
  const names = new Set<string>();
  const declRe =
    /\bexport\s+(?:const|function|class|type|interface)\s+([A-Za-z_][A-Za-z0-9_]*)\b/g;
  let match = declRe.exec(content);
  while (match) {
    names.add(match[1]);
    match = declRe.exec(content);
  }

  const listRe = /\bexport\s+\{([^}]+)\}/g;
  match = listRe.exec(content);
  while (match) {
    for (const part of match[1].split(",")) {
      const ident = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0]
        .trim();
      if (ident) names.add(ident);
    }
    match = listRe.exec(content);
  }

  return names;
}

/** Missing `@/components/ui` exports required by project imports. */
export function findUiBarrelContractIssues(files: GeneratedProjectFile[]): string[] {
  const imported = collectUiBarrelImportNames(files);
  if (imported.size === 0) return [];

  const uiBarrel = files.find((file) => {
    const path = normalizePath(file.path);
    return path === "components/ui.tsx" || path === "components/ui.ts";
  });
  if (!uiBarrel) {
    return [
      'components/ui.tsx: missing UI barrel file while project imports from "@/components/ui".',
    ];
  }

  const exported = collectUiBarrelExportNames(uiBarrel.content);
  return [...imported]
    .filter((name) => !exported.has(name))
    .map(
      (name) =>
        `components/ui.tsx: missing export "${name}" required by "@/components/ui" imports.`,
    );
}

/**
 * JSX uses a canonical UI primitive without importing it from `@/components/ui`.
 * Hardener injects the import — never LLM repair.
 */
export function findMissingUiJsxImportIssues(files: GeneratedProjectFile[]): string[] {
  const issues: string[] = [];

  for (const file of files) {
    const path = normalizePath(file.path);
    if (!path.endsWith(".tsx") && !path.endsWith(".jsx")) continue;
    if (isUiBarrelPath(path)) continue;

    const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui['"]/;
    const match = file.content.match(importRe);
    const imported = new Set(
      (match?.[1] ?? "")
        .split(",")
        .map((part) =>
          part
            .trim()
            .replace(/^type\s+/, "")
            .split(/\s+as\s+/)[0]
            .trim(),
        )
        .filter(Boolean),
    );

    for (const name of CANONICAL_UI_PRIMITIVES) {
      if (!new RegExp(`<${name}\\b`).test(file.content)) continue;
      if (imported.has(name)) continue;
      issues.push(
        `${path}: JSX uses <${name}> but does not import it from "@/components/ui".`,
      );
    }
  }

  return issues;
}

/** True when the issue is owned by the UI hardener (never DeepSeek). */
export function isUiLocallyRepairableIssue(issue: string): boolean {
  if (issue.includes("components/ui.tsx") || issue.includes("components/ui.ts")) {
    return true;
  }
  if (issue.includes('from "@/components/ui"') || issue.includes("from '@/components/ui'")) {
    return true;
  }
  if (/JSX uses <[A-Za-z]+> but does not import it/.test(issue)) {
    return true;
  }
  const missingExport = issue.match(/missing export "([^"]+)"/);
  if (missingExport?.[1] && isCanonicalUiPrimitive(missingExport[1])) {
    return true;
  }
  return false;
}

export function isUiLocallyRepairableTarget(path: string): boolean {
  return isUiBarrelPath(path);
}

/**
 * Filter repair targets so canonical UI never enters the DeepSeek loop.
 * Returns remaining LLM targets plus the UI issues that were skipped.
 */
export function filterUiRepairTargets(
  targets: Iterable<string>,
  issues: string[],
): { llmTargets: string[]; skippedUiIssues: string[] } {
  const skippedUiIssues = issues.filter(isUiLocallyRepairableIssue);
  const llmTargets: string[] = [];
  for (const path of targets) {
    if (isUiLocallyRepairableTarget(path)) {
      skippedUiIssues.push(path);
      continue;
    }
    llmTargets.push(path);
  }
  return { llmTargets, skippedUiIssues: [...new Set(skippedUiIssues)] };
}
