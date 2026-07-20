/**
 * Phase 6 — Flexible CMS for website content & media metadata.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { CmsEntry } from "@/lib/ai-core/website-management/types";
import {
  deleteCmsEntryDb,
  isCmsTableMissing,
  listCmsEntriesDb,
  listCmsVersionsDb,
  restoreCmsVersionDb,
  upsertCmsEntryDb,
} from "@/lib/ai-core/website-management/cms/repository";

const cmsByGeneration = new Map<string, CmsEntry[]>();

export async function listCmsEntries(
  generationId: string,
  client?: SupabaseClient | null,
): Promise<CmsEntry[]> {
  if (client) {
    const rows = await listCmsEntriesDb(client, generationId);
    const { error } = await client
      .from("website_cms_entries")
      .select("id")
      .eq("generation_id", generationId)
      .limit(1);
    if (!isCmsTableMissing(error)) return rows;
  }
  return cmsByGeneration.get(generationId) || [];
}

export async function upsertCmsEntry(
  generationId: string,
  entry: Partial<CmsEntry> & { title: string; kind: CmsEntry["kind"] },
  options?: { userId?: string; client?: SupabaseClient | null },
): Promise<CmsEntry> {
  const list = await listCmsEntries(generationId, options?.client);
  const entryId =
    entry.id && !entry.id.startsWith("cms_")
      ? entry.id
      : randomUUID();
  const now = new Date().toISOString();
  const existingIdx = list.findIndex((e) => e.id === entryId);
  const previous = existingIdx >= 0 ? list[existingIdx] : null;
  const row: CmsEntry = {
    id: entryId,
    kind: entry.kind,
    title: entry.title,
    body: entry.body,
    mediaUrl: entry.mediaUrl,
    pagePath: entry.pagePath,
    scheduledAt: entry.scheduledAt ?? null,
    published: entry.published ?? true,
    updatedAt: now,
    createdAt: previous?.createdAt ?? now,
  };

  if (options?.client && options.userId) {
    const persisted = await upsertCmsEntryDb(options.client, {
      userId: options.userId,
      generationId,
      entry: row,
      previousVersion: previous,
    });
    if (persisted) return persisted;
  }

  if (existingIdx >= 0) {
    const next = [...list];
    next[existingIdx] = row;
    cmsByGeneration.set(generationId, next);
  } else {
    cmsByGeneration.set(generationId, [row, ...list].slice(0, 200));
  }
  return row;
}

export async function deleteCmsEntry(
  generationId: string,
  id: string,
  client?: SupabaseClient | null,
): Promise<boolean> {
  if (client) {
    const ok = await deleteCmsEntryDb(client, generationId, id);
    const { error } = await client
      .from("website_cms_entries")
      .select("id")
      .eq("generation_id", generationId)
      .limit(1);
    if (!isCmsTableMissing(error)) return ok;
  }
  const list = await listCmsEntries(generationId);
  const next = list.filter((e) => e.id !== id);
  cmsByGeneration.set(generationId, next);
  return next.length !== list.length;
}

export async function listDueScheduledEntries(
  generationId: string,
  now = new Date(),
  client?: SupabaseClient | null,
): Promise<CmsEntry[]> {
  const list = await listCmsEntries(generationId, client);
  return list.filter(
    (e) =>
      e.scheduledAt &&
      !e.published &&
      new Date(e.scheduledAt).getTime() <= now.getTime(),
  );
}

export async function listCmsEntryVersions(
  entryId: string,
  client?: SupabaseClient | null,
) {
  if (!client) return [];
  return listCmsVersionsDb(client, entryId);
}

export async function restoreCmsEntryVersion(
  params: {
    userId: string;
    generationId: string;
    entryId: string;
    version: number;
  },
  client?: SupabaseClient | null,
): Promise<CmsEntry | null> {
  if (!client) return null;
  return restoreCmsVersionDb(client, params);
}
