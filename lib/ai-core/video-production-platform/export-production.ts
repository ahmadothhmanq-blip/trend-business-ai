/**
 * Production social export — verified playable composite only.
 * FFmpeg write + probe must succeed before export is reported complete.
 * Re-export of the same artifact is not a paid generation.
 */

import type {
  SocialExportPreset,
  VideoProductionModel,
} from "@/lib/ai-core/video-production-platform/types";
import type { VideoArtifact } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";
import {
  assembleComposite,
  probeMediaBytes,
  resolveExportPreset,
  type AssemblyResult,
} from "@/lib/ai-core/video-production-platform/assemble";
import {
  fetchRemoteToBytes,
  fetchRemoteVideoToBytes,
  uploadVideoStudioMedia,
  VIDEO_STUDIO_BUCKET,
} from "@/lib/ai-core/video-production-platform/media-storage";
import { sha256Hex } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import { isNarrationRequired } from "@/lib/ai-core/video-production-platform/audio-engine/render-lane";
import { assertValidAudioBytes } from "@/lib/ai-core/video-production-platform/audio-engine/validation";
import { listAudioJobsForProject, loadAudioArtifact } from "@/lib/ai-core/video-production-platform/audio-engine/persist";
import { loadOwnedFinalComposite } from "@/lib/ai-core/video-production-platform/persistence/repository";
import type { VideoMediaArtifactRow } from "@/lib/ai-core/video-production-platform/persistence/mappers";
import { validateVideoStudioUpload } from "@/lib/ai-core/video-production-platform/upload-validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MIN_VIDEO_BYTES = 1024;

export type ProductionExportErrorCode =
  | "missing_composite"
  | "invalid_artifact"
  | "invalid_mime"
  | "invalid_signature"
  | "invalid_duration"
  | "invalid_dimensions"
  | "invalid_codec"
  | "checksum_mismatch"
  | "audio_required"
  | "ownership"
  | "ffmpeg_failed"
  | "export_failed";

export class ProductionExportError extends Error {
  constructor(
    message: string,
    readonly code: ProductionExportErrorCode,
  ) {
    super(message);
    this.name = "ProductionExportError";
  }
}

export type VerifiedCompositeArtifact = {
  id?: string;
  mimeType: "video/mp4" | "video/webm";
  durationSec: number;
  width: number;
  height: number;
  codec: string;
  sha256: string;
  size: number;
  hasAudio: boolean;
  audioCodec: string | null;
  url: string;
  bytes: Uint8Array;
};

export type ProductionExportResult = {
  reencoded: boolean;
  reused: boolean;
  charged: false;
  videoUrl: string;
  message: string;
  artifact: VerifiedCompositeArtifact;
  audioIncluded: boolean;
  audioRequired: boolean;
  preset: SocialExportPreset;
};

export type ProductionExportDeps = {
  assemble?: typeof assembleComposite;
  probe?: typeof probeMediaBytes;
  fetchVideo?: typeof fetchRemoteVideoToBytes;
  fetchAudio?: typeof fetchRemoteToBytes;
  upload?: typeof uploadVideoStudioMedia;
};

function normalizeMime(mime?: string | null): string {
  return (mime || "").split(";")[0].trim().toLowerCase();
}

export function sniffPlayableVideoMime(bytes: Uint8Array): "video/mp4" | "video/webm" | null {
  if (!bytes || bytes.byteLength < 12) return null;
  if (isStubVideoBytes(bytes)) return null;
  if (Buffer.from(bytes.subarray(4, 8)).toString("ascii") === "ftyp") return "video/mp4";
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return "video/webm";
  }
  return null;
}

export async function verifyPlayableCompositeBytes(input: {
  bytes: Uint8Array;
  declaredMime?: string | null;
  url?: string;
  id?: string;
  probe?: typeof probeMediaBytes;
}): Promise<VerifiedCompositeArtifact> {
  const bytes = input.bytes;
  if (!bytes?.byteLength || bytes.byteLength < MIN_VIDEO_BYTES) {
    throw new ProductionExportError(
      `Composite artifact is too small (${bytes?.byteLength || 0} bytes).`,
      "invalid_artifact",
    );
  }
  if (isStubVideoBytes(bytes)) {
    throw new ProductionExportError("Stub or preview bytes cannot be exported.", "invalid_signature");
  }
  const sniffed = sniffPlayableVideoMime(bytes);
  if (!sniffed) {
    throw new ProductionExportError(
      "Composite magic bytes are not a playable video/mp4 or video/webm file.",
      "invalid_signature",
    );
  }
  const declared = normalizeMime(input.declaredMime);
  if (declared && declared !== sniffed) {
    throw new ProductionExportError(
      `Declared MIME ${declared} does not match file signature ${sniffed}.`,
      "invalid_mime",
    );
  }
  let mimeType: "video/mp4" | "video/webm";
  try {
    mimeType = validateVideoStudioUpload({
      bytes: Buffer.from(bytes),
      declaredMime: sniffed,
      filename: sniffed === "video/webm" ? "export.webm" : "export.mp4",
    }) as "video/mp4" | "video/webm";
  } catch (error) {
    throw new ProductionExportError(
      error instanceof Error ? error.message : "Invalid composite MIME/signature.",
      "invalid_mime",
    );
  }

  const probe = input.probe || probeMediaBytes;
  const probed = await probe(bytes);
  if (!(probed.durationSec && probed.durationSec > 0)) {
    throw new ProductionExportError("Exported video duration must be greater than 0.", "invalid_duration");
  }
  if (!(probed.width && probed.width > 0) || !(probed.height && probed.height > 0)) {
    throw new ProductionExportError("Exported video width/height must be greater than 0.", "invalid_dimensions");
  }
  if (!probed.codec?.trim()) {
    throw new ProductionExportError("Exported video codec could not be verified.", "invalid_codec");
  }

  const checksum = sha256Hex(bytes);
  const artifactShape: VideoArtifact = {
    id: input.id || "export-verify",
    projectId: "export",
    kind: "composite",
    mimeType,
    url: input.url || `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`,
    durationSec: probed.durationSec,
    width: probed.width,
    height: probed.height,
    provider: "ffmpeg",
    isStub: false,
    bytes,
  };
  if (!isValidVideoArtifact(artifactShape)) {
    throw new ProductionExportError(
      "Composite is not a playable video/mp4 or video/webm artifact.",
      "invalid_artifact",
    );
  }

  return {
    id: input.id,
    mimeType,
    durationSec: probed.durationSec,
    width: probed.width,
    height: probed.height,
    codec: probed.codec.trim(),
    sha256: checksum,
    size: bytes.byteLength,
    hasAudio: Boolean(probed.hasAudio),
    audioCodec: probed.audioCodec || null,
    url: artifactShape.url,
    bytes,
  };
}

function exportAudioRequired(model: VideoProductionModel): boolean {
  return isNarrationRequired(model, []);
}

function dataUrlFor(bytes: Uint8Array, mimeType: string): string {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

async function readMediaBytes(input: {
  supabase: AnySupabase;
  url: string | null | undefined;
  storagePath?: string | null;
  fetchVideo: typeof fetchRemoteVideoToBytes;
}): Promise<Uint8Array | null> {
  if (input.url) {
    const fetched = await input.fetchVideo(input.url);
    if (fetched?.byteLength) return fetched;
  }
  if (input.storagePath) {
    const downloaded = await input.supabase.storage.from(VIDEO_STUDIO_BUCKET).download(input.storagePath);
    const blob = downloaded?.data;
    if (blob && typeof blob.arrayBuffer === "function") {
      const buf = new Uint8Array(await blob.arrayBuffer());
      if (buf.byteLength) return buf;
    }
  }
  return null;
}

async function resolveMixedAudio(input: {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  model: VideoProductionModel;
  fetchAudio: typeof fetchRemoteToBytes;
}): Promise<{ url: string; sha256: string } | null> {
  const job = input.model.jobs[input.model.jobs.length - 1];
  const candidates = [
    job?.audioAsset,
    ...input.model.assets.filter((asset) => asset.kind === "audio"),
  ].filter((asset): asset is NonNullable<typeof asset> => Boolean(asset?.url));

  for (const asset of candidates) {
    const bytes = await input.fetchAudio(asset.url);
    if (!bytes?.byteLength) continue;
    try {
      assertValidAudioBytes({ bytes, declaredMime: asset.mimeType, durationSec: asset.durationSec || undefined });
    } catch {
      continue;
    }
    return { url: asset.url, sha256: sha256Hex(bytes) };
  }

  try {
    const jobs = await listAudioJobsForProject(input.supabase, input.projectId);
    const mix = [...jobs].reverse().find((row) => row.kind === "mix" && row.status === "succeeded" && row.artifactId);
    if (!mix?.artifactId) return null;
    const artifact = await loadAudioArtifact(input.supabase, { userId: input.userId, artifactId: mix.artifactId });
    if (!artifact?.url) return null;
    const bytes = artifact.bytes || (await input.fetchAudio(artifact.url));
    if (!bytes?.byteLength) return null;
    assertValidAudioBytes({ bytes, declaredMime: artifact.mimeType, durationSec: artifact.durationSec });
    return { url: artifact.url, sha256: sha256Hex(bytes) };
  } catch {
    return null;
  }
}

async function loadExistingVerifiedExport(input: {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  presetId: string;
  sourceSha256: string;
  audioSha256: string;
  probe: typeof probeMediaBytes;
  fetchVideo: typeof fetchRemoteVideoToBytes;
}): Promise<VerifiedCompositeArtifact | null> {
  const { data, error } = await input.supabase
    .from("video_media")
    .select("*")
    .eq("user_id", input.userId)
    .eq("generation_id", input.projectId)
    .eq("kind", "export")
    .order("created_at", { ascending: false })
    .limit(12);
  if (error && error.code !== "PGRST116") return null;
  const rows = (data || []) as Array<VideoMediaArtifactRow & { meta?: Record<string, unknown>; public_url?: string | null }>;
  for (const row of rows) {
    const meta = (row as { meta?: Record<string, unknown> }).meta || {};
    if (meta.presetId !== input.presetId) continue;
    if (meta.sourceSha256 !== input.sourceSha256) continue;
    if ((meta.audioSha256 || "none") !== input.audioSha256) continue;
    if (meta.exportVerified !== true) continue;
    const url = row.public_url || `storage://${row.storage_path}`;
    const bytes = await readMediaBytes({
      supabase: input.supabase,
      url,
      storagePath: row.storage_path,
      fetchVideo: input.fetchVideo,
    });
    if (!bytes) continue;
    try {
      const verified = await verifyPlayableCompositeBytes({
        bytes,
        declaredMime: row.mime_type,
        url,
        id: row.id,
        probe: input.probe,
      });
      if (verified.sha256 !== String(meta.sha256 || verified.sha256)) {
        throw new ProductionExportError("Stored export checksum does not match file bytes.", "checksum_mismatch");
      }
      return { ...verified, id: row.id, url };
    } catch {
      continue;
    }
  }
  return null;
}

export async function exportProductionForSocialPreset(params: {
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  model: VideoProductionModel;
  preset: SocialExportPreset;
  reencode?: boolean;
  deps?: ProductionExportDeps;
}): Promise<ProductionExportResult> {
  const preset = params.preset;
  const assemble = params.deps?.assemble || assembleComposite;
  const probe = params.deps?.probe || probeMediaBytes;
  const fetchVideo = params.deps?.fetchVideo || fetchRemoteVideoToBytes;
  const fetchAudio = params.deps?.fetchAudio || fetchRemoteToBytes;
  const upload = params.deps?.upload || uploadVideoStudioMedia;

  let stored: { artifact: VideoArtifact; row: VideoMediaArtifactRow } | null = null;
  try {
    stored = await loadOwnedFinalComposite(params.supabase, {
      userId: params.userId,
      projectId: params.generationId,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "CompositeOwnershipError") {
      throw new ProductionExportError(error.message, "ownership");
    }
    throw error;
  }

  const job = params.model.jobs[params.model.jobs.length - 1];
  const sourceUrl = stored?.artifact.url || job?.compositeAsset?.url || null;
  if (!sourceUrl && !stored) {
    throw new ProductionExportError(
      "No playable composite artifact. Export requires a final assembled video/mp4 or video/webm — clips, stubs, and previews are not accepted.",
      "missing_composite",
    );
  }

  const sourceBytes = await readMediaBytes({
    supabase: params.supabase,
    url: sourceUrl,
    storagePath: stored?.row.storage_path,
    fetchVideo,
  });
  if (!sourceBytes) {
    throw new ProductionExportError(
      "Composite bytes could not be read. Export refuses unverified sources.",
      "missing_composite",
    );
  }

  const source = await verifyPlayableCompositeBytes({
    bytes: sourceBytes,
    declaredMime: stored?.artifact.mimeType || job?.compositeAsset?.mimeType || undefined,
    url: sourceUrl || undefined,
    id: stored?.artifact.id || job?.compositeAsset?.id,
    probe,
  });

  const audioRequired = exportAudioRequired(params.model);
  const mixed = await resolveMixedAudio({
    supabase: params.supabase,
    userId: params.userId,
    projectId: params.generationId,
    model: params.model,
    fetchAudio,
  });
  if (audioRequired && !mixed) {
    throw new ProductionExportError(
      "Narration is required but no mixed audio artifact is available for the final render.",
      "audio_required",
    );
  }

  const audioSha256 = mixed?.sha256 || "none";
  const existing = await loadExistingVerifiedExport({
    supabase: params.supabase,
    userId: params.userId,
    projectId: params.generationId,
    presetId: preset.id,
    sourceSha256: source.sha256,
    audioSha256,
    probe,
    fetchVideo,
  });
  if (existing) {
    if (audioRequired && !existing.hasAudio) {
      throw new ProductionExportError(
        "Stored export is missing the required mixed audio track.",
        "audio_required",
      );
    }
    return {
      reencoded: false,
      reused: true,
      charged: false,
      videoUrl: existing.url,
      message: `Reused verified ${preset.label} export of the same composite artifact. No credits charged.`,
      artifact: existing,
      audioIncluded: existing.hasAudio,
      audioRequired,
      preset,
    };
  }

  const shouldReencode = params.reencode !== false;
  if (!shouldReencode) {
    if (audioRequired && !source.hasAudio) {
      throw new ProductionExportError(
        "Existing composite has no audio track, and narration is required.",
        "audio_required",
      );
    }
    return {
      reencoded: false,
      reused: true,
      charged: false,
      videoUrl: sourceUrl || source.url,
      message: `Using existing verified composite for ${preset.label} (no re-encode). No credits charged.`,
      artifact: { ...source, url: sourceUrl || source.url },
      audioIncluded: source.hasAudio,
      audioRequired,
      preset,
    };
  }

  const assembled: AssemblyResult = await assemble({
    title: `${params.model.title}-${preset.id}`,
    clips: [
      {
        url: sourceUrl || dataUrlFor(source.bytes, source.mimeType),
        durationSec: Math.min(source.durationSec, preset.maxDurationSec),
      },
    ],
    audioUrl: mixed?.url,
    subtitles: params.model.subtitles.map((cue, index) => ({
      startSec: cue.startSec ?? index * 3,
      endSec: cue.endSec ?? (cue.startSec ?? index * 3) + 3,
      text: cue.text,
    })),
    burnSubtitles: preset.captions && params.model.subtitles.length > 0,
    exportPreset: resolveExportPreset(preset.aspectRatio, preset.quality),
    outputFormat: source.mimeType === "video/webm" ? "webm" : "mp4",
    requireFfmpeg: true,
  });

  if (assembled.method !== "ffmpeg" || !assembled.bytes?.byteLength) {
    throw new ProductionExportError(
      assembled.note || "FFmpeg did not finish writing a playable export.",
      "ffmpeg_failed",
    );
  }

  const verified = await verifyPlayableCompositeBytes({
    bytes: assembled.bytes,
    declaredMime: assembled.mimeType,
    probe,
  });
  if (audioRequired && !verified.hasAudio) {
    throw new ProductionExportError(
      "FFmpeg export completed without the required mixed audio track.",
      "audio_required",
    );
  }

  const ext = verified.mimeType === "video/webm" ? "webm" : "mp4";
  const uploaded = await upload({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    kind: "export",
    bytes: verified.bytes,
    mimeType: verified.mimeType,
    filename: `${preset.id}-export.${ext}`,
    durationSec: verified.durationSec,
    provider: "ffmpeg",
    meta: {
      presetId: preset.id,
      aspectRatio: preset.aspectRatio,
      quality: preset.quality,
      sourceSha256: source.sha256,
      audioSha256,
      sha256: verified.sha256,
      codec: verified.codec,
      width: verified.width,
      height: verified.height,
      size: verified.size,
      hasAudio: verified.hasAudio,
      exportVerified: true,
      charged: false,
    },
  });

  const videoUrl = uploaded.asset.url;
  if (uploaded.record?.id) {
    await params.supabase
      .from("video_media")
      .update({
        sha256: verified.sha256,
        width: verified.width,
        height: verified.height,
        codec: verified.codec,
        duration_sec: verified.durationSec,
        size_bytes: verified.size,
        mime_type: verified.mimeType,
      })
      .eq("id", uploaded.record.id);
  }

  const persisted: VerifiedCompositeArtifact = {
    ...verified,
    id: uploaded.record?.id || uploaded.asset.id,
    url: videoUrl,
  };

  return {
    reencoded: true,
    reused: false,
    charged: false,
    videoUrl,
    message: `Exported verified ${preset.label} ${verified.mimeType} (${verified.width}×${verified.height} ${verified.codec}, ${verified.durationSec.toFixed(2)}s). No credits charged for re-export of an existing composite.`,
    artifact: persisted,
    audioIncluded: verified.hasAudio,
    audioRequired,
    preset,
  };
}
