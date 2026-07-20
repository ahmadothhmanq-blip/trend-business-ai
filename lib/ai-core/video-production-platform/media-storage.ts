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
    const res = await fetch(url);
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}
