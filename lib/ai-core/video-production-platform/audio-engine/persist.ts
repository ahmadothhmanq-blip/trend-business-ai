import { randomUUID } from "node:crypto";
import { VIDEO_STUDIO_BUCKET } from "@/lib/ai-core/video-production-platform/media-storage";
import type {
  AudioArtifact,
  AudioJobKind,
  AudioJobStatus,
  AudioMixJob,
  AudioProductionPlan,
  AudioTrackKind,
  MusicTrack,
  SFXTrack,
  VoiceTrack,
} from "@/lib/ai-core/video-production-platform/domain/audio";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import {
  assertAudioOwnership,
  assertValidAudioBytes,
  isValidAudioArtifact,
  sha256Hex,
} from "@/lib/ai-core/video-production-platform/audio-engine/validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type AudioJobRecord = {
  id: string;
  userId: string;
  projectId: string;
  audioPlanId: string | null;
  trackId: string | null;
  kind: AudioJobKind;
  provider: string;
  status: AudioJobStatus;
  attempt: number;
  idempotencyKey: string;
  estimatedCost: number | null;
  actualCost: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  artifactId: string | null;
};

type AudioPlanRow = {
  id: string;
  user_id: string;
  project_id: string;
  plan_id: string | null;
  language: string;
  voice_script: string;
  target_duration_sec: number;
  status: AudioJobStatus;
};

type AudioTrackRow = {
  id: string;
  user_id: string;
  project_id: string;
  audio_plan_id: string;
  kind: AudioTrackKind;
  metadata: Record<string, unknown>;
  artifact_id: string | null;
  status: AudioJobStatus;
};

type AudioJobRow = {
  id: string;
  user_id: string;
  project_id: string;
  audio_plan_id: string | null;
  track_id: string | null;
  kind: AudioJobKind;
  provider: string;
  status: AudioJobStatus;
  attempt: number;
  idempotency_key: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  error_code: string | null;
  error_message: string | null;
  artifact_id: string | null;
};

type AudioMediaRow = {
  id: string;
  user_id: string;
  generation_id: string | null;
  kind: string;
  mime_type: string;
  storage_path: string;
  public_url: string | null;
  size_bytes: number;
  duration_sec: number | null;
  provider: string;
  sha256: string | null;
  meta: Record<string, unknown>;
};

function throwIfError(error: { message?: string; code?: string } | null, action: string): void {
  if (!error) return;
  if (error.code === "23505") {
    throw new AudioEngineError(`Duplicate ${action} rejected.`, "idempotency");
  }
  throw new AudioEngineError(`${action} failed: ${error.message || "unknown error"}`, "provider_failed");
}

export function jobFromRow(row: AudioJobRow): AudioJobRecord {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    audioPlanId: row.audio_plan_id,
    trackId: row.track_id,
    kind: row.kind,
    provider: row.provider,
    status: row.status,
    attempt: row.attempt,
    idempotencyKey: row.idempotency_key,
    estimatedCost: row.estimated_cost == null ? null : Number(row.estimated_cost),
    actualCost: row.actual_cost == null ? null : Number(row.actual_cost),
    errorCode: row.error_code,
    errorMessage: row.error_message,
    artifactId: row.artifact_id,
  };
}

export function artifactFromMediaRow(row: AudioMediaRow): AudioArtifact {
  const kind = (row.meta?.audioKind as AudioArtifact["kind"]) || (row.kind as AudioArtifact["kind"]);
  return {
    id: row.id,
    projectId: row.generation_id || "",
    userId: row.user_id,
    kind: kind === "mix" || kind === "voice" || kind === "music" || kind === "sfx" ? kind : "voice",
    mimeType: row.mime_type as AudioArtifact["mimeType"],
    url: row.public_url || `storage://${row.storage_path}`,
    durationSec: Number(row.duration_sec || 0),
    sizeBytes: Number(row.size_bytes || 0),
    sha256: row.sha256 || "",
    provider: row.provider,
    isStub: row.provider === "preview" || row.provider === "preview-stub",
  };
}

export async function insertAudioPlan(
  supabase: AnySupabase,
  input: { userId: string; plan: AudioProductionPlan; status?: AudioJobStatus },
): Promise<AudioProductionPlan> {
  const existing = await supabase.from("video_audio_plans").select("*").eq("id", input.plan.id).maybeSingle();
  if (existing.data) return input.plan;
  const { data, error } = await supabase
    .from("video_audio_plans")
    .insert({
      id: input.plan.id,
      user_id: input.userId,
      project_id: input.plan.projectId,
      plan_id: input.plan.planId,
      language: input.plan.language,
      voice_script: input.plan.voiceScript,
      target_duration_sec: input.plan.targetDurationSec,
      status: input.status || "queued",
    })
    .select("*")
    .single();
  throwIfError(error, "video_audio_plans.insert");
  const row = data as AudioPlanRow;
  return { ...input.plan, id: row.id, projectId: row.project_id };
}

export async function insertAudioTracks(
  supabase: AnySupabase,
  input: { userId: string; plan: AudioProductionPlan },
): Promise<AudioProductionPlan> {
  const rows: Record<string, unknown>[] = [
    ...input.plan.voiceTracks.map((track) => ({
      id: track.id,
      user_id: input.userId,
      project_id: track.projectId,
      audio_plan_id: track.audioPlanId,
      kind: "voice",
      metadata: {
        speaker: track.speaker,
        language: track.language,
        tone: track.tone,
        script: track.script,
        startSec: track.startSec,
        durationSec: track.durationSec,
        provider: track.provider,
      },
      artifact_id: track.artifactId ?? null,
      status: track.status,
    })),
    ...input.plan.musicTracks.map((track) => ({
      id: track.id,
      user_id: input.userId,
      project_id: track.projectId,
      audio_plan_id: track.audioPlanId,
      kind: "music",
      metadata: {
        mood: track.mood,
        durationSec: track.durationSec,
        style: track.style,
        provider: track.provider,
      },
      artifact_id: track.artifactId ?? null,
      status: track.status,
    })),
    ...input.plan.sfxTracks.map((track) => ({
      id: track.id,
      user_id: input.userId,
      project_id: track.projectId,
      audio_plan_id: track.audioPlanId,
      kind: "sfx",
      metadata: {
        cue: track.cue,
        timestampSec: track.timestampSec,
        durationSec: track.durationSec,
        intensity: track.intensity,
      },
      artifact_id: track.artifactId ?? null,
      status: track.status,
    })),
  ];
  if (!rows.length) return input.plan;
  const existing = await supabase
    .from("video_audio_tracks")
    .select("id")
    .eq("audio_plan_id", input.plan.id);
  if ((existing.data || []).length) return input.plan;
  const { error } = await supabase.from("video_audio_tracks").insert(rows).select("*");
  throwIfError(error, "video_audio_tracks.insert");
  return input.plan;
}

export async function updateAudioTrack(
  supabase: AnySupabase,
  input: { id: string; status?: AudioJobStatus; artifactId?: string | null },
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (input.artifactId !== undefined) patch.artifact_id = input.artifactId;
  const { error } = await supabase.from("video_audio_tracks").update(patch).eq("id", input.id);
  throwIfError(error, "video_audio_tracks.update");
}

export async function insertAudioJob(
  supabase: AnySupabase,
  input: {
    userId: string;
    projectId: string;
    audioPlanId?: string | null;
    trackId?: string | null;
    kind: AudioJobKind;
    provider: string;
    status?: AudioJobStatus;
    attempt?: number;
    idempotencyKey: string;
    estimatedCost?: number | null;
  },
): Promise<AudioJobRecord> {
  const { data, error } = await supabase
    .from("video_audio_jobs")
    .insert({
      id: randomUUID(),
      user_id: input.userId,
      project_id: input.projectId,
      audio_plan_id: input.audioPlanId ?? null,
      track_id: input.trackId ?? null,
      kind: input.kind,
      provider: input.provider,
      status: input.status || "queued",
      attempt: input.attempt ?? 1,
      idempotency_key: input.idempotencyKey,
      estimated_cost: input.estimatedCost ?? null,
    })
    .select("*")
    .single();
  throwIfError(error, "video_audio_jobs.insert");
  return jobFromRow(data as AudioJobRow);
}

export async function findAudioJobByIdempotencyKey(
  supabase: AnySupabase,
  idempotencyKey: string,
): Promise<AudioJobRecord | null> {
  const { data, error } = await supabase
    .from("video_audio_jobs")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  throwIfError(error, "video_audio_jobs.read");
  return data ? jobFromRow(data as AudioJobRow) : null;
}

export async function updateAudioJob(
  supabase: AnySupabase,
  input: {
    id: string;
    status?: AudioJobStatus;
    attempt?: number;
    actualCost?: number | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    artifactId?: string | null;
    completedAt?: string | null;
  },
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.status) patch.status = input.status;
  if (input.attempt != null) patch.attempt = input.attempt;
  if (input.actualCost !== undefined) patch.actual_cost = input.actualCost;
  if (input.errorCode !== undefined) patch.error_code = input.errorCode;
  if (input.errorMessage !== undefined) patch.error_message = input.errorMessage;
  if (input.artifactId !== undefined) patch.artifact_id = input.artifactId;
  if (input.completedAt !== undefined) patch.completed_at = input.completedAt;
  const { error } = await supabase.from("video_audio_jobs").update(patch).eq("id", input.id);
  throwIfError(error, "video_audio_jobs.update");
}

export async function listAudioJobsForProject(supabase: AnySupabase, projectId: string): Promise<AudioJobRecord[]> {
  const { data, error } = await supabase.from("video_audio_jobs").select("*").eq("project_id", projectId);
  throwIfError(error, "video_audio_jobs.list");
  return ((data || []) as AudioJobRow[]).map(jobFromRow);
}

export async function persistAudioArtifact(
  supabase: AnySupabase,
  input: {
    userId: string;
    projectId: string;
    kind: AudioArtifact["kind"];
    bytes: Uint8Array;
    mimeType?: string;
    durationSec: number;
    provider: string;
  },
): Promise<AudioArtifact> {
  const mimeType = assertValidAudioBytes({
    bytes: input.bytes,
    declaredMime: input.mimeType,
    durationSec: input.durationSec,
  });
  const id = randomUUID();
  const ext = mimeType === "audio/mpeg" ? "mp3" : mimeType === "audio/ogg" ? "ogg" : "wav";
  const storagePath = `${input.userId}/${input.projectId}/audio/${id}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(VIDEO_STUDIO_BUCKET).upload(storagePath, input.bytes, {
    contentType: mimeType,
    upsert: false,
  });
  if (uploadError) {
    throw new AudioEngineError(`Audio storage upload failed: ${uploadError.message || "unknown"}`, "provider_failed");
  }
  const signed = await supabase.storage.from(VIDEO_STUDIO_BUCKET).createSignedUrl(storagePath, 60 * 60);
  const url = signed.data?.signedUrl || `storage://${storagePath}`;
  const sha256 = sha256Hex(input.bytes);
  const { data, error } = await supabase
    .from("video_media")
    .insert({
      id,
      user_id: input.userId,
      generation_id: input.projectId,
      kind: input.kind,
      mime_type: mimeType,
      storage_path: storagePath,
      public_url: url,
      size_bytes: input.bytes.byteLength,
      duration_sec: input.durationSec,
      provider: input.provider,
      sha256,
      meta: { audioKind: input.kind },
    })
    .select("*")
    .single();
  throwIfError(error, "video_media.insert");
  const artifact = artifactFromMediaRow(data as AudioMediaRow);
  artifact.bytes = input.bytes;
  if (!isValidAudioArtifact(artifact)) {
    throw new AudioEngineError("Persisted audio artifact failed validation.", "invalid_audio");
  }
  return artifact;
}

export async function loadAudioArtifact(
  supabase: AnySupabase,
  input: { userId: string; artifactId: string },
): Promise<AudioArtifact | null> {
  const { data, error } = await supabase.from("video_media").select("*").eq("id", input.artifactId).maybeSingle();
  throwIfError(error, "video_media.read");
  if (!data) return null;
  const row = data as AudioMediaRow;
  assertAudioOwnership({ ownerId: row.user_id, userId: input.userId });
  const artifact = artifactFromMediaRow(row);
  return isValidAudioArtifact(artifact) ? artifact : null;
}

export async function signAudioArtifactUrl(
  supabase: AnySupabase,
  input: { userId: string; artifactId: string; expiresInSec?: number },
): Promise<string> {
  const { data, error } = await supabase.from("video_media").select("*").eq("id", input.artifactId).maybeSingle();
  throwIfError(error, "video_media.read");
  if (!data) throw new AudioEngineError("Audio artifact not found.", "not_found");
  const row = data as AudioMediaRow;
  assertAudioOwnership({ ownerId: row.user_id, userId: input.userId });
  const signed = await supabase.storage
    .from(VIDEO_STUDIO_BUCKET)
    .createSignedUrl(row.storage_path, input.expiresInSec ?? 3600);
  const url = signed.data?.signedUrl || row.public_url;
  if (!url) throw new AudioEngineError("Signed audio URL could not be created.", "not_found");
  return url;
}

export function mixJobFromRecord(
  job: AudioJobRecord,
  settings: Omit<AudioMixJob, "id" | "projectId" | "audioPlanId" | "status" | "artifactId" | "idempotencyKey" | "attempt" | "estimatedCost" | "actualCost">,
): AudioMixJob {
  return {
    id: job.id,
    projectId: job.projectId,
    audioPlanId: job.audioPlanId || "",
    status: job.status,
    voiceLevel: settings.voiceLevel,
    musicLevel: settings.musicLevel,
    sfxLevel: settings.sfxLevel,
    ducking: settings.ducking,
    normalize: settings.normalize,
    fadeInSec: settings.fadeInSec,
    fadeOutSec: settings.fadeOutSec,
    targetDurationSec: settings.targetDurationSec,
    artifactId: job.artifactId,
    idempotencyKey: job.idempotencyKey,
    attempt: job.attempt,
    estimatedCost: job.estimatedCost,
    actualCost: job.actualCost,
  };
}

export function applyArtifactToVoice(track: VoiceTrack, artifact: AudioArtifact): VoiceTrack {
  return { ...track, artifactId: artifact.id, provider: artifact.provider as VoiceTrack["provider"], status: "succeeded" };
}

export function applyArtifactToMusic(track: MusicTrack, artifact: AudioArtifact): MusicTrack {
  return { ...track, artifactId: artifact.id, provider: artifact.provider, status: "succeeded" };
}

export function applyArtifactToSfx(track: SFXTrack, artifact: AudioArtifact): SFXTrack {
  return { ...track, artifactId: artifact.id, status: "succeeded" };
}
