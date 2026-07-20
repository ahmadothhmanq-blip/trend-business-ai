/**
 * App version management — snapshots stored alongside blueprint.
 */

import type {
  AppVersionSnapshot,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import { slugId } from "@/lib/ai-core/app-design-platform/ids";

export type AppVersionHistory = {
  versions: AppVersionSnapshot[];
  currentVersionId: string | null;
};

export function emptyVersionHistory(): AppVersionHistory {
  return { versions: [], currentVersionId: null };
}

export function saveAppVersion(
  history: AppVersionHistory,
  model: StructuredAppModel,
  note?: string,
): AppVersionHistory {
  const snapshot: AppVersionSnapshot = {
    id: slugId("ver", String(model.version), history.versions.length),
    label: `v${model.version}`,
    createdAt: new Date().toISOString(),
    note,
    model: structuredClone(model),
  };
  const versions = [snapshot, ...history.versions].slice(0, 30);
  return { versions, currentVersionId: snapshot.id };
}

export function restoreAppVersion(
  history: AppVersionHistory,
  versionId: string,
): { history: AppVersionHistory; model: StructuredAppModel } | null {
  const snap = history.versions.find((v) => v.id === versionId);
  if (!snap) return null;
  const restored: StructuredAppModel = {
    ...structuredClone(snap.model),
    version: snap.model.version + 1,
    updatedAt: new Date().toISOString(),
  };
  const nextHistory = saveAppVersion(history, restored, `Restored from ${snap.label}`);
  return { history: nextHistory, model: restored };
}

export function compareAppVersions(
  history: AppVersionHistory,
  aId: string,
  bId: string,
): {
  a?: AppVersionSnapshot;
  b?: AppVersionSnapshot;
  screenDiff: { added: string[]; removed: string[] };
  catalogDiff: { added: string[]; removed: string[] };
  featureDiff: { added: string[]; removed: string[] };
} {
  const a = history.versions.find((v) => v.id === aId);
  const b = history.versions.find((v) => v.id === bId);
  if (!a || !b) {
    return {
      a,
      b,
      screenDiff: { added: [], removed: [] },
      catalogDiff: { added: [], removed: [] },
      featureDiff: { added: [], removed: [] },
    };
  }

  const aScreens = new Set(a.model.screens.map((s) => s.path));
  const bScreens = new Set(b.model.screens.map((s) => s.path));
  const aCatalog = new Set(a.model.catalog.map((c) => c.title));
  const bCatalog = new Set(b.model.catalog.map((c) => c.title));
  const aFeat = new Set(a.model.featureFlags);
  const bFeat = new Set(b.model.featureFlags);

  return {
    a,
    b,
    screenDiff: {
      added: [...bScreens].filter((x) => !aScreens.has(x)),
      removed: [...aScreens].filter((x) => !bScreens.has(x)),
    },
    catalogDiff: {
      added: [...bCatalog].filter((x) => !aCatalog.has(x)),
      removed: [...aCatalog].filter((x) => !bCatalog.has(x)),
    },
    featureDiff: {
      added: [...bFeat].filter((x) => !aFeat.has(x)),
      removed: [...aFeat].filter((x) => !bFeat.has(x)),
    },
  };
}
