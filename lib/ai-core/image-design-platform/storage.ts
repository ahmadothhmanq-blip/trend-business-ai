/**
 * Design Studio storage — design-studio bucket uploads.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const DESIGN_STUDIO_BUCKET = "design-studio";

export async function uploadDesignAsset(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  fileName: string;
  bytes: Buffer;
  contentType: string;
}): Promise<{ path: string; publicUrl: string | null; error: string | null }> {
  const path = `${params.userId}/${params.generationId}/${params.fileName}`;

  const { error } = await params.supabase.storage
    .from(DESIGN_STUDIO_BUCKET)
    .upload(path, params.bytes, {
      upsert: true,
      contentType: params.contentType,
    });

  if (error) {
    return { path, publicUrl: null, error: error.message };
  }

  const { data } = params.supabase.storage.from(DESIGN_STUDIO_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl ?? null, error: null };
}

export function dataUrlToBuffer(dataUrl: string): { bytes: Buffer; mimeType: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1]!,
    bytes: Buffer.from(match[2]!, "base64"),
  };
}

export async function deleteDesignAsset(params: {
  supabase: SupabaseClient;
  storagePath: string;
}): Promise<{ error: string | null }> {
  const { error } = await params.supabase.storage
    .from(DESIGN_STUDIO_BUCKET)
    .remove([params.storagePath]);
  return { error: error?.message ?? null };
}
