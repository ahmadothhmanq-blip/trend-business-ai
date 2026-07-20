/**
 * Media storage for Video Studio — Supabase Storage bucket + DB metadata.
 * Large binaries live in storage, not JSONB.
 */

import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import type { VideoMediaAsset } from "@/lib/ai-core/video-production-platform/types";

export const VIDEO_STUDIO_BUCKET = "video-studio";

export type StoredMediaRecord = {
  id: string;
  userId: string;
  generationId: string | null;
  kind: string;
  mimeType: string;
  storagePath: string;
  publicUrl: string | null;
  sizeBytes: number;
  durationSec: number | null;
  provider: string;
  meta: Record<string, unknown>;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function uploadVideoStudioMedia(params: {
  supabase: AnySupabase;
  userId: string;
  generationId?: string | null;
  kind: VideoMediaAsset["kind"] | "source-image" | "export";
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
  durationSec?: number;
  provider: string;
  meta?: Record<string, unknown>;
}): Promise<{ asset: VideoMediaAsset; record: StoredMediaRecord | null; storagePath: string }> {
  const safe = params.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const id = vid("media", safe, Date.now() % 100000);
  const storagePath = `${params.userId}/${params.generationId || "library"}/${id}-${safe}`;

  const { error: uploadError } = await params.supabase.storage
    .from(VIDEO_STUDIO_BUCKET)
    .upload(storagePath, params.bytes, {
      contentType: params.mimeType,
      upsert: false,
    });

  let publicUrl: string | null = null;
  if (!uploadError) {
    const signed = await params.supabase.storage
      .from(VIDEO_STUDIO_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);
    publicUrl = signed.data?.signedUrl ?? null;
    if (!publicUrl) {
      publicUrl = params.supabase.storage.from(VIDEO_STUDIO_BUCKET).getPublicUrl(storagePath)
        .data.publicUrl;
    }
  }

  const asset: VideoMediaAsset = {
    id,
    kind: (params.kind === "source-image" || params.kind === "export"
      ? "clip"
      : params.kind) as VideoMediaAsset["kind"],
    mimeType: params.mimeType,
    url: publicUrl || `storage://${storagePath}`,
    posterUrl: params.mimeType.startsWith("image/") ? publicUrl || undefined : undefined,
    durationSec: params.durationSec ?? 0,
    width: params.meta?.width as number | undefined,
    height: params.meta?.height as number | undefined,
    provider: params.provider.includes("preview") ? "preview" : "external",
    storagePath,
    createdAt: nowIso(),
  };

  let record: StoredMediaRecord | null = null;
  if (!uploadError) {
    const { data, error } = await params.supabase
      .from("video_media")
      .insert({
        id,
        user_id: params.userId,
        generation_id: params.generationId || null,
        kind: params.kind,
        mime_type: params.mimeType,
        storage_path: storagePath,
        public_url: publicUrl,
        size_bytes: params.bytes.byteLength,
        duration_sec: params.durationSec ?? null,
        provider: params.provider,
        meta: params.meta || {},
      })
      .select("*")
      .single();

    if (!error && data) {
      record = {
        id: String(data.id),
        userId: String(data.user_id),
        generationId: (data.generation_id as string) || null,
        kind: String(data.kind),
        mimeType: String(data.mime_type),
        storagePath: String(data.storage_path),
        publicUrl: (data.public_url as string) || null,
        sizeBytes: Number(data.size_bytes || 0),
        durationSec: data.duration_sec == null ? null : Number(data.duration_sec),
        provider: String(data.provider || ""),
        meta: (data.meta as Record<string, unknown>) || {},
        createdAt: String(data.created_at || nowIso()),
      };
    }
  }

  // If bucket/table missing, still return in-memory asset with data URL fallback for small files
  if (uploadError && params.bytes.byteLength < 400_000) {
    const b64 = Buffer.from(params.bytes).toString("base64");
    asset.url = `data:${params.mimeType};base64,${b64}`;
  }

  return { asset, record, storagePath };
}

export async function fetchRemoteToBytes(url: string): Promise<Uint8Array | null> {
  try {
    if (url.startsWith("data:")) {
      const comma = url.indexOf(",");
      if (comma < 0) return null;
      const meta = url.slice(5, comma);
      const data = url.slice(comma + 1);
      if (!meta.includes("base64")) return null;
      return new Uint8Array(Buffer.from(data, "base64"));
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function listVideoStudioMedia(params: {
  supabase: AnySupabase;
  userId: string;
  generationId?: string | null;
}): Promise<StoredMediaRecord[]> {
  let query = params.supabase
    .from("video_media")
    .select("*")
    .eq("user_id", params.userId)
    .order("created_at", { ascending: false });
  if (params.generationId) {
    query = query.eq("generation_id", params.generationId);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    generationId: (row.generation_id as string) || null,
    kind: String(row.kind),
    mimeType: String(row.mime_type),
    storagePath: String(row.storage_path),
    publicUrl: (row.public_url as string) || null,
    sizeBytes: Number(row.size_bytes || 0),
    durationSec: row.duration_sec == null ? null : Number(row.duration_sec),
    provider: String(row.provider || ""),
    meta: (row.meta as Record<string, unknown>) || {},
    createdAt: String(row.created_at || nowIso()),
  }));
}

export async function getVideoStudioMediaPreview(params: {
  supabase: AnySupabase;
  userId: string;
  mediaId: string;
  expiresInSec?: number;
}): Promise<{ url: string | null; record: StoredMediaRecord | null }> {
  const { data, error } = await params.supabase
    .from("video_media")
    .select("*")
    .eq("id", params.mediaId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error || !data) return { url: null, record: null };

  const record: StoredMediaRecord = {
    id: String(data.id),
    userId: String(data.user_id),
    generationId: (data.generation_id as string) || null,
    kind: String(data.kind),
    mimeType: String(data.mime_type),
    storagePath: String(data.storage_path),
    publicUrl: (data.public_url as string) || null,
    sizeBytes: Number(data.size_bytes || 0),
    durationSec: data.duration_sec == null ? null : Number(data.duration_sec),
    provider: String(data.provider || ""),
    meta: (data.meta as Record<string, unknown>) || {},
    createdAt: String(data.created_at || nowIso()),
  };

  const signed = await params.supabase.storage
    .from(VIDEO_STUDIO_BUCKET)
    .createSignedUrl(record.storagePath, params.expiresInSec ?? 3600);

  return {
    url: signed.data?.signedUrl || record.publicUrl,
    record,
  };
}

export async function deleteVideoStudioMedia(params: {
  supabase: AnySupabase;
  userId: string;
  mediaId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await params.supabase
    .from("video_media")
    .select("*")
    .eq("id", params.mediaId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error || !data) return { ok: false, error: "Media not found" };

  const storagePath = String(data.storage_path || "");
  if (storagePath) {
    await params.supabase.storage.from(VIDEO_STUDIO_BUCKET).remove([storagePath]);
  }

  const { error: delErr } = await params.supabase
    .from("video_media")
    .delete()
    .eq("id", params.mediaId)
    .eq("user_id", params.userId);

  if (delErr) return { ok: false, error: delErr.message };
  return { ok: true };
}

/** Delete all media + storage objects for a generation. */
export async function purgeGenerationMedia(params: {
  supabase: AnySupabase;
  userId: string;
  generationId: string;
}): Promise<{ deleted: number }> {
  const rows = await listVideoStudioMedia({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
  });
  const paths = rows.map((r) => r.storagePath).filter(Boolean);
  if (paths.length) {
    await params.supabase.storage.from(VIDEO_STUDIO_BUCKET).remove(paths);
  }
  await params.supabase
    .from("video_media")
    .delete()
    .eq("user_id", params.userId)
    .eq("generation_id", params.generationId);
  await params.supabase
    .from("video_render_jobs")
    .delete()
    .eq("user_id", params.userId)
    .eq("generation_id", params.generationId);
  return { deleted: rows.length };
}
