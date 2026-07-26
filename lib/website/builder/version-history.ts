/**
 * Website Builder local version history (Milestone 1).
 */

import type { BuilderVersionSnapshot } from "@/lib/website/builder/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

export const BUILDER_VERSION_MAX_SNAPSHOTS = 20;

const STORAGE_PREFIX = "wb-builder-versions:";

function storageKey(generationId: string): string {
  return `${STORAGE_PREFIX}${generationId}`;
}

function readAll(generationId: string): BuilderVersionSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(generationId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BuilderVersionSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(generationId: string, snapshots: BuilderVersionSnapshot[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(generationId),
    JSON.stringify(snapshots.slice(0, BUILDER_VERSION_MAX_SNAPSHOTS)),
  );
}

export function listBuilderVersionSnapshots(
  generationId: string,
): BuilderVersionSnapshot[] {
  return readAll(generationId);
}

export function pushBuilderVersionSnapshot(params: {
  generationId: string;
  project: GeneratedWebsiteProject;
  label?: string;
  revision?: number;
}): BuilderVersionSnapshot {
  const snapshot: BuilderVersionSnapshot = {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    generationId: params.generationId,
    label: params.label ?? "Autosave snapshot",
    createdAt: new Date().toISOString(),
    revision: params.revision,
    project: JSON.parse(JSON.stringify(params.project)),
  };

  const next = [snapshot, ...readAll(params.generationId)].slice(
    0,
    BUILDER_VERSION_MAX_SNAPSHOTS,
  );
  writeAll(params.generationId, next);
  return snapshot;
}

export function findBuilderVersionSnapshot(
  generationId: string,
  snapshotId: string,
): BuilderVersionSnapshot | null {
  return readAll(generationId).find((item) => item.id === snapshotId) ?? null;
}
