import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { ContextGraphEdge } from "@/lib/ai-core/context-engine/types";

const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];

export function extractImportPaths(content: string): string[] {
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

export function resolveProjectImport(
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

/** Build import edges: `from` is imported by `to`. */
export function buildImportGraphEdges(
  files: GeneratedProjectFile[],
): ContextGraphEdge[] {
  const projectPaths = new Set(files.map((file) => file.path));
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const edges: ContextGraphEdge[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    for (const importPath of extractImportPaths(file.content)) {
      const resolved = resolveProjectImport(importPath, projectPaths);
      if (!resolved || resolved === file.path) continue;
      const key = `${resolved}→${file.path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        from: resolved,
        to: file.path,
        reason: "import",
        graph: "import",
      });
    }

    // Reverse scan: files that import this file (contract awareness).
    for (const other of files) {
      if (other.path === file.path) continue;
      if (fileImportsPath(other, file.path, projectPaths)) {
        const key = `${file.path}→${other.path}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({
          from: file.path,
          to: other.path,
          reason: "import-reverse",
          graph: "import",
        });
      }
    }
  }

  // Suppress unused variable warning for filesByPath in future extensions.
  void filesByPath;

  return edges;
}

export function collectForwardImportDeps(
  targetPath: string,
  files: GeneratedProjectFile[],
): Set<string> {
  const projectPaths = new Set(files.map((file) => file.path));
  const target = files.find((file) => file.path === targetPath);
  const deps = new Set<string>();
  if (!target) return deps;

  for (const importPath of extractImportPaths(target.content)) {
    const resolved = resolveProjectImport(importPath, projectPaths);
    if (resolved) deps.add(resolved);
  }

  return deps;
}

export function collectDirectImportDeps(
  targetPath: string,
  files: GeneratedProjectFile[],
): Set<string> {
  const projectPaths = new Set(files.map((file) => file.path));
  const target = files.find((file) => file.path === targetPath);
  const deps = new Set<string>();
  if (!target) return deps;

  for (const importPath of extractImportPaths(target.content)) {
    const resolved = resolveProjectImport(importPath, projectPaths);
    if (resolved) deps.add(resolved);
  }

  for (const file of files) {
    if (file.path === targetPath) continue;
    if (fileImportsPath(file, targetPath, projectPaths)) {
      deps.add(file.path);
    }
  }

  return deps;
}
