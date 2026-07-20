/**
 * Version snapshots for Video Studio production models.
 */

import type {
  VideoProductionModel,
  VideoVersionSnapshot,
} from "@/lib/ai-core/video-production-platform/types";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";

export type VideoVersionHistory = {
  versions: VideoVersionSnapshot[];
  currentVersionId: string | null;
};

export function emptyVideoVersionHistory(): VideoVersionHistory {
  return { versions: [], currentVersionId: null };
}

export function saveVideoVersion(
  history: VideoVersionHistory,
  model: VideoProductionModel,
  note?: string,
): VideoVersionHistory {
  const snapshot: VideoVersionSnapshot = {
    id: vid("ver", String(model.version), history.versions.length),
    label: `v${model.version}`,
    createdAt: nowIso(),
    note,
    model: structuredClone(model),
  };
  return {
    versions: [snapshot, ...history.versions].slice(0, 40),
    currentVersionId: snapshot.id,
  };
}

export function restoreVideoVersion(
  history: VideoVersionHistory,
  versionId: string,
): { history: VideoVersionHistory; model: VideoProductionModel } | null {
  const snap = history.versions.find((v) => v.id === versionId);
  if (!snap) return null;
  const restored: VideoProductionModel = {
    ...structuredClone(snap.model),
    version: snap.model.version + 1,
    updatedAt: nowIso(),
  };
  return {
    model: restored,
    history: saveVideoVersion(history, restored, `Restored ${snap.label}`),
  };
}
