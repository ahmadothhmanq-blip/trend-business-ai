/**
 * Supabase persistence for website CMS entries + versions (migration 047).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CmsEntry } from "@/lib/ai-core/website-management/types";

type CmsRow = {
  id: string;
  generation_id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  media_url: string | null;
  page_path: string | null;
  scheduled_at: string | null;
  published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};

export function isCmsTableMissing(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("website_cms_entries") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

function rowToEntry(row: CmsRow): CmsEntry {
  return {
    id: row.id,
    kind: row.kind as CmsEntry["kind"],
    title: row.title,
    body: row.body ?? undefined,
    mediaUrl: row.media_url ?? undefined,
    pagePath: row.page_path ?? undefined,
    scheduledAt: row.scheduled_at,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCmsEntriesDb(
  client: SupabaseClient,
  generationId: string,
): Promise<CmsEntry[]> {
  const { data, error } = await client
    .from("website_cms_entries")
    .select("*")
    .eq("generation_id", generationId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as CmsRow[]).map(rowToEntry);
}

export async function upsertCmsEntryDb(
  client: SupabaseClient,
  params: {
    userId: string;
    generationId: string;
    entry: CmsEntry;
    previousVersion?: CmsEntry | null;
  },
): Promise<CmsEntry | null> {
  let existingVersion = 0;
  if (params.entry.id) {
    const { data } = await client
      .from("website_cms_entries")
      .select("version")
      .eq("id", params.entry.id)
      .maybeSingle();
    existingVersion = (data as { version?: number } | null)?.version ?? 0;
  }

  const nextVersion = existingVersion > 0 ? existingVersion + 1 : 1;

  if (params.previousVersion && params.entry.id && existingVersion > 0) {
    await client.from("website_cms_versions").insert({
      entry_id: params.entry.id,
      generation_id: params.generationId,
      user_id: params.userId,
      version: existingVersion,
      snapshot: params.previousVersion,
    });
  }

  const row = {
    id: params.entry.id,
    generation_id: params.generationId,
    user_id: params.userId,
    kind: params.entry.kind,
    title: params.entry.title,
    body: params.entry.body ?? null,
    media_url: params.entry.mediaUrl ?? null,
    page_path: params.entry.pagePath ?? null,
    scheduled_at: params.entry.scheduledAt ?? null,
    published: params.entry.published ?? true,
    version: nextVersion,
    updated_at: new Date().toISOString(),
    created_at: params.entry.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from("website_cms_entries")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToEntry(data as CmsRow);
}

export async function deleteCmsEntryDb(
  client: SupabaseClient,
  generationId: string,
  entryId: string,
): Promise<boolean> {
  const { error } = await client
    .from("website_cms_entries")
    .delete()
    .eq("id", entryId)
    .eq("generation_id", generationId);
  return !error;
}

export async function listCmsVersionsDb(
  client: SupabaseClient,
  entryId: string,
): Promise<Array<{ version: number; snapshot: CmsEntry; createdAt: string }>> {
  const { data, error } = await client
    .from("website_cms_versions")
    .select("version, snapshot, created_at")
    .eq("entry_id", entryId)
    .order("version", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    version: row.version as number,
    snapshot: row.snapshot as CmsEntry,
    createdAt: row.created_at as string,
  }));
}

export async function restoreCmsVersionDb(
  client: SupabaseClient,
  params: {
    userId: string;
    generationId: string;
    entryId: string;
    version: number;
  },
): Promise<CmsEntry | null> {
  const { data, error } = await client
    .from("website_cms_versions")
    .select("snapshot")
    .eq("entry_id", params.entryId)
    .eq("version", params.version)
    .maybeSingle();

  if (error || !data) return null;
  const snapshot = data.snapshot as CmsEntry;
  return upsertCmsEntryDb(client, {
    userId: params.userId,
    generationId: params.generationId,
    entry: { ...snapshot, id: params.entryId },
    previousVersion: snapshot,
  });
}
