import type { GeneratedProjectFile } from "@/lib/ai/types";

const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];

function extractImportPaths(content: string): string[] {
  const imports: string[] = [];
  const fromRegex = /from\s+['"]([^'"]+)['"]/g;
  const importRegex = /import\s+['"]([^'"]+)['"]/g;

  let match: RegExpExecArray | null = fromRegex.exec(content);
  while (match) {
    imports.push(match[1]);
    match = fromRegex.exec(content);
  }

  match = importRegex.exec(content);
  while (match) {
    imports.push(match[1]);
    match = importRegex.exec(content);
  }

  return imports;
}

function candidatePathsForImport(resolved: string): string[] {
  return [
    resolved,
    ...EXTENSIONS.map((ext) =>
      ext.startsWith("/") ? `${resolved}${ext}` : `${resolved}${ext}`,
    ),
  ];
}

function resolveProjectImport(
  importPath: string,
  projectPaths: Set<string>,
): string | null {
  if (!importPath.startsWith("@/")) return null;
  const resolved = importPath.slice(2);
  for (const candidate of candidatePathsForImport(resolved)) {
    if (projectPaths.has(candidate)) return candidate;
  }
  return projectPaths.has(resolved) ? resolved : null;
}

/** True when `fromPath` imports `toPath` via @/ alias. */
export function fileImportsPath(
  fromFile: GeneratedProjectFile,
  toPath: string,
  projectPaths: Set<string>,
): boolean {
  for (const importPath of extractImportPaths(fromFile.content)) {
    const resolved = resolveProjectImport(importPath, projectPaths);
    if (resolved === toPath) return true;
  }
  return false;
}

/**
 * Two repair targets are safe to run in parallel when:
 * - different paths
 * - neither imports the other (@/ resolution)
 * - no shared route contract (same app route file)
 */
export function canRepairTargetsInParallel(
  leftPath: string,
  rightPath: string,
  filesByPath: Map<string, GeneratedProjectFile>,
  projectPaths: Set<string>,
): boolean {
  if (leftPath === rightPath) return false;

  const left = filesByPath.get(leftPath);
  const right = filesByPath.get(rightPath);
  if (!left || !right) return true;

  if (fileImportsPath(left, rightPath, projectPaths)) return false;
  if (fileImportsPath(right, leftPath, projectPaths)) return false;

  // Shared route contract: only one page file per path (already distinct paths).
  // Block parallel repair of layout + its direct child page when layout imports page metadata — rare.
  if (
    leftPath === "app/layout.tsx" &&
    rightPath.startsWith("app/") &&
    rightPath.endsWith("page.tsx")
  ) {
    return false;
  }
  if (
    rightPath === "app/layout.tsx" &&
    leftPath.startsWith("app/") &&
    leftPath.endsWith("page.tsx")
  ) {
    return false;
  }

  return true;
}

export function buildImportRepairEdges(
  targets: string[],
  files: GeneratedProjectFile[],
): Array<{ from: string; to: string; reason: string }> {
  const targetSet = new Set(targets);
  const projectPaths = new Set(files.map((file) => file.path));
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const edges: Array<{ from: string; to: string; reason: string }> = [];

  for (const target of targets) {
    const file = filesByPath.get(target);
    if (!file) continue;
    for (const other of targets) {
      if (target === other) continue;
      if (fileImportsPath(file, other, projectPaths)) {
        edges.push({ from: other, to: target, reason: "import-dependency" });
      }
    }
  }

  return edges.filter(
    (edge) => targetSet.has(edge.from) && targetSet.has(edge.to),
  );
}
