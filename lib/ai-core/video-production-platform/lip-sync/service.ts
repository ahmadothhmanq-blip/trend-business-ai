import { nowIso } from "@/lib/ai-core/video-production-platform/ids";
import type { VideoArtifact } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { assertValidVideoArtifact, isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { ingestProviderArtifact } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import { probeMediaBytes } from "@/lib/ai-core/video-production-platform/assemble";
import { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";
import type { LipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/contract";
import { buildLipSyncIdempotencyKey } from "@/lib/ai-core/video-production-platform/lip-sync/job-cache";
import { resolveLipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/registry";
import {
  findLipSyncJobByIdempotencyKey,
  insertLipSyncJob,
  loadOwnedMedia,
  signMediaHttpsUrl,
  updateLipSyncJob,
  type LipSyncJobRecord,
  type LipSyncMediaRow,
} from "@/lib/ai-core/video-production-platform/lip-sync/persist";
import { PLAYABLE_AUDIO_MIME_TYPES } from "@/lib/ai-core/video-production-platform/domain/audio";
import {
  applyVideoStudioCreditOutcome,
  honestProviderJobCost,
  lipSyncCreditOutcome,
  videoStudioCreditOperationId,
} from "@/lib/ai-core/video-production-platform/runtime/video-credits";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MAX_POLLS = 24;
const POLL_DELAY_MS = 1500;

export type RunLipSyncInput = {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  sourceArtifactId: string;
  audioArtifactId: string;
  speaker?: string;
  language?: string;
  provider?: string;
  startSec?: number | null;
  endSec?: number | null;
  attempt?: number;
  lipSync?: LipSyncProvider;
  pollDelayMs?: number;
  maxPolls?: number;
};

export type RunLipSyncResult = {
  job: LipSyncJobRecord;
  sourceArtifact: VideoArtifact;
  resultArtifact: VideoArtifact | null;
  reused: boolean;
  estimatedCost: number;
  actualCost: number | null;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function settleCost(input: { reused: boolean; succeeded: boolean; estimated: number; storedActual?: number | null }): number | null {
  if (input.reused) return input.storedActual ?? null;
  return honestProviderJobCost({
    reused: false,
    succeeded: input.succeeded,
    estimated: input.estimated,
    providerActual: input.storedActual,
  }).actualCost;
}

function isAudioMime(mime: string): boolean {
  const normalized = mime.split(";")[0].trim().toLowerCase();
  return (PLAYABLE_AUDIO_MIME_TYPES as readonly string[]).includes(normalized) || normalized.startsWith("audio/");
}

function videoFromMedia(row: LipSyncMediaRow): VideoArtifact {
  return {
    id: row.id,
    projectId: row.projectId,
    kind: row.kind === "composite" ? "composite" : "scene_clip",
    mimeType: row.mimeType,
    url: row.url,
    durationSec: row.durationSec,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    provider: row.provider,
    isStub: row.provider === "preview" || row.provider === "preview-stub",
  };
}

async function reuseOrInsertJob(
  supabase: AnySupabase,
  input: Parameters<typeof insertLipSyncJob>[1],
): Promise<{ job: LipSyncJobRecord; reused: boolean }> {
  const existing = await findLipSyncJobByIdempotencyKey(supabase, input.idempotencyKey);
  if (existing) return { job: existing, reused: true };
  try {
    const job = await insertLipSyncJob(supabase, input);
    return { job, reused: false };
  } catch (error) {
    if (error instanceof LipSyncError && error.code === "idempotency") {
      const raced = await findLipSyncJobByIdempotencyKey(supabase, input.idempotencyKey);
      if (raced) return { job: raced, reused: true };
    }
    throw error;
  }
}

async function pollUntilSettled(
  provider: LipSyncProvider,
  handle: Awaited<ReturnType<LipSyncProvider["createJob"]>>,
  input: { pollDelayMs: number; maxPolls: number },
) {
  let current = handle;
  if (current.status !== "processing" && current.status !== "queued") return current;
  if (!current.externalJobId) {
    return { ...current, status: "failed" as const, message: "Lip-sync job is processing without an external id.", errorCode: "provider_failed" };
  }
  for (let i = 0; i < input.maxPolls; i++) {
    await sleep(input.pollDelayMs);
    current = await provider.pollJob(current.externalJobId!, current.idempotencyKey);
    if (current.status !== "processing" && current.status !== "queued") return current;
  }
  return {
    ...current,
    status: "failed" as const,
    message: "Lip-sync job did not complete before the poll limit.",
    errorCode: "provider_failed",
  };
}

export async function runLipSync(input: RunLipSyncInput): Promise<RunLipSyncResult> {
  const sourceRow = await loadOwnedMedia(input.supabase, {
    userId: input.userId,
    artifactId: input.sourceArtifactId,
  });
  const audioRow = await loadOwnedMedia(input.supabase, {
    userId: input.userId,
    artifactId: input.audioArtifactId,
  });
  if (sourceRow.projectId && sourceRow.projectId !== input.projectId) {
    throw new LipSyncError("Video artifact does not belong to this project.", "ownership");
  }
  if (audioRow.projectId && audioRow.projectId !== input.projectId) {
    throw new LipSyncError("Audio artifact does not belong to this project.", "ownership");
  }

  const sourceArtifact = videoFromMedia(sourceRow);
  if (!isValidVideoArtifact(sourceArtifact) || isAudioMime(sourceRow.mimeType)) {
    throw new LipSyncError("Lip-sync requires a playable video artifact.", "invalid_artifact");
  }
  if (!isAudioMime(audioRow.mimeType) || !(audioRow.durationSec > 0)) {
    throw new LipSyncError("Lip-sync requires a playable voice/audio artifact.", "invalid_artifact");
  }

  let provider: LipSyncProvider;
  try {
    provider = input.lipSync ?? resolveLipSyncProvider(input.provider);
  } catch (error) {
    const failed = await insertLipSyncJob(input.supabase, {
      userId: input.userId,
      projectId: input.projectId,
      sourceArtifactId: sourceRow.id,
      audioArtifactId: audioRow.id,
      provider: input.provider || "heygen",
      status: "failed",
      attempt: input.attempt ?? 1,
      idempotencyKey: buildLipSyncIdempotencyKey({
        projectId: input.projectId,
        videoArtifactId: sourceRow.id,
        audioArtifactId: audioRow.id,
        provider: "heygen",
        attempt: input.attempt,
      }),
      estimatedCost: 0,
      speaker: input.speaker,
      language: input.language,
      startSec: input.startSec,
      endSec: input.endSec,
    }).catch(() => null);
    if (failed) {
      await updateLipSyncJob(input.supabase, {
        id: failed.id,
        status: "failed",
        actualCost: 0,
        errorCode: "unconfigured",
        errorMessage: error instanceof Error ? error.message : "Lip-sync unconfigured",
        completedAt: nowIso(),
      });
    }
    throw error;
  }

  const estimated = provider.estimateCost({ durationSec: sourceArtifact.durationSec }).credits;
  const idempotencyKey = buildLipSyncIdempotencyKey({
    projectId: input.projectId,
    videoArtifactId: sourceRow.id,
    audioArtifactId: audioRow.id,
    provider: provider.id,
    attempt: input.attempt,
  });

  const { job, reused } = await reuseOrInsertJob(input.supabase, {
    userId: input.userId,
    projectId: input.projectId,
    sourceArtifactId: sourceRow.id,
    audioArtifactId: audioRow.id,
    provider: provider.id,
    idempotencyKey,
    estimatedCost: estimated,
    speaker: input.speaker,
    language: input.language,
    startSec: input.startSec,
    endSec: input.endSec,
    attempt: input.attempt,
    status: "queued",
  });
  const creditOperationId = videoStudioCreditOperationId({
    kind: "lipsync",
    projectId: input.projectId,
    jobKey: idempotencyKey,
    attempt: input.attempt,
  });

  if (reused && job.status === "succeeded" && job.resultArtifactId) {
    const resultRow = await loadOwnedMedia(input.supabase, {
      userId: input.userId,
      artifactId: job.resultArtifactId,
    });
    const resultArtifact = videoFromMedia(resultRow);
    assertValidVideoArtifact(resultArtifact);
    await applyVideoStudioCreditOutcome({
      supabase: input.supabase,
      userId: input.userId,
      operationId: creditOperationId,
      outcome: lipSyncCreditOutcome({ reused: true, succeeded: true }),
    });
    return {
      job,
      sourceArtifact,
      resultArtifact,
      reused: true,
      estimatedCost: job.estimatedCost ?? estimated,
      actualCost: settleCost({
        reused: true,
        succeeded: true,
        estimated,
        storedActual: job.actualCost,
      }),
    };
  }

  if (reused && job.status === "failed") {
    throw new LipSyncError(job.errorMessage || "Lip-sync already failed for this idempotency key.", "provider_failed");
  }

  const videoUrl = await signMediaHttpsUrl(input.supabase, sourceRow);
  const audioUrl = await signMediaHttpsUrl(input.supabase, audioRow);

  await updateLipSyncJob(input.supabase, {
    id: job.id,
    status: "processing",
    startedAt: nowIso(),
  });

  let handle = await provider.createJob({
    projectId: input.projectId,
    videoUrl,
    audioUrl,
    speaker: input.speaker,
    language: input.language,
    startSec: input.startSec,
    endSec: input.endSec,
    idempotencyKey,
  });
  handle = await pollUntilSettled(provider, handle, {
    pollDelayMs: input.pollDelayMs ?? POLL_DELAY_MS,
    maxPolls: input.maxPolls ?? MAX_POLLS,
  });

  if (handle.status !== "succeeded" || (!handle.bytes?.byteLength && !handle.remoteUrl)) {
    await updateLipSyncJob(input.supabase, {
      id: job.id,
      status: "failed",
      actualCost: 0,
      errorCode: handle.errorCode || "provider_failed",
      errorMessage: handle.message,
      externalJobId: handle.externalJobId ?? null,
      completedAt: nowIso(),
    });
    await applyVideoStudioCreditOutcome({
      supabase: input.supabase,
      userId: input.userId,
      operationId: creditOperationId,
      outcome: "failed",
    });
    throw new LipSyncError(handle.message || "Lip-sync failed.", "provider_failed");
  }

  const declaredDuration =
    handle.durationSec && handle.durationSec > 0 ? handle.durationSec : sourceArtifact.durationSec;
  let resultArtifact: VideoArtifact;
  try {
    resultArtifact = await ingestProviderArtifact({
      supabase: input.supabase,
      userId: input.userId,
      projectId: input.projectId,
      sceneId: sourceRow.sceneId || input.projectId,
      handle: {
        provider: "heygen",
        status: "succeeded",
        idempotencyKey: handle.idempotencyKey,
        mimeType: handle.mimeType || "video/mp4",
        bytes: handle.bytes,
        remoteUrl: handle.remoteUrl,
        message: handle.message,
      },
      declaredDurationSec: declaredDuration,
      aspectRatio: "16:9",
      kind: sourceArtifact.kind,
    });
    assertValidVideoArtifact(resultArtifact);
  } catch (error) {
    await updateLipSyncJob(input.supabase, {
      id: job.id,
      status: "failed",
      actualCost: 0,
      errorCode: "invalid_artifact",
      errorMessage: error instanceof Error ? error.message : "Lip-sync output is not a playable video artifact.",
      externalJobId: handle.externalJobId ?? null,
      completedAt: nowIso(),
    });
    await applyVideoStudioCreditOutcome({
      supabase: input.supabase,
      userId: input.userId,
      operationId: creditOperationId,
      outcome: "failed",
    });
    throw new LipSyncError(
      error instanceof Error ? error.message : "Lip-sync output is not a playable video artifact.",
      "invalid_artifact",
    );
  }
  const probed = resultArtifact.bytes ? await probeMediaBytes(resultArtifact.bytes) : null;
  if (probed?.durationSec && probed.durationSec > 0) {
    resultArtifact.durationSec = probed.durationSec;
  }
  if (probed?.width) resultArtifact.width = probed.width;
  if (probed?.height) resultArtifact.height = probed.height;

  const actualCost = settleCost({ reused: false, succeeded: true, estimated });
  await updateLipSyncJob(input.supabase, {
    id: job.id,
    status: "succeeded",
    actualCost,
    resultArtifactId: resultArtifact.id,
    externalJobId: handle.externalJobId ?? null,
    errorCode: null,
    errorMessage: null,
    completedAt: nowIso(),
  });
  await applyVideoStudioCreditOutcome({
    supabase: input.supabase,
    userId: input.userId,
    operationId: creditOperationId,
    outcome: lipSyncCreditOutcome({ reused: false, succeeded: true }),
  });

  return {
    job: {
      ...job,
      status: "succeeded",
      actualCost,
      resultArtifactId: resultArtifact.id,
    },
    sourceArtifact,
    resultArtifact,
    reused: false,
    estimatedCost: estimated,
    actualCost,
  };
}
