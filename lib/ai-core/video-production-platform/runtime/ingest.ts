/**
 * Ingest provider bytes into a domain VideoArtifact.
 * Validates MIME/signature, duration, dimensions, and size before persist.
 */

import { createHash } from "node:crypto";
import type { VideoArtifact } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { assertValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";
import { resolveExportPreset, probeMediaBytes } from "@/lib/ai-core/video-production-platform/assemble";
import {
  fetchRemoteVideoToBytes,
  uploadVideoStudioMedia,
} from "@/lib/ai-core/video-production-platform/media-storage";
import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";
import { validateVideoStudioUpload } from "@/lib/ai-core/video-production-platform/upload-validation";
import { insertPlayableArtifact } from "@/lib/ai-core/video-production-platform/persistence/repository";
import { artifactFromMediaRow, type VideoMediaArtifactRow } from "@/lib/ai-core/video-production-platform/persistence/mappers";
import type { ProviderJobHandle } from "@/lib/ai-core/video-production-platform/provider-router/contract";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export class ArtifactIngestError extends Error {
  constructor(
    message: string,
    readonly errorCode:
      | "missing_bytes"
      | "invalid_mime"
      | "invalid_signature"
      | "invalid_duration"
      | "invalid_dimensions"
      | "invalid_file_size"
      | "invalid_artifact",
  ) {
    super(message);
    this.name = "ArtifactIngestError";
  }
}

function normalizeMime(mime?: string | null): string {
  return (mime || "").split(";")[0].trim().toLowerCase();
}

const MIN_VIDEO_BYTES = 1024;

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function readHandleBytes(handle: ProviderJobHandle): Promise<Uint8Array> {
  if (handle.bytes && handle.bytes.byteLength > 0) return handle.bytes;
  if (handle.remoteUrl) {
    const fetched = await fetchRemoteVideoToBytes(handle.remoteUrl);
    if (fetched?.byteLength) return fetched;
  }
  throw new ArtifactIngestError("Provider returned no downloadable video bytes.", "missing_bytes");
}

export async function ingestProviderArtifact(params: {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  sceneId: string;
  handle: ProviderJobHandle;
  declaredDurationSec: number;
  aspectRatio: string;
  kind: VideoArtifact["kind"];
}): Promise<VideoArtifact> {
  const bytes = await readHandleBytes(params.handle);
  if (bytes.byteLength < MIN_VIDEO_BYTES) {
    throw new ArtifactIngestError(
      `Video artifact is too small (${bytes.byteLength} bytes).`,
      "invalid_file_size",
    );
  }
  if (isStubVideoBytes(bytes)) {
    throw new ArtifactIngestError("Stub or placeholder MP4 is not allowed.", "invalid_signature");
  }
  const checksum = sha256Hex(bytes);
  const declaredMime = normalizeMime(params.handle.mimeType) || "video/mp4";
  const ext = declaredMime.includes("webm") ? "webm" : "mp4";
  const filename = `${params.kind === "composite" ? "final" : `scene-${params.sceneId}`}.${ext}`;

  let mimeType: string;
  try {
    mimeType = validateVideoStudioUpload({
      bytes: Buffer.from(bytes),
      declaredMime,
      filename,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid video MIME/signature.";
    const code =
      /stub or placeholder/i.test(message) || /signature/i.test(message)
        ? "invalid_signature"
        : /upload limit|too small|empty file/i.test(message)
          ? "invalid_file_size"
          : "invalid_mime";
    throw new ArtifactIngestError(message, code);
  }

  const probed = await probeMediaBytes(bytes);
  const durationSec =
    probed.durationSec && probed.durationSec > 0 ? probed.durationSec : params.declaredDurationSec;
  if (!(durationSec > 0) || !Number.isFinite(durationSec)) {
    throw new ArtifactIngestError("Video duration must be greater than 0.", "invalid_duration");
  }

  const inferred = resolveExportPreset(params.aspectRatio, "1080p");
  const width = probed.width && probed.width > 0 ? probed.width : inferred.width;
  const height = probed.height && probed.height > 0 ? probed.height : inferred.height;
  if (!(width > 0) || !(height > 0)) {
    throw new ArtifactIngestError("Video dimensions must be greater than 0.", "invalid_dimensions");
  }

  const uploaded = await uploadVideoStudioMedia({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.projectId,
    kind: params.kind === "composite" ? "composite" : "clip",
    bytes,
    mimeType,
    filename,
    durationSec,
    provider: params.handle.provider,
    meta: { sceneId: params.sceneId, width, height },
  });

  let artifact: VideoArtifact = {
    id: uploaded.record?.id || uploaded.asset.id,
    projectId: params.projectId,
    kind: params.kind,
    mimeType,
    url: uploaded.asset.url,
    durationSec,
    width,
    height,
    provider: params.handle.provider,
    isStub: false,
    bytes,
  };

  if (!uploaded.record) {
    artifact = await insertPlayableArtifact(params.supabase, {
      userId: params.userId,
      artifact,
      storagePath: uploaded.storagePath,
      sizeBytes: bytes.byteLength,
      sha256: checksum,
      sceneId: params.kind === "scene_clip" ? params.sceneId : null,
    });
  } else {
    await params.supabase
      .from("video_media")
      .update({
        width,
        height,
        duration_sec: durationSec,
        scene_id: params.kind === "scene_clip" ? params.sceneId : null,
        sha256: checksum,
      })
      .eq("id", uploaded.record.id);
    artifact = artifactFromMediaRow({
      id: uploaded.record.id,
      user_id: params.userId,
      generation_id: params.projectId,
      scene_id: params.kind === "scene_clip" ? params.sceneId : null,
      kind: params.kind === "composite" ? "composite" : "clip",
      mime_type: mimeType,
      storage_path: uploaded.storagePath,
      public_url: uploaded.record.publicUrl,
      size_bytes: bytes.byteLength,
      duration_sec: durationSec,
      provider: params.handle.provider,
      sha256: checksum,
      width,
      height,
      fps: null,
      codec: null,
      qc_score: null,
      created_at: uploaded.record.createdAt,
    } as VideoMediaArtifactRow);
    artifact = { ...artifact, bytes };
  }

  try {
    assertValidVideoArtifact(artifact);
  } catch (error) {
    throw new ArtifactIngestError(
      error instanceof Error ? error.message : "Invalid video artifact.",
      "invalid_artifact",
    );
  }
  return artifact;
}
