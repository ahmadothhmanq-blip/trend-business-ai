/**
 * Design asset library — folders, search, tags, favorites, version history.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DesignAssetRecord } from "@/lib/ai-core/image-design-platform/types";

export type AssetSearchFilters = {
  query?: string;
  folder?: string;
  tags?: string[];
  favorite?: boolean;
  generationId?: string;
  projectId?: string;
  limit?: number;
  offset?: number;
};

export type AssetLibraryItem = DesignAssetRecord & {
  is_favorite?: boolean;
  folder?: string | null;
  tags?: string[];
};

export async function searchDesignAssets(params: {
  supabase: SupabaseClient;
  userId: string;
  filters: AssetSearchFilters;
}): Promise<{ assets: AssetLibraryItem[]; total: number; error: string | null }> {
  const { supabase, userId, filters } = params;
  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;

  let query = supabase
    .from("design_assets")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.generationId) query = query.eq("generation_id", filters.generationId);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.folder) query = query.eq("folder", filters.folder);
  if (filters.favorite === true) query = query.eq("is_favorite", true);
  if (filters.tags?.length) query = query.contains("tags", filters.tags);
  if (filters.query?.trim()) {
    const q = filters.query.trim();
    query = query.or(`name.ilike.%${q}%,folder.ilike.%${q}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    if (error.code === "42P01") {
      return { assets: [], total: 0, error: "design_assets table not found. Apply migration 054." };
    }
    return { assets: [], total: 0, error: error.message };
  }

  return {
    assets: (data ?? []) as AssetLibraryItem[],
    total: count ?? 0,
    error: null,
  };
}

export async function listAssetFolders(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<{ folders: string[]; error: string | null }> {
  const { data, error } = await params.supabase
    .from("design_assets")
    .select("folder")
    .eq("user_id", params.userId)
    .not("folder", "is", null);

  if (error) {
    return { folders: [], error: error.code === "42P01" ? "Apply migration 057." : error.message };
  }

  const folders = [...new Set((data ?? []).map((r) => r.folder as string).filter(Boolean))].sort();
  return { folders, error: null };
}

export async function updateAssetMetadata(params: {
  supabase: SupabaseClient;
  userId: string;
  assetId: string;
  folder?: string | null;
  tags?: string[];
  isFavorite?: boolean;
  name?: string;
}): Promise<{ asset: AssetLibraryItem | null; error: string | null }> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.folder !== undefined) patch.folder = params.folder;
  if (params.tags !== undefined) patch.tags = params.tags;
  if (params.isFavorite !== undefined) patch.is_favorite = params.isFavorite;
  if (params.name !== undefined) patch.name = params.name;

  const { data, error } = await params.supabase
    .from("design_assets")
    .update(patch)
    .eq("id", params.assetId)
    .eq("user_id", params.userId)
    .select("*")
    .single();

  if (error) return { asset: null, error: error.message };
  return { asset: data as AssetLibraryItem, error: null };
}

export async function listAssetVersions(params: {
  supabase: SupabaseClient;
  userId: string;
  assetId: string;
}): Promise<{ versions: DesignAssetRecord[]; error: string | null }> {
  const { data: asset, error: assetErr } = await params.supabase
    .from("design_assets")
    .select("generation_id, name")
    .eq("id", params.assetId)
    .eq("user_id", params.userId)
    .single();

  if (assetErr || !asset) return { versions: [], error: "Asset not found" };

  const { data, error } = await params.supabase
    .from("design_assets")
    .select("*")
    .eq("user_id", params.userId)
    .eq("generation_id", asset.generation_id)
    .ilike("name", `${asset.name}%`)
    .order("version", { ascending: false });

  if (error) return { versions: [], error: error.message };
  return { versions: (data ?? []) as DesignAssetRecord[], error: null };
}
