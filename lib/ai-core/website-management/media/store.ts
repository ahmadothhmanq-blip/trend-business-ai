/**
 * Website media library — generation-scoped asset metadata.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { WebsiteMediaAsset } from "@/lib/ai-core/website-management/types";

const mediaByGeneration = new Map<string, WebsiteMediaAsset[]>();

type MediaRow = {
  id: string;
  generation_id: string;
  user_id: string;
  folder: string;
  filename: string;
  url: string;
  mime: string;
  size: number;
  alt: string | null;
  created_at: string;
  updated_at: string;
};

function isMediaTableMissing(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("website_media_assets") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

function rowToAsset(row: MediaRow): WebsiteMediaAsset {
  return {
    id: row.id,
    generationId: row.generation_id,
    folder: row.folder,
    filename: row.filename,
    url: row.url,
    mime: row.mime,
    size: Number(row.size) || 0,
    alt: row.alt ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listMediaAssets(
  generationId: string,
  options?: {
    client?: SupabaseClient | null;
    folder?: string;
    query?: string;
  },
): Promise<WebsiteMediaAsset[]> {
  if (options?.client) {
    let q = options.client
      .from("website_media_assets")
      .select("*")
      .eq("generation_id", generationId)
      .order("updated_at", { ascending: false });

    if (options.folder) q = q.eq("folder", options.folder);

    const { data, error } = await q;
    if (!isMediaTableMissing(error) && data) {
      let items = (data as MediaRow[]).map(rowToAsset);
      if (options.query) {
        const hay = options.query.toLowerCase();
        items = items.filter(
          (a) =>
            a.filename.toLowerCase().includes(hay) ||
            (a.alt || "").toLowerCase().includes(hay),
        );
      }
      return items;
    }
  }

  const list = mediaByGeneration.get(generationId) || [];
  return list.filter((a) => {
    if (options?.folder && a.folder !== options.folder) return false;
    if (options?.query) {
      const hay = options.query.toLowerCase();
      return (
        a.filename.toLowerCase().includes(hay) ||
        (a.alt || "").toLowerCase().includes(hay)
      );
    }
    return true;
  });
}

export async function upsertMediaAsset(
  params: {
    userId: string;
    generationId: string;
    filename: string;
    url: string;
    mime: string;
    size: number;
    folder?: string;
    alt?: string;
    id?: string;
  },
  client?: SupabaseClient | null,
): Promise<WebsiteMediaAsset> {
  const now = new Date().toISOString();
  const asset: WebsiteMediaAsset = {
    id: params.id || randomUUID(),
    generationId: params.generationId,
    folder: params.folder || "uploads",
    filename: params.filename,
    url: params.url,
    mime: params.mime,
    size: params.size,
    alt: params.alt,
    createdAt: now,
    updatedAt: now,
  };

  if (client) {
    const row = {
      id: asset.id,
      generation_id: params.generationId,
      user_id: params.userId,
      folder: asset.folder,
      filename: asset.filename,
      url: asset.url,
      mime: asset.mime,
      size: asset.size,
      alt: asset.alt ?? null,
      updated_at: now,
      created_at: now,
    };
    const { data, error } = await client
      .from("website_media_assets")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();
    if (!isMediaTableMissing(error) && data) {
      return rowToAsset(data as MediaRow);
    }
  }

  const list = mediaByGeneration.get(params.generationId) || [];
  const idx = list.findIndex((a) => a.id === asset.id);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = { ...next[idx], ...asset, updatedAt: now };
    mediaByGeneration.set(params.generationId, next);
  } else {
    mediaByGeneration.set(params.generationId, [asset, ...list].slice(0, 500));
  }
  return asset;
}

export async function deleteMediaAsset(
  generationId: string,
  assetId: string,
  client?: SupabaseClient | null,
): Promise<boolean> {
  if (client) {
    const { error } = await client
      .from("website_media_assets")
      .delete()
      .eq("id", assetId)
      .eq("generation_id", generationId);
    if (!isMediaTableMissing(error)) return !error;
  }

  const list = mediaByGeneration.get(generationId) || [];
  const next = list.filter((a) => a.id !== assetId);
  mediaByGeneration.set(generationId, next);
  return next.length !== list.length;
}

export async function patchMediaAsset(
  generationId: string,
  assetId: string,
  patch: { folder?: string; filename?: string; alt?: string },
  client?: SupabaseClient | null,
): Promise<WebsiteMediaAsset | null> {
  const list = await listMediaAssets(generationId, { client });
  const existing = list.find((a) => a.id === assetId);
  if (!existing) return null;

  const updated: WebsiteMediaAsset = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  if (client) {
    const { data, error } = await client
      .from("website_media_assets")
      .update({
        folder: updated.folder,
        filename: updated.filename,
        alt: updated.alt ?? null,
        updated_at: updated.updatedAt,
      })
      .eq("id", assetId)
      .eq("generation_id", generationId)
      .select("*")
      .single();
    if (!isMediaTableMissing(error) && data) {
      return rowToAsset(data as MediaRow);
    }
  }

  const mem = mediaByGeneration.get(generationId) || [];
  mediaByGeneration.set(
    generationId,
    mem.map((a) => (a.id === assetId ? updated : a)),
  );
  return updated;
}
