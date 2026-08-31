import type { GeneratedProjectFile } from "@/lib/ai/types";

/** Lightweight file reference for Pro workspace explorer (no per-file DB yet). */
export type WorkspaceFileRef = {
  path: string;
  language: string;
  sizeBytes: number;
  revision?: number;
};

export type WorkspaceSnapshot = {
  revision: number;
  files: WorkspaceFileRef[];
  capturedAt: string;
};

export function toWorkspaceFileRef(
  file: GeneratedProjectFile,
  revision?: number,
): WorkspaceFileRef {
  return {
    path: file.path,
    language: file.language || "tsx",
    sizeBytes: new TextEncoder().encode(file.content).length,
    revision,
  };
}

export function buildWorkspaceSnapshot(
  files: GeneratedProjectFile[],
  revision = 0,
): WorkspaceSnapshot {
  return {
    revision,
    files: files.map((f) => toWorkspaceFileRef(f, revision)),
    capturedAt: new Date().toISOString(),
  };
}
