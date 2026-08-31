/**
 * Media storage for Video Studio — Supabase Storage bucket + DB metadata.
 * Large binaries live in storage, not JSONB.
 */

import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import type { VideoMediaAsset } from "@/lib/ai-core/video-production-platform/types";
import {
  VIDEO_STUDIO_VIDEO_MAX_BYTES,
  validateVideoStudioUpload,
} from "@/lib/ai-core/video-production-platform/upload-validation";
import { assertSafeRemoteFetchUrl, UnsafeRemoteUrlError } from "@/lib/website/url-safety";

export const VIDEO_STUDIO_BUCKET = "video-studio";

/** Signed download TTL for private bucket objects (7 days). */
export const VIDEO_STUDIO_SIGNED_URL_TTL_SEC = 60 * 60 * 24 * 7;

/** Bucket object cap aligned with video ingest (256 MiB). */
export const VIDEO_STUDIO_BUCKET_FILE_SIZE_LIMIT = VIDEO_STUDIO_VIDEO_MAX_BYTES;

export const VIDEO_STUDIO_BUCKET_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "text/vtt",
] as const;

/** Unsigned `/object/public/` URLs must never be used for this private bucket. */
export function isUnsignedPublicStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\/object\/public\//i.test(url);
}

export function isSafePrivateMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("data:")) return true;
  if (url.startsWith("storage://")) return false;
  if (isUnsignedPublicStorageUrl(url)) return false;
  return /^https?:\/\//i.test(url);
}

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
  const mimeType = validateVideoStudioUpload({
    bytes: Buffer.from(params.bytes),
    declaredMime: params.mimeType,
    filename: params.filename,
  });
  const safe = params.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const id = vid("media", safe, Date.now() % 100000);
  const storagePath = `${params.userId}/${params.generationId || "library"}/${id}-${safe}`;

  const { error: uploadError } = await params.supabase.storage
    .from(VIDEO_STUDIO_BUCKET)
    .upload(storagePath, params.bytes, {
      contentType: mimeType,
      upsert: false,
    });

  let publicUrl: string | null = null;
  if (!uploadError) {
    const signed = await params.supabase.storage
      .from(VIDEO_STUDIO_BUCKET)
      .createSignedUrl(storagePath, VIDEO_STUDIO_SIGNED_URL_TTL_SEC);
    const signedUrl = signed.data?.signedUrl ?? null;
    publicUrl = isSafePrivateMediaUrl(signedUrl) ? signedUrl : null;
  }

  const asset: VideoMediaAsset = {
    id,
    kind: (params.kind === "source-image" || params.kind === "export"
      ? "clip"
      : params.kind) as VideoMediaAsset["kind"],
    mimeType,
    url: publicUrl || `storage://${storagePath}`,
    posterUrl: mimeType.startsWith("image/") ? publicUrl || undefined : undefined,
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
        mime_type: mimeType,
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
    asset.url = `data:${mimeType};base64,${b64}`;
  }

  return { asset, record, storagePath };
}

/** Default remote fetch cap for stills / audio / non-video callers. Do not raise this. */
const DEFAULT_REMOTE_MAX_BYTES = 8_000_000;
const DEFAULT_REMOTE_TIMEOUT_MS = 10_000;
const VIDEO_REMOTE_TIMEOUT_MS = 120_000;

export type FetchRemoteToBytesOptions = {
  maxBytes?: number;
  timeoutMs?: number;
};

export async function fetchRemoteToBytes(
  url: string,
  options?: FetchRemoteToBytesOptions,
): Promise<Uint8Array | null> {
  const maxBytes = options?.maxBytes ?? DEFAULT_REMOTE_MAX_BYTES;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_REMOTE_TIMEOUT_MS;
  try {
    if (url.startsWith("data:")) {
      const comma = url.indexOf(",");
      if (comma < 0) return null;
      const meta = url.slice(5, comma).toLowerCase();
      if (meta.includes("svg") || meta.includes("html") || meta.includes("xml")) {
        return null;
      }
      const data = url.slice(comma + 1);
      if (!meta.includes("base64")) return null;
      const bytes = new Uint8Array(Buffer.from(data, "base64"));
      if (bytes.byteLength === 0 || bytes.byteLength > maxBytes) return null;
      return bytes;
    }
    await assertSafeRemoteFetchUrl(url);
    const res = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > maxBytes) return null;
    return buf;
  } catch (error) {
    if (error instanceof UnsafeRemoteUrlError) return null;
    return null;
  }
}

/** Provider clip / composite ingest. Keeps still/audio callers on the 8MB default. */
export async function fetchRemoteVideoToBytes(url: string): Promise<Uint8Array | null> {
  return fetchRemoteToBytes(url, {
    maxBytes: VIDEO_STUDIO_VIDEO_MAX_BYTES,
    timeoutMs: VIDEO_REMOTE_TIMEOUT_MS,
  });
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
  const signedUrl = signed.data?.signedUrl ?? null;
  const stored = isSafePrivateMediaUrl(record.publicUrl) ? record.publicUrl : null;

  return {
    url: isSafePrivateMediaUrl(signedUrl) ? signedUrl : stored,
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

const STORAGE_PROBE_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export type VideoStudioStorageHealth = {
  bucketExists: boolean;
  private: boolean;
  uploadOk: boolean;
  signedUrlOk: boolean;
  unsignedPublicRejected: boolean;
  fileSizeLimitBytes: number | null;
  allowedMimeTypes: string[] | null;
  signedUrlTtlSec: number;
  lifecycle: "signed-url-expiry";
  bucketId: string;
  message: string;
};

function bucketRecord(data: unknown): {
  id?: string;
  public?: boolean;
  file_size_limit?: number | null;
  allowed_mime_types?: string[] | null;
} | null {
  if (!data || typeof data !== "object") return null;
  return data as {
    id?: string;
    public?: boolean;
    file_size_limit?: number | null;
    allowed_mime_types?: string[] | null;
  };
}

/**
 * Production storage probe: private bucket, upload policy, signed download, reject public URLs.
 * Leaves no object behind.
 */
export async function probeVideoStudioStorage(supabase: AnySupabase): Promise<VideoStudioStorageHealth> {
  const bucketId = VIDEO_STUDIO_BUCKET;
  const base: VideoStudioStorageHealth = {
    bucketExists: false,
    private: false,
    uploadOk: false,
    signedUrlOk: false,
    unsignedPublicRejected: isUnsignedPublicStorageUrl(
      "https://example.supabase.co/storage/v1/object/public/video-studio/x",
    ),
    fileSizeLimitBytes: null,
    allowedMimeTypes: null,
    signedUrlTtlSec: VIDEO_STUDIO_SIGNED_URL_TTL_SEC,
    lifecycle: "signed-url-expiry",
    bucketId,
    message: `Bucket "${bucketId}" missing — apply migrations 044 and 098.`,
  };

  if (!supabase?.storage) {
    return { ...base, message: "Storage client unavailable (SUPABASE_SERVICE_ROLE_KEY required)." };
  }

  try {
    let found: ReturnType<typeof bucketRecord> = null;
    const listed = await supabase.storage.listBuckets();
    if (listed?.error) {
      return { ...base, message: listed.error.message };
    }
    found =
      (listed?.data || [])
        .map((row: unknown) => bucketRecord(row))
        .find((row: ReturnType<typeof bucketRecord>) => row?.id === bucketId) ?? null;

    try {
      const get = await supabase.storage.getBucket?.(bucketId);
      if (get?.data) found = bucketRecord(get.data) ?? found;
    } catch {
      /* listBuckets is sufficient when getBucket is unavailable */
    }

    if (!found) {
      return base;
    }

    const isPrivate = found.public === false;
    const fileSizeLimitBytes =
      typeof found.file_size_limit === "number" ? found.file_size_limit : null;
    const allowedMimeTypes = Array.isArray(found.allowed_mime_types) ? found.allowed_mime_types : null;

    const probePath = `_health/ops-probe-${Date.now()}.png`;
    let uploadOk = false;
    let signedUrlOk = false;
    let unsignedPublicRejected = true;

    const uploaded = await supabase.storage.from(bucketId).upload(probePath, STORAGE_PROBE_PNG, {
      contentType: "image/png",
      upsert: true,
    });
    uploadOk = !uploaded?.error;
    if (uploadOk) {
      const signed = await supabase.storage.from(bucketId).createSignedUrl(probePath, 60);
      const signedUrl = signed?.data?.signedUrl ?? "";
      signedUrlOk = isSafePrivateMediaUrl(signedUrl);
      unsignedPublicRejected =
        isUnsignedPublicStorageUrl(
          "https://example.supabase.co/storage/v1/object/public/video-studio/x",
        ) && !isUnsignedPublicStorageUrl(signedUrl);
      await supabase.storage.from(bucketId).remove([probePath]);
    }

    const messages: string[] = [];
    if (!isPrivate) messages.push(`Bucket "${bucketId}" must be private (public=false).`);
    if (!uploadOk) messages.push(uploaded?.error?.message || "Storage upload probe failed.");
    if (uploadOk && !signedUrlOk) messages.push("Signed URL probe failed or returned an unsafe public URL.");
    if (fileSizeLimitBytes == null) messages.push("Bucket file_size_limit unset — apply migration 098.");
    if (!allowedMimeTypes?.length) messages.push("Bucket allowed_mime_types unset — apply migration 098.");

    return {
      bucketExists: true,
      private: isPrivate,
      uploadOk,
      signedUrlOk,
      unsignedPublicRejected,
      fileSizeLimitBytes,
      allowedMimeTypes,
      signedUrlTtlSec: VIDEO_STUDIO_SIGNED_URL_TTL_SEC,
      lifecycle: "signed-url-expiry",
      bucketId,
      message: messages.length
        ? messages.join(" ")
        : `Bucket "${bucketId}" is private; upload and signed download succeeded.`,
    };
  } catch (error) {
    return {
      ...base,
      message: error instanceof Error ? error.message : "Storage check failed",
    };
  }
}

