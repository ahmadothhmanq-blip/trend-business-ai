import type { FileCategory, PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { resolveSmartContextFiles } from "@/lib/ai-core/context-engine";

/** Immutable snapshot of completed files for wave-context policies. */
export type ContextSnapshot = {
  files: GeneratedProjectFile[];
  byPath: Map<string, GeneratedProjectFile>;
};

export function createContextSnapshot(
  files: GeneratedProjectFile[],
): ContextSnapshot {
  const byPath = new Map(files.map((file) => [file.path, file]));
  return { files: [...files], byPath };
}

export function mergeSnapshotFile(
  snapshot: ContextSnapshot,
  file: GeneratedProjectFile,
): ContextSnapshot {
  const nextFiles = snapshot.files.filter((entry) => entry.path !== file.path);
  nextFiles.push(file);
  nextFiles.sort((a, b) => a.path.localeCompare(b.path));
  const byPath = new Map(nextFiles.map((entry) => [entry.path, entry]));
  return { files: nextFiles, byPath };
}

export function snapshotFilesForTask(
  snapshot: ContextSnapshot,
  workingFiles: GeneratedProjectFile[],
  contextPolicy: "snapshot" | "strict-serial",
): GeneratedProjectFile[] {
  if (contextPolicy === "strict-serial") {
    return [...workingFiles];
  }
  return snapshot.files;
}

/**
 * Apply Smart Context Engine resolution to task context files.
 * Infrastructure hook — no prompt or orchestration changes.
 */
export function resolveTaskContextFiles(params: {
  targetPath: string;
  targetCategory: FileCategory;
  contextFiles: GeneratedProjectFile[];
  filePlans: PlannedFile[];
  dependsOn?: string[];
  contextPolicy?: "snapshot" | "strict-serial";
  composeHomePage?: boolean;
}): GeneratedProjectFile[] {
  return resolveSmartContextFiles({
    targetPath: params.targetPath,
    targetCategory: params.targetCategory,
    availableFiles: params.contextFiles,
    filePlans: params.filePlans,
    dependsOn: params.dependsOn,
    contextPolicy: params.contextPolicy,
    composeHomePage: params.composeHomePage,
  }).files;
}
