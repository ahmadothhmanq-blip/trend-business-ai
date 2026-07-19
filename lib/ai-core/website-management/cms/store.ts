/**
 * Phase 6 — Flexible CMS for website content & media metadata.
 */

import type { CmsEntry } from "@/lib/ai-core/website-management/types";

const cmsByGeneration = new Map<string, CmsEntry[]>();

export function listCmsEntries(generationId: string): CmsEntry[] {
  return cmsByGeneration.get(generationId) || [];
}

export function upsertCmsEntry(
  generationId: string,
  entry: Partial<CmsEntry> & { title: string; kind: CmsEntry["kind"] },
): CmsEntry {
  const list = listCmsEntries(generationId);
  const id =
    entry.id ||
    `cms_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const existingIdx = list.findIndex((e) => e.id === id);
  const row: CmsEntry = {
    id,
    kind: entry.kind,
    title: entry.title,
    body: entry.body,
    mediaUrl: entry.mediaUrl,
    pagePath: entry.pagePath,
    scheduledAt: entry.scheduledAt ?? null,
    published: entry.published ?? true,
    updatedAt: now,
    createdAt:
      existingIdx >= 0 ? list[existingIdx]!.createdAt : now,
  };
  if (existingIdx >= 0) {
    const next = [...list];
    next[existingIdx] = row;
    cmsByGeneration.set(generationId, next);
  } else {
    cmsByGeneration.set(generationId, [row, ...list].slice(0, 200));
  }
  return row;
}

export function deleteCmsEntry(generationId: string, id: string): boolean {
  const list = listCmsEntries(generationId);
  const next = list.filter((e) => e.id !== id);
  cmsByGeneration.set(generationId, next);
  return next.length !== list.length;
}

export function listDueScheduledEntries(
  generationId: string,
  now = new Date(),
): CmsEntry[] {
  return listCmsEntries(generationId).filter(
    (e) =>
      e.scheduledAt &&
      !e.published &&
      new Date(e.scheduledAt).getTime() <= now.getTime(),
  );
}
