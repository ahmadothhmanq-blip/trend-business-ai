import { randomUUID } from "node:crypto";
import { VIDEO_STUDIO_BUCKET } from "@/lib/ai-core/video-production-platform/media-storage";
import { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type LipSyncJobStatus = "queued" | "submitted" | "processing" | "succeeded" | "failed" | "cancelled";

export type LipSyncJobRecord = {
  id: string;
  userId: string;
  projectId: string;
  sourceArtifactId: string | null;
  audioArtifactId: string | null;
  resultArtifactId: string | null;
  provider: string;
  status: LipSyncJobStatus;
  attempt: number;
  idempotencyKey: string;
  estimatedCost: number | null;
  actualCost: number | null;
  speaker: string | null;
  language: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  externalJobId: string | null;
};

export type LipSyncMediaRow = {
  id: string;
  userId: string;
  projectId: string;
  sceneId: string | null;
  kind: string;
  mimeType: string;
  url: string;
  storagePath: string;
  durationSec: number;
  width: number | null;
  height: number | null;
  provider: string;
  sha256: string | null;
  sizeBytes: number;
};

type JobRow = {
  id: string;
  user_id: string;
  project_id: string;
  source_artifact_id: string | null;
  audio_artifact_id: string | null;
  result_artifact_id: string | null;
  provider: string;
  status: LipSyncJobStatus;
  attempt: number;
  idempotency_key: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  speaker: string | null;
  language: string | null;
  error_code: string | null;
  error_message: string | null;
  external_job_id: string | null;
};

function throwIfError(error: { message?: string; code?: string } | null, action: string): void {
  if (!error) return;
  if (error.code === "23505") {
    throw new LipSyncError(`Duplicate ${action} rejected.`, "idempotency");
  }
  throw new LipSyncError(`${action} failed: ${error.message || "unknown error"}`, "provider_failed");
}

export function jobFromRow(row: JobRow): LipSyncJobRecord {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    sourceArtifactId: row.source_artifact_id,
    audioArtifactId: row.audio_artifact_id,
    resultArtifactId: row.result_artifact_id,
    provider: row.provider,
    status: row.status,
    attempt: row.attempt,
    idempotencyKey: row.idempotency_key,
    estimatedCost: row.estimated_cost == null ? null : Number(row.estimated_cost),
    actualCost: row.actual_cost == null ? null : Number(row.actual_cost),
    speaker: row.speaker,
    language: row.language,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    externalJobId: row.external_job_id,
  };
}

export function mediaFromRow(row: Record<string, unknown>): LipSyncMediaRow {
  const storagePath = String(row.storage_path || "");
  const publicUrl = typeof row.public_url === "string" ? row.public_url : "";
  return {
    id: String(row.id),
    userId: String(row.user_id),
    projectId: String(row.generation_id || ""),
    sceneId: row.scene_id ? String(row.scene_id) : null,
    kind: String(row.kind || ""),
    mimeType: String(row.mime_type || ""),
    url: publicUrl || (storagePath ? `storage://${storagePath}` : ""),
    storagePath,
    durationSec: Number(row.duration_sec || 0),
    width: row.width == null ? null : Number(row.width),
    height: row.height == null ? null : Number(row.height),
    provider: String(row.provider || ""),
    sha256: row.sha256 ? String(row.sha256) : null,
    sizeBytes: Number(row.size_bytes || 0),
  };
}

export async function insertLipSyncJob(
  supabase: AnySupabase,
  input: {
    userId: string;
    projectId: string;
    sourceArtifactId: string;
    audioArtifactId: string;
    provider: string;
    idempotencyKey: string;
    estimatedCost?: number | null;
    speaker?: string | null;
    language?: string | null;
    startSec?: number | null;
    endSec?: number | null;
    attempt?: number;
    status?: LipSyncJobStatus;
  },
): Promise<LipSyncJobRecord> {
  const { data, error } = await supabase
    .from("video_lipsync_jobs")
    .insert({
      id: randomUUID(),
      user_id: input.userId,
      project_id: input.projectId,
      source_artifact_id: input.sourceArtifactId,
      audio_artifact_id: input.audioArtifactId,
      provider: input.provider,
      status: input.status || "queued",
      attempt: input.attempt ?? 1,
      idempotency_key: input.idempotencyKey,
      estimated_cost: input.estimatedCost ?? null,
      speaker: input.speaker ?? null,
      language: input.language ?? null,
      start_sec: input.startSec ?? null,
      end_sec: input.endSec ?? null,
    })
    .select("*")
    .single();
  throwIfError(error, "video_lipsync_jobs.insert");
  return jobFromRow(data as JobRow);
}

export async function findLipSyncJobByIdempotencyKey(
  supabase: AnySupabase,
  idempotencyKey: string,
): Promise<LipSyncJobRecord | null> {
  const { data, error } = await supabase
    .from("video_lipsync_jobs")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  throwIfError(error, "video_lipsync_jobs.read");
  return data ? jobFromRow(data as JobRow) : null;
}

export async function updateLipSyncJob(
  supabase: AnySupabase,
  input: {
    id: string;
    status?: LipSyncJobStatus;
    attempt?: number;
    actualCost?: number | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    resultArtifactId?: string | null;
    externalJobId?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
  },
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (input.attempt != null) patch.attempt = input.attempt;
  if (input.actualCost !== undefined) patch.actual_cost = input.actualCost;
  if (input.errorCode !== undefined) patch.error_code = input.errorCode;
  if (input.errorMessage !== undefined) patch.error_message = input.errorMessage;
  if (input.resultArtifactId !== undefined) patch.result_artifact_id = input.resultArtifactId;
  if (input.externalJobId !== undefined) patch.external_job_id = input.externalJobId;
  if (input.startedAt !== undefined) patch.started_at = input.startedAt;
  if (input.completedAt !== undefined) patch.completed_at = input.completedAt;
  const { error } = await supabase.from("video_lipsync_jobs").update(patch).eq("id", input.id);
  throwIfError(error, "video_lipsync_jobs.update");
}

export async function loadOwnedMedia(
  supabase: AnySupabase,
  input: { userId: string; artifactId: string },
): Promise<LipSyncMediaRow> {
  const { data, error } = await supabase.from("video_media").select("*").eq("id", input.artifactId).maybeSingle();
  throwIfError(error, "video_media.read");
  if (!data) throw new LipSyncError("Media artifact not found.", "not_found");
  const row = mediaFromRow(data as Record<string, unknown>);
  if (!row.userId || row.userId !== input.userId) {
    throw new LipSyncError("Media artifact does not belong to this user.", "ownership");
  }
  return row;
}

export async function signMediaHttpsUrl(
  supabase: AnySupabase,
  row: LipSyncMediaRow,
  expiresInSec = 3600,
): Promise<string> {
  if (row.url.startsWith("https://")) return row.url;
  if (!row.storagePath) {
    throw new LipSyncError("Lip-sync assets must be publicly reachable HTTPS URLs.", "invalid_input");
  }
  const signed = await supabase.storage.from(VIDEO_STUDIO_BUCKET).createSignedUrl(row.storagePath, expiresInSec);
  const url = signed.data?.signedUrl || row.url;
  if (!url?.startsWith("https://")) {
    throw new LipSyncError("Could not create an HTTPS URL for the lip-sync asset.", "invalid_input");
  }
  return url;
}
