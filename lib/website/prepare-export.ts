import { getProfessionalScaffoldByPath } from "@/lib/ai-core/components";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  validateGeneratedProject,
  type ProjectCapabilityFlags,
} from "@/lib/ai/validator";
import { syncPackageJsonDependencies } from "@/lib/ai/website-scaffold";
import { remediateSiteImagesInFiles } from "@/lib/website/site-images-parser";

const EXPORT_FLAGS: ProjectCapabilityFlags = {
  requiresAuth: false,
  requiresDatabase: false,
  requiresDashboard: false,
  isEcommerce: false,
  isSaas: false,
  databaseProvider: "none",
};

const NODE_BUILTIN_PACKAGES = new Set([
  "crypto",
  "node:crypto",
  "fs",
  "path",
  "os",
  "util",
  "stream",
  "buffer",
  "events",
]);

export type WebsiteExportPrepResult = {
  files: GeneratedProjectFile[];
  issues: string[];
  warnings: string[];
  blockingIssues: string[];
  ready: boolean;
  fixesApplied: string[];
};

function candidatePathsForImport(importPath: string): string[] {
  const base = importPath.replace(/^@\//, "");
  return [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    `${base}.jsx`,
    `${base}.js`,
    `${base}/index.tsx`,
    `${base}/index.ts`,
  ];
}

function injectMissingScaffolds(
  files: GeneratedProjectFile[],
  fixes: string[],
): GeneratedProjectFile[] {
  const byPath = new Map(files.map((f) => [f.path.replaceAll("\\", "/"), { ...f }]));
  let changed = true;
  let rounds = 0;

  while (changed && rounds < 8) {
    changed = false;
    rounds += 1;
    const projectPaths = new Set(byPath.keys());
    const validation = validateGeneratedProject([...byPath.values()], EXPORT_FLAGS);

    for (const issue of validation.issues) {
      const missingMatch = issue.match(/missing project import "@\/([^"]+)"/);
      if (!missingMatch?.[1]) continue;

      for (const candidate of candidatePathsForImport(missingMatch[1])) {
        const normalized = candidate.replaceAll("\\", "/");
        if (byPath.has(normalized)) continue;

        const scaffold = getProfessionalScaffoldByPath(normalized);
        if (!scaffold) continue;

        byPath.set(normalized, {
          path: normalized,
          content: scaffold,
          language: normalized.endsWith(".ts") ? "typescript" : "tsx",
        });
        fixes.push(`Injected scaffold: ${normalized}`);
        changed = true;
        break;
      }
    }
  }

  return [...byPath.values()];
}

function fixNodeBuiltinImports(
  files: GeneratedProjectFile[],
  fixes: string[],
): GeneratedProjectFile[] {
  return files.map((file) => {
    if (!file.path.endsWith(".ts") && !file.path.endsWith(".tsx")) return file;

    let content = file.content;
    const before = content;

    content = content.replace(
      /from\s+['"]crypto['"]/g,
      'from "node:crypto"',
    );
    content = content.replace(
      /require\s*\(\s*['"]crypto['"]\s*\)/g,
      'require("node:crypto")',
    );

    if (content !== before) {
      fixes.push(`Normalized Node crypto import in ${file.path}`);
    }

    return { ...file, content };
  });
}

function stripUnresolvedImports(
  files: GeneratedProjectFile[],
  fixes: string[],
): GeneratedProjectFile[] {
  const byPath = new Map(files.map((f) => [f.path, { ...f }]));
  const projectPaths = new Set(byPath.keys());
  const validation = validateGeneratedProject([...byPath.values()], EXPORT_FLAGS);

  for (const issue of validation.issues) {
    const fileMatch = issue.match(/^([^:]+): missing project import/);
    if (!fileMatch?.[1]) continue;

    const filePath = fileMatch[1];
    const file = byPath.get(filePath);
    if (!file) continue;

    const importMatch = issue.match(/missing project import "(@\/[^"]+)"/);
    if (!importMatch?.[1]) continue;

    const importPath = importMatch[1];
    const escaped = importPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const importLine = new RegExp(
      `^\\s*import\\s+[^;]*from\\s+['"]${escaped}['"];?\\s*\\n?`,
      "m",
    );

    if (importLine.test(file.content)) {
      file.content = file.content.replace(importLine, "");
      fixes.push(`Removed unresolved import ${importPath} from ${filePath}`);
      byPath.set(filePath, file);
      continue;
    }

    // Drop broken page files that only exist as dangling routes.
    if (filePath.startsWith("app/") && filePath.endsWith("/page.tsx")) {
      byPath.delete(filePath);
      fixes.push(`Removed unroutable page missing dependencies: ${filePath}`);
    }
  }

  return [...byPath.values()];
}

function classifyExportIssues(issues: string[]): {
  blocking: string[];
  warnings: string[];
} {
  const blocking: string[] = [];
  const warnings: string[] = [];

  for (const issue of issues) {
    if (/imports "([^"]+)" but package\.json is missing/.test(issue)) {
      const pkg = issue.match(/missing "([^"]+)"/)?.[1];
      if (pkg && NODE_BUILTIN_PACKAGES.has(pkg)) {
        warnings.push(issue);
        continue;
      }
    }
    if (issue.startsWith("Missing required production file:")) {
      warnings.push(issue);
      continue;
    }
    blocking.push(issue);
  }

  return { blocking, warnings };
}

/**
 * Prepare generated website files for ZIP export — inject scaffolds, fix imports,
 * sync package.json, and validate without mutating the generation pipeline.
 */
export function prepareWebsiteProjectForExport(
  files: GeneratedProjectFile[],
): WebsiteExportPrepResult {
  const fixesApplied: string[] = [];
  let current = [...files];

  current = fixNodeBuiltinImports(current, fixesApplied);
  const beforeRemediation = current;
  current = remediateSiteImagesInFiles(current);
  if (
    beforeRemediation.some((f) =>
      f.path.replaceAll("\\", "/").includes("lib/site-images"),
    )
  ) {
    fixesApplied.push("Remediated premium stock URLs in lib/site-images.ts");
  }
  current = injectMissingScaffolds(current, fixesApplied);
  current = stripUnresolvedImports(current, fixesApplied);
  current = syncPackageJsonDependencies(current);
  current = injectMissingScaffolds(current, fixesApplied);
  current = syncPackageJsonDependencies(current);

  const validation = validateGeneratedProject(current, EXPORT_FLAGS);
  const { blocking, warnings } = classifyExportIssues(validation.issues);

  const essentialPaths = ["app/page.tsx", "app/layout.tsx", "package.json"];
  const paths = new Set(current.map((f) => f.path));
  for (const essential of essentialPaths) {
    if (!paths.has(essential)) {
      blocking.push(`Export blocked: missing essential file ${essential}`);
    }
  }

  return {
    files: current,
    issues: validation.issues,
    warnings,
    blockingIssues: blocking,
    ready: blocking.length === 0,
    fixesApplied,
  };
}
