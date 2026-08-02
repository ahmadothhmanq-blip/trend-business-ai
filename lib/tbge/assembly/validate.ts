/**
 * Assembly output validation pipeline.
 */

import type { TbgeArtifactFile } from "@/lib/tbge/kernel/types";
import type { FileGraphNode, GenerationSpec } from "@/lib/tbge/spec/types";

export type AssemblyValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

export function validateAssemblyOutput(
  spec: GenerationSpec,
  files: TbgeArtifactFile[],
): AssemblyValidationResult {
  const errors: string[] = [];
  const byPath = new Map<string, TbgeArtifactFile>();

  for (const file of files) {
    if (!file.path.trim()) {
      errors.push("Artifact with empty path detected");
      continue;
    }
    if (byPath.has(file.path)) {
      errors.push(`Duplicate artifact path: ${file.path}`);
    }
    byPath.set(file.path, file);
  }

  for (const node of spec.fileGraph) {
    if (node.optional) continue;
    const artifact = byPath.get(node.path);
    if (!artifact) {
      errors.push(`Missing required artifact: ${node.path}`);
      continue;
    }
    if (!artifact.content.trim()) {
      errors.push(`Empty content for artifact: ${node.path}`);
    }
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

export function validateNodeDependencies(
  node: FileGraphNode,
  artifacts: ReadonlyMap<string, TbgeArtifactFile>,
): void {
  for (const dep of node.deps) {
    if (!artifacts.has(dep)) {
      throw new Error(`Dependency artifact missing for ${node.path}: ${dep}`);
    }
  }
}
