/**
 * Brand Kit persistence helpers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createShareToken } from "@/lib/ai-core/brand-studio/ids";
import { modelToBlueprint } from "@/lib/ai-core/brand-studio/model";
import type {
  BrandAssetRecord,
  BrandIdentityModel,
  BrandKitRecord,
} from "@/lib/ai-core/brand-studio/types";
import type { BrandIdentityGeneration } from "@/types/brand-identity";

export async function saveBrandKit(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  model: BrandIdentityModel;
  name?: string;
}): Promise<{ kit: BrandKitRecord | null; error: string | null }> {
  const { supabase, userId, generationId, model, name } = params;

  const { data: existing } = await supabase
    .from("brand_kits")
    .select("version")
    .eq("generation_id", generationId)
    .eq("user_id", userId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (existing?.version ?? 0) + 1;

  const { data: kit, error } = await supabase
    .from("brand_kits")
    .insert({
      user_id: userId,
      generation_id: generationId,
      name: name || model.brandName,
      version,
      model: model as unknown as Record<string, unknown>,
      tokens: model.tokens as unknown as Record<string, unknown>,
      share_token: createShareToken(),
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return { kit: null, error: "brand_kits table not found. Apply migration 048." };
    }
    return { kit: null, error: error.message };
  }

  await supabase.from("brand_kit_versions").insert({
    kit_id: kit.id,
    user_id: userId,
    generation_id: generationId,
    version,
    model: model as unknown as Record<string, unknown>,
    change_summary: version === 1 ? "Initial brand kit" : `Version ${version}`,
  });

  return { kit: kit as BrandKitRecord, error: null };
}

export async function saveBrandAssets(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  kitId: string;
  model: BrandIdentityModel;
}): Promise<{ assets: BrandAssetRecord[]; error: string | null }> {
  const { supabase, userId, generationId, kitId, model } = params;
  const rows = [
    ...model.logoVariants.map((v) => ({
      kit_id: kitId,
      user_id: userId,
      generation_id: generationId,
      asset_type: `logo_${v.variant}`,
      name: v.name,
      format: v.format,
      storage_path: null as string | null,
      content: v.svg ?? v.pngDataUrl ?? null,
      metadata: { variant: v.variant, description: v.description },
    })),
    ...model.colors.map((c) => ({
      kit_id: kitId,
      user_id: userId,
      generation_id: generationId,
      asset_type: "color",
      name: c.name,
      format: "json",
      storage_path: null,
      content: JSON.stringify(c),
      metadata: { hex: c.hex, role: c.role },
    })),
  ];

  if (!rows.length) return { assets: [], error: null };

  const { data, error } = await supabase
    .from("brand_assets")
    .insert(rows)
    .select("*");

  if (error) {
    if (error.code === "42P01") {
      return { assets: [], error: "brand_assets table not found. Apply migration 049." };
    }
    return { assets: [], error: error.message };
  }

  return { assets: (data ?? []) as BrandAssetRecord[], error: null };
}

export async function uploadBrandAssetToStorage(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  fileName: string;
  content: string;
  contentType: string;
}): Promise<{ path: string | null; error: string | null }> {
  const path = `${params.userId}/${params.generationId}/${params.fileName}`;
  const blob = new Blob([params.content], { type: params.contentType });

  const { error } = await params.supabase.storage
    .from("brand-assets")
    .upload(path, blob, { upsert: true, contentType: params.contentType });

  if (error) {
    return { path: null, error: error.message };
  }
  return { path, error: null };
}

export function syncGenerationBlueprint(
  gen: BrandIdentityGeneration,
  model: BrandIdentityModel,
): BrandIdentityGeneration {
  return {
    ...gen,
    blueprint: modelToBlueprint(model, gen.prompt),
  };
}
