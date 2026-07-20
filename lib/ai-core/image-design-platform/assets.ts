/**
 * Design asset persistence helpers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DesignAssetRecord,
  DesignGenerationRecord,
  ImageDesignModel,
  ImageRasterAsset,
} from "@/lib/ai-core/image-design-platform/types";
import {
  dataUrlToBuffer,
  uploadDesignAsset,
} from "@/lib/ai-core/image-design-platform/storage";

export async function saveDesignAssets(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  projectId?: string | null;
  assets: ImageRasterAsset[];
}): Promise<{ assets: DesignAssetRecord[]; error: string | null }> {
  const rows: DesignAssetRecord[] = [];

  for (const asset of params.assets) {
    let storagePath = asset.storagePath ?? null;
    let publicUrl = asset.publicUrl ?? null;

    if (asset.dataUrl && asset.status === "completed") {
      const parsed = dataUrlToBuffer(asset.dataUrl);
      if (parsed) {
        const ext = asset.format === "jpg" ? "jpg" : asset.format === "webp" ? "webp" : "png";
        const uploaded = await uploadDesignAsset({
          supabase: params.supabase,
          userId: params.userId,
          generationId: params.generationId,
          fileName: `${asset.id}.${ext}`,
          bytes: parsed.bytes,
          contentType: parsed.mimeType,
        });
        if (!uploaded.error) {
          storagePath = uploaded.path;
          publicUrl = uploaded.publicUrl;
        }
      }
    }

    const { data, error } = await params.supabase
      .from("design_assets")
      .insert({
        project_id: params.projectId ?? null,
        generation_id: params.generationId,
        user_id: params.userId,
        name: asset.name,
        format: asset.format,
        mime_type: asset.mimeType,
        width: asset.width ?? null,
        height: asset.height ?? null,
        storage_path: storagePath,
        public_url: publicUrl,
        provider: asset.provider,
        metadata: {
          prompt: asset.prompt,
          negativePrompt: asset.negativePrompt,
          seed: asset.seed,
          status: asset.status,
          model: asset.model,
        },
        version: 1,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01") {
        return { assets: rows, error: "design_assets table not found. Apply migration 054." };
      }
      continue;
    }
    rows.push(data as DesignAssetRecord);
  }

  return { assets: rows, error: null };
}

export async function saveDesignGeneration(params: {
  supabase: SupabaseClient;
  userId: string;
  imageGenerationId: string;
  projectId?: string | null;
  model: ImageDesignModel;
  status: string;
  provider?: string;
}): Promise<{ record: DesignGenerationRecord | null; error: string | null }> {
  const { data: existing } = await params.supabase
    .from("design_generations")
    .select("version")
    .eq("image_generation_id", params.imageGenerationId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (existing?.version ?? 0) + 1;

  const { data, error } = await params.supabase
    .from("design_generations")
    .insert({
      image_generation_id: params.imageGenerationId,
      user_id: params.userId,
      project_id: params.projectId ?? null,
      model: params.model as unknown as Record<string, unknown>,
      status: params.status,
      provider: params.provider ?? params.model.providerUsed ?? null,
      version,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return { record: null, error: "design_generations table not found. Apply migration 055." };
    }
    return { record: null, error: error.message };
  }

  return { record: data as DesignGenerationRecord, error: null };
}

export async function ensureDesignProject(params: {
  supabase: SupabaseClient;
  userId: string;
  name: string;
  description?: string;
}): Promise<{ projectId: string | null; error: string | null }> {
  const { data, error } = await params.supabase
    .from("design_projects")
    .insert({
      user_id: params.userId,
      name: params.name,
      description: params.description ?? "",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return { projectId: null, error: "design_projects table not found. Apply migration 053." };
    }
    return { projectId: null, error: error.message };
  }

  return { projectId: data.id as string, error: null };
}
