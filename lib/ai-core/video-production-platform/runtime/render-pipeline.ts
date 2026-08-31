/**
 * Actual Video Studio render path (Phase 4).
 * Generate/Plan → Scene → Router v2 → ProviderJob → Artifact → QC → Render → video_rendered|failed
 */

import type {
  Scene,
  VideoArtifact,
  VideoProjectState,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import type {
  VideoMediaAsset,
  VideoProductionModel,
  VideoRenderClip,
  VideoRenderJob,
} from "@/lib/ai-core/video-production-platform/types";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import { persistTransition } from "@/lib/ai-core/video-production-platform/state-machine";
import {
  createProviderRegistry,
  persistRoutedProviderJob,
  createSupabaseProviderJobStore,
  type ProviderEnvSnapshot,
} from "@/lib/ai-core/video-production-platform/provider-router";
import type {
  ModelRouterInput,
  ProviderJobHandle,
  ProviderV2Id,
  RouterQuality,
  RouterTask,
  VideoProviderV2,
} from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
import {
  buildSceneProviderPrompt,
  buildSceneRouterInput,
} from "@/lib/ai-core/video-production-platform/provider-router/scene-to-provider";
import { ProviderNotConfiguredError } from "@/lib/ai-core/video-production-platform/providers";
import { videoStudioProductionRenderBlockReason } from "@/lib/ai-core/video-production-platform/env-config";
import {
  listProviderJobsForProject,
  loadDomainScenes,
  loadPlayableSceneArtifact,
  loadPlayableCompositeArtifact,
  updateProviderJob,
  updateSceneRecord,
  type ProviderJobRecord,
} from "@/lib/ai-core/video-production-platform/persistence";
import { createRenderJobFromModel } from "@/lib/ai-core/video-production-platform/render-engine";
import { runVideoQualityChecks } from "@/lib/ai-core/video-production-platform/quality";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import {
  audioArtifactToMediaAsset,
  isNarrationRequired,
  produceRenderAudio,
} from "@/lib/ai-core/video-production-platform/audio-engine/render-lane";
import type { ProduceAudioInput } from "@/lib/ai-core/video-production-platform/audio-engine/service";
import {
  combineQualityVerdicts,
  detectBlackFrames,
  inspectArtifactQuality,
  persistArtifactQualityReport,
} from "@/lib/ai-core/video-production-platform/quality-control";
import { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";
import { runLipSync } from "@/lib/ai-core/video-production-platform/lip-sync/service";
import type { LipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/contract";
import {
  applyJobToModel,
  assembleAndUpload,
} from "@/lib/ai-core/video-production-platform/generation-pipeline";
import { assembleComposite } from "@/lib/ai-core/video-production-platform/assemble";
import { isFfmpegAssemblyMethod } from "@/lib/ai-core/video-production-platform/media-validation";
import { ArtifactIngestError, ingestProviderArtifact } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import {
  currentDomainState,
  loadGenerationDomainRow,
  seedDomainProject,
  type GenerationDomainRow,
} from "@/lib/ai-core/video-production-platform/runtime/seed";
import { nextPollAt } from "@/lib/ai-core/video-production-platform/runtime/timeouts";
import {
  applyVideoStudioCreditOutcome,
  honestProviderJobCost,
  renderCreditOutcome,
  videoStudioCreditOperationId,
} from "@/lib/ai-core/video-production-platform/runtime/video-credits";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MAX_INLINE_POLLS = 0;
const POLL_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type DomainRenderMode = "full" | "avatar" | "image-to-video" | "batch-item";

export type DomainRenderResult = {
  model: VideoProductionModel;
  job: VideoRenderJob;
  domainState: VideoProjectState;
  planId: string | null;
  sceneIds: string[];
  providerJobs: ProviderJobRecord[];
  artifact: VideoArtifact | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
};

function taskForMode(mode: DomainRenderMode, useAvatar?: boolean): RouterTask {
  if (useAvatar || mode === "avatar") return "avatar";
  if (mode === "image-to-video") return "image-to-video";
  return "text-to-video";
}

function qualityForMode(mode: DomainRenderMode): RouterQuality {
  return mode === "batch-item" ? "draft" : "standard";
}

function modelSceneFor(model: VideoProductionModel, domainScene: Scene) {
  const legacyUri = domainScene.references.find((ref) => ref.role === "legacy-scene-id")?.uri || "";
  const legacyId = legacyUri.replace(/^blueprint:/, "");
  return (
    model.scenes.find((scene) => scene.id === legacyId) ||
    model.scenes[domainScene.order] ||
    model.scenes.find((scene) => scene.id === domainScene.id)
  );
}

async function persistLegacyJob(
  supabase: AnySupabase,
  userId: string,
  generationId: string,
  job: VideoRenderJob,
) {
  try {
    await supabase.from("video_render_jobs").upsert({
      id: job.id,
      user_id: userId,
      generation_id: generationId,
      status: job.status,
      provider: job.provider,
      mode: job.mode,
      progress: job.progress,
      payload: job,
      updated_at: nowIso(),
    });
  } catch {
    /* optional table */
  }
}

async function failProject(
  supabase: AnySupabase,
  input: {
    projectId: string;
    from: VideoProjectState;
    errorCode: string;
    errorMessage: string;
  },
): Promise<VideoProjectState> {
  if (input.from === "failed") return "failed";
  await persistTransition(supabase, {
    projectId: input.projectId,
    from: input.from,
    to: "failed",
  });
  return "failed";
}

async function restorePreservedRender(
  supabase: AnySupabase,
  input: { projectId: string; from: VideoProjectState; artifact: VideoArtifact },
): Promise<VideoProjectState> {
  const walk: VideoProjectState[] = ["processing", "quality_check", "assembling", "video_rendered"];
  const start = walk.indexOf(input.from);
  let from = input.from;
  const remaining = start >= 0 ? walk.slice(start + 1) : from === "generating" ? walk : [];
  if (from === "failed") {
    await persistTransition(supabase, { projectId: input.projectId, from: "failed", to: "generating" });
    from = "generating";
    for (const to of walk) {
      await persistTransition(supabase, {
        projectId: input.projectId,
        from,
        to,
        artifact: to === "video_rendered" ? input.artifact : undefined,
      });
      from = to;
    }
    return "video_rendered";
  }
  if (from === "generating" || remaining.length) {
    const steps = from === "generating" ? walk : remaining;
    for (const to of steps) {
      await persistTransition(supabase, {
        projectId: input.projectId,
        from,
        to,
        artifact: to === "video_rendered" ? input.artifact : undefined,
      });
      from = to;
    }
  }
  return from;
}

async function failAudioLane(
  supabase: AnySupabase,
  input: {
    projectId: string;
    from: VideoProjectState;
    errorCode: string;
    errorMessage: string;
    preserved: VideoArtifact | null;
  },
): Promise<VideoProjectState> {
  if (input.preserved && isValidVideoArtifact(input.preserved)) {
    return restorePreservedRender(supabase, {
      projectId: input.projectId,
      from: input.from,
      artifact: input.preserved,
    });
  }
  return failProject(supabase, {
    projectId: input.projectId,
    from: input.from,
    errorCode: input.errorCode,
    errorMessage: input.errorMessage,
  });
}

async function pollHandle(
  provider: VideoProviderV2,
  handle: ProviderJobHandle,
): Promise<ProviderJobHandle> {
  if (handle.status !== "processing" && handle.status !== "queued" && handle.status !== "submitted") {
    return handle;
  }
  if (!handle.externalJobId) return handle;
  let current = handle;
  for (let i = 0; i < MAX_INLINE_POLLS; i++) {
    await sleep(POLL_DELAY_MS);
    current = await provider.pollJob(current.externalJobId!, current.idempotencyKey);
    if (current.status !== "processing" && current.status !== "queued" && current.status !== "submitted") {
      return current;
    }
  }
  return current;
}

function isReusableFfmpegComposite(artifact: VideoArtifact | null | undefined): artifact is VideoArtifact {
  return Boolean(artifact && artifact.kind === "composite" && isValidVideoArtifact(artifact));
}

function toNotConfigured(error: ProviderRouterError): ProviderNotConfiguredError {
  return new ProviderNotConfiguredError(
    error.code === "unconfigured" || error.code === "no_eligible_provider"
      ? `${error.message} Configure a production video provider (GEMINI_API_KEY/VEO_API_KEY or RUNWAY_API_KEY).`
      : error.message,
  );
}

export async function runDomainRenderPipeline(params: {
  model: VideoProductionModel;
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  mode?: DomainRenderMode;
  providerId?: string;
  sourceImageUrl?: string | null;
  useAvatar?: boolean;
  retry?: boolean;
  resume?: boolean;
  snapshot?: ProviderEnvSnapshot;
  registry?: Record<ProviderV2Id, VideoProviderV2>;
  /** Test/legacy opt-out: skip the audio lane and treat narration as optional. */
  skipAudio?: boolean;
  tts?: ProduceAudioInput["tts"];
  mixFn?: ProduceAudioInput["mixFn"];
  musicBytes?: Uint8Array | null;
  lipSync?: boolean;
  lipSyncProvider?: LipSyncProvider;
  skipCredits?: boolean;
  creditAttempt?: number;
  assemble?: typeof assembleComposite;
}): Promise<DomainRenderResult> {
  const creditAttempt = params.creditAttempt ?? (params.retry ? 2 : 1);
  const operationId = videoStudioCreditOperationId({
    kind: "render",
    projectId: params.generationId,
    attempt: creditAttempt,
  });
  try {
    const result = await executeDomainRenderPipeline(params);
    if (!params.skipCredits) {
      await applyVideoStudioCreditOutcome({
        supabase: params.supabase,
        userId: params.userId,
        operationId,
        outcome: renderCreditOutcome(result),
      });
    }
    return result;
  } catch (error) {
    if (!params.skipCredits) {
      await applyVideoStudioCreditOutcome({
        supabase: params.supabase,
        userId: params.userId,
        operationId,
        outcome: "failed",
      });
    }
    throw error;
  }
}

async function executeDomainRenderPipeline(params: Parameters<typeof runDomainRenderPipeline>[0]): Promise<DomainRenderResult> {
  const productionBlock = videoStudioProductionRenderBlockReason();
  if (productionBlock) {
    throw new ProviderNotConfiguredError(productionBlock);
  }

  const mode: DomainRenderMode =
    params.useAvatar || params.mode === "avatar"
      ? "avatar"
      : params.mode === "image-to-video"
        ? "image-to-video"
        : params.mode === "batch-item"
          ? "batch-item"
          : "full";

  const generation = await loadGenerationDomainRow(params.supabase, params.generationId, params.userId);
  if (!generation) {
    throw new DomainValidationError("Video project not found.");
  }

  const seeded = await seedDomainProject(params.supabase, { userId: params.userId, generation });
  if (seeded.skippedReason === "domain_tables_missing") {
    throw new DomainValidationError("Video domain tables are missing. Apply migration 090.");
  }
  if (!seeded.sceneIds.length && seeded.skippedReason === "no_scenes") {
    throw new DomainValidationError("Video project has no scenes to render.");
  }

  const refreshed =
    (await loadGenerationDomainRow(params.supabase, params.generationId, params.userId)) || generation;
  let state = currentDomainState(refreshed);
  const scenes = await loadDomainScenes(params.supabase, params.generationId);
  const existingJobs = await listProviderJobsForProject(params.supabase, params.generationId);
  const retryCount = Math.max(1, ...existingJobs.map((job) => job.attempt), params.retry ? 2 : 1);
  const store = createSupabaseProviderJobStore(params.supabase);
  const registry = params.registry || createProviderRegistry(params.snapshot);

  const finish = (
    model: VideoProductionModel,
    job: VideoRenderJob,
    extra: Partial<DomainRenderResult> = {},
  ): DomainRenderResult => ({
    model,
    job,
    domainState: state,
    planId: seeded.planId,
    sceneIds: scenes.map((scene) => scene.id),
    providerJobs: existingJobs,
    artifact: null,
    errorCode: null,
    errorMessage: null,
    retryCount,
    ...extra,
  });

  try {
    if (
      state === "storyboard_ready" ||
      state === "failed" ||
      state === "video_rendered" ||
      state === "published"
    ) {
      await persistTransition(params.supabase, {
        projectId: params.generationId,
        from: state,
        to: "generating",
      });
      state = "generating";
    } else if (state === "draft" || state === "planning") {
      const again = await seedDomainProject(params.supabase, {
        userId: params.userId,
        generation: refreshed,
      });
      await persistTransition(params.supabase, {
        projectId: params.generationId,
        from: again.state,
        to: "generating",
      });
      state = "generating";
    }

    const assets: VideoMediaAsset[] = [...params.model.assets];
    let job = createRenderJobFromModel(params.model, mode);
    job = {
      ...job,
      mode,
      status: "processing",
      progress: 5,
      message: "Routing scenes through Provider Router v2…",
      costCreditsEstimate: 0,
      costCreditsSpent: 0,
      attemptCount: retryCount,
      updatedAt: nowIso(),
    };

    let audioAsset: VideoMediaAsset | undefined;
    const audioRequired = !params.skipAudio && mode !== "batch-item" && isNarrationRequired(params.model, scenes);
    const preservedComposite = await loadPlayableCompositeArtifact(params.supabase, params.generationId);

    const clips: VideoRenderClip[] = [];
    const producedArtifacts: VideoArtifact[] = [];
    let estimatedTotal = 0;
    let spentTotal = 0;
    let lastProvider: ProviderV2Id | string = "kling";

    for (const [index, domainScene] of scenes.entries()) {
      const modelScene = modelSceneFor(params.model, domainScene);
      const prompt = buildSceneProviderPrompt(domainScene);
      const durationSec = domainScene.duration || modelScene?.durationSec || 5;
      const baseClip: VideoRenderClip = {
        id: vid("clip", domainScene.id, index),
        sceneId: modelScene?.id || domainScene.id,
        status: "processing",
        progress: 20,
        visualPrompt: prompt,
        updatedAt: nowIso(),
      };

      const existingArtifact = await loadPlayableSceneArtifact(
        params.supabase,
        params.generationId,
        domainScene.id,
      );
      if (existingArtifact && isValidVideoArtifact(existingArtifact)) {
        producedArtifacts.push(existingArtifact);
        clips.push({
          ...baseClip,
          status: "completed",
          progress: 100,
          asset: {
            id: existingArtifact.id,
            kind: "clip",
            mimeType: existingArtifact.mimeType,
            url: existingArtifact.url,
            durationSec: existingArtifact.durationSec,
            width: existingArtifact.width,
            height: existingArtifact.height,
            provider: existingArtifact.provider,
            createdAt: nowIso(),
          },
        });
        continue;
      }

      const routeInput: ModelRouterInput = buildSceneRouterInput(domainScene, {
        projectId: params.generationId,
        aspectRatio: params.model.aspectRatio,
        mode,
        quality: qualityForMode(mode),
        sourceImageUrl: params.sourceImageUrl,
        productImageUrl: params.model.productImageUrl,
        useAvatar: params.useAvatar,
        language: params.model.language,
        idempotencySalt: params.retry ? `retry:${retryCount}` : undefined,
      });
      if (params.providerId && params.providerId !== "auto") {
        routeInput.preferredProvider = params.providerId as ModelRouterInput["preferredProvider"];
      }

      let routed = await persistRoutedProviderJob({
        userId: params.userId,
        routeInput,
        store,
        snapshot: params.snapshot,
        registry: params.registry,
      });

      if (routed.reused && routed.job.status === "failed") {
        routed = await persistRoutedProviderJob({
          userId: params.userId,
          routeInput: { ...routeInput, idempotencySalt: `retry:${routed.job.attempt + 1}` },
          store,
          snapshot: params.snapshot,
          registry: params.registry,
        });
      }

      estimatedTotal += routed.route.estimatedCost;
      lastProvider = routed.route.primaryProvider;
      const provider = registry[routed.route.primaryProvider];

      if (state === "generating") {
        await persistTransition(params.supabase, {
          projectId: params.generationId,
          from: "generating",
          to: "processing",
        });
        state = "processing";
      }

      await updateSceneRecord(params.supabase, { id: domainScene.id, status: "generating" });

      if (routed.reused && routed.job.status === "succeeded") {
        const kept = await loadPlayableSceneArtifact(params.supabase, params.generationId, domainScene.id);
        if (kept && isValidVideoArtifact(kept)) {
          producedArtifacts.push(kept);
          clips.push({
            ...baseClip,
            status: "completed",
            progress: 100,
            asset: {
              id: kept.id,
              kind: "clip",
              mimeType: kept.mimeType,
              url: kept.url,
              durationSec: kept.durationSec,
              provider: kept.provider,
              createdAt: nowIso(),
            },
          });
          continue;
        }
      }

      await updateProviderJob(params.supabase, {
        id: routed.job.id,
        status: "submitted",
        submittedAt: nowIso(),
        startedAt: nowIso(),
        nextPollAt: nextPollAt(),
      });

      let handle: ProviderJobHandle;
      const reusedInFlight =
        routed.reused &&
        (routed.job.status === "processing" || routed.job.status === "submitted" || routed.job.status === "queued") &&
        Boolean(routed.job.externalJobId);
      try {
        if (reusedInFlight) {
          handle = await provider.pollJob(routed.job.externalJobId!, routed.job.idempotencyKey);
        } else {
          handle = await provider.createJob({
            projectId: params.generationId,
            sceneId: domainScene.id,
            prompt: routeInput.prompt,
            promptHash: routed.route.metadata.idempotencyPromptHash,
            durationSec,
            aspectRatio: params.model.aspectRatio,
            imageUrl:
              params.sourceImageUrl ||
              params.model.productImageUrl ||
              domainScene.references.find((ref) => ref.uri?.startsWith("http"))?.uri ||
              null,
            avatar:
              mode === "avatar" || params.useAvatar
                ? {
                    personaId: params.model.presenter?.personaId,
                    script: modelScene?.script || prompt,
                  }
                : undefined,
            idempotencyKey: routed.job.idempotencyKey,
          });
        }
      } catch (error) {
        if (error instanceof ProviderRouterError) {
          await updateProviderJob(params.supabase, {
            id: routed.job.id,
            status: "failed",
            errorCode: error.code,
            errorMessage: error.message,
            actualCost: 0,
            completedAt: nowIso(),
          });
          throw error;
        }
        throw error;
      }

      handle = await pollHandle(provider, handle);
      const jobStatus =
        handle.status === "succeeded"
          ? "succeeded"
          : handle.status === "processing" || handle.status === "queued" || handle.status === "submitted"
            ? "processing"
            : "failed";

      if (jobStatus !== "succeeded") {
        await updateProviderJob(params.supabase, {
          id: routed.job.id,
          status: jobStatus,
          externalJobId: handle.externalJobId ?? null,
          errorCode: handle.errorCode || (jobStatus === "failed" ? "provider_failed" : null),
          errorMessage: handle.message,
          actualCost: jobStatus === "failed" && !routed.reused ? 0 : undefined,
          completedAt: jobStatus === "failed" ? nowIso() : null,
          nextPollAt: jobStatus === "processing" ? nextPollAt() : null,
          startedAt: jobStatus === "processing" ? nowIso() : undefined,
        });
        clips.push({
          ...baseClip,
          status: jobStatus === "processing" ? "processing" : "failed",
          progress: jobStatus === "processing" ? 50 : 100,
          externalJobId: handle.externalJobId,
          error: jobStatus === "failed" ? handle.message : undefined,
        });
        await updateSceneRecord(params.supabase, {
          id: domainScene.id,
          status: jobStatus === "processing" ? "processing" : "failed",
        });
        continue;
      }

      try {
        const artifact = await ingestProviderArtifact({
          supabase: params.supabase,
          userId: params.userId,
          projectId: params.generationId,
          sceneId: domainScene.id,
          handle,
          declaredDurationSec: durationSec,
          aspectRatio: params.model.aspectRatio,
          kind: "scene_clip",
        });
        producedArtifacts.push(artifact);
        const clipCost = honestProviderJobCost({
          succeeded: true,
          reused: routed.reused,
          estimated: routed.route.estimatedCost,
        });
        if (typeof clipCost.actualCost === "number" && clipCost.actualCost > 0) {
          spentTotal += clipCost.actualCost;
        }
        await updateProviderJob(params.supabase, {
          id: routed.job.id,
          status: "succeeded",
          externalJobId: handle.externalJobId ?? null,
          actualCost: clipCost.actualCost,
          errorCode: null,
          errorMessage: null,
          completedAt: nowIso(),
        });
        await updateSceneRecord(params.supabase, {
          id: domainScene.id,
          status: "ready",
          artifactId: artifact.id,
        });
        const clipAsset: VideoMediaAsset = {
          id: artifact.id,
          kind: "clip",
          mimeType: artifact.mimeType,
          url: artifact.url,
          durationSec: artifact.durationSec,
          width: artifact.width,
          height: artifact.height,
          provider: artifact.provider,
          createdAt: nowIso(),
        };
        clips.push({
          ...baseClip,
          status: "completed",
          progress: 100,
          externalJobId: handle.externalJobId,
          asset: clipAsset,
        });
        assets.push(clipAsset);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Artifact ingest failed.";
        const code = error instanceof ArtifactIngestError ? error.errorCode : "invalid_artifact";
        await updateProviderJob(params.supabase, {
          id: routed.job.id,
          status: "failed",
          errorCode: code,
          errorMessage: message,
          actualCost: routed.reused ? undefined : 0,
          completedAt: nowIso(),
        });
        clips.push({ ...baseClip, status: "failed", progress: 100, error: message });
        await updateSceneRecord(params.supabase, { id: domainScene.id, status: "failed" });
      }
    }

    job = {
      ...job,
      clips,
      audioAsset,
      provider: String(lastProvider),
      costCreditsEstimate: estimatedTotal,
      costCreditsSpent: spentTotal,
      progress: Math.round(
        (clips.filter((clip) => clip.status === "completed").length / Math.max(1, clips.length)) * 100,
      ),
      updatedAt: nowIso(),
    };

    const processing = clips.filter((clip) => clip.status === "processing");
    const failed = clips.filter((clip) => clip.status === "failed");
    const completed = clips.filter((clip) => clip.status === "completed");

    if (state === "generating") {
      await persistTransition(params.supabase, {
        projectId: params.generationId,
        from: "generating",
        to: "processing",
      });
      state = "processing";
    }

    if (processing.length) {
      job = {
        ...job,
        status: "processing",
        message: `Waiting on ${processing.length} provider job(s).`,
      };
      await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
      const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
      return finish(applyJobToModel(params.model, job, assets, audioAsset), job, { providerJobs });
    }

    if (!completed.length) {
      const errorCode = "provider_failed";
      const errorMessage = failed[0]?.error || "All provider jobs failed.";
      state = await failProject(params.supabase, {
        projectId: params.generationId,
        from: state,
        errorCode,
        errorMessage,
      });
      job = { ...job, status: "failed", message: errorMessage, completedAt: nowIso() };
      await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
      const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
      return finish(applyJobToModel(params.model, job, assets, audioAsset), job, {
        providerJobs,
        errorCode,
        errorMessage,
      });
    }

    const wantsOptionalBeds =
      !params.skipAudio &&
      mode !== "batch-item" &&
      Boolean(params.musicBytes || params.model.audioBeds.some((bed) => bed.asset?.url));
    if (audioRequired || wantsOptionalBeds) {
      try {
        const produced = await produceRenderAudio({
          supabase: params.supabase,
          userId: params.userId,
          projectId: params.generationId,
          planId: seeded.planId,
          model: params.model,
          scenes,
          tts: params.tts,
          mixFn: params.mixFn,
          musicBytes: params.musicBytes,
        });
        if (produced.mixArtifact) {
          audioAsset = audioArtifactToMediaAsset(produced.mixArtifact);
          assets.push(audioAsset);
        } else if (produced.voiceArtifact) {
          audioAsset = audioArtifactToMediaAsset(produced.voiceArtifact);
          assets.push(audioAsset);
        }
        if (produced.estimatedCost) {
          job = {
            ...job,
            costCreditsEstimate: (job.costCreditsEstimate || 0) + produced.estimatedCost,
            costCreditsSpent: (job.costCreditsSpent || 0) + produced.actualCost,
          };
        }
        if (audioRequired && !audioAsset) {
          throw new AudioEngineError("Narration is required but no audio artifact was produced.", "provider_failed");
        }
      } catch (error) {
        const errorCode = error instanceof AudioEngineError ? error.code : "provider_failed";
        const errorMessage = error instanceof Error ? error.message : "Audio pipeline failed.";
        if (audioRequired) {
          const preserved = isReusableFfmpegComposite(preservedComposite) ? preservedComposite : null;
          state = await failAudioLane(params.supabase, {
            projectId: params.generationId,
            from: state,
            errorCode,
            errorMessage,
            preserved,
          });
          job = {
            ...job,
            status: preserved ? "completed" : "failed",
            message: errorMessage,
            completedAt: nowIso(),
          };
          await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
          const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
          return finish(applyJobToModel(params.model, job, assets, audioAsset), job, {
            providerJobs,
            artifact: preserved,
            errorCode,
            errorMessage,
          });
        }
      }
    }

    if (params.lipSync) {
      const source = producedArtifacts.find((artifact) => isValidVideoArtifact(artifact));
      const audioId = audioAsset?.id;
      if (!source || !audioId) {
        const errorCode = "invalid_artifact";
        const errorMessage = "Lip-sync requires a playable video artifact and a voice/audio artifact.";
        state = await failProject(params.supabase, {
          projectId: params.generationId,
          from: state,
          errorCode,
          errorMessage,
        });
        job = { ...job, status: "failed", message: errorMessage, completedAt: nowIso() };
        await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
        const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
        return finish(applyJobToModel(params.model, job, assets, audioAsset), job, {
          providerJobs,
          artifact: source || null,
          errorCode,
          errorMessage,
        });
      }
      try {
        const synced = await runLipSync({
          supabase: params.supabase,
          userId: params.userId,
          projectId: params.generationId,
          sourceArtifactId: source.id,
          audioArtifactId: audioId,
          language: params.model.language,
          lipSync: params.lipSyncProvider,
          pollDelayMs: 0,
          maxPolls: 4,
        });
        if (!synced.resultArtifact || !isValidVideoArtifact(synced.resultArtifact)) {
          throw new LipSyncError("Lip-sync did not return a playable video artifact.", "invalid_artifact");
        }
        producedArtifacts.push(synced.resultArtifact);
        const syncedAsset: VideoMediaAsset = {
          id: synced.resultArtifact.id,
          kind: synced.resultArtifact.kind === "composite" ? "composite" : "clip",
          mimeType: synced.resultArtifact.mimeType,
          url: synced.resultArtifact.url,
          durationSec: synced.resultArtifact.durationSec,
          width: synced.resultArtifact.width,
          height: synced.resultArtifact.height,
          provider: synced.resultArtifact.provider,
          createdAt: nowIso(),
        };
        assets.push(syncedAsset);
        const lastCompleted = [...clips].reverse().find((clip) => clip.status === "completed");
        if (lastCompleted) lastCompleted.asset = syncedAsset;
        job = {
          ...job,
          costCreditsEstimate: (job.costCreditsEstimate || 0) + synced.estimatedCost,
          costCreditsSpent: (job.costCreditsSpent || 0) + (synced.actualCost ?? 0),
        };
      } catch (error) {
        const errorCode = error instanceof LipSyncError ? error.code : "provider_failed";
        const errorMessage = error instanceof Error ? error.message : "Lip-sync failed.";
        state = await failProject(params.supabase, {
          projectId: params.generationId,
          from: state,
          errorCode,
          errorMessage,
        });
        job = { ...job, status: "failed", message: errorMessage, completedAt: nowIso() };
        await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
        const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
        return finish(applyJobToModel(params.model, job, assets, audioAsset), job, {
          providerJobs,
          artifact: source,
          errorCode,
          errorMessage,
        });
      }
    }

    if (state === "processing") {
      await persistTransition(params.supabase, {
        projectId: params.generationId,
        from: "processing",
        to: "quality_check",
      });
      state = "quality_check";
    }

    const qcVideo =
      producedArtifacts.find((artifact) => isValidVideoArtifact(artifact)) ||
      (completed[0]?.asset
        ? {
            id: completed[0].asset.id,
            projectId: params.generationId,
            kind: "scene_clip" as const,
            mimeType: completed[0].asset.mimeType,
            url: completed[0].asset.url,
            durationSec: completed[0].asset.durationSec || 0,
            width: completed[0].asset.width,
            height: completed[0].asset.height,
            provider: completed[0].asset.provider,
          }
        : null);
    const blackFrames = qcVideo?.bytes ? await detectBlackFrames(qcVideo.bytes) : { available: false, blackRatio: null, note: "Bytes not in memory for black-frame detection." };
    const hasReferences = scenes.some(
      (scene) => (scene.references?.length || 0) + (scene.characters?.length || 0) + (scene.products?.length || 0) > 0,
    );
    let artifactQc = inspectArtifactQuality({
      video: qcVideo,
      audio: audioAsset ? { durationSec: audioAsset.durationSec || 0, mimeType: audioAsset.mimeType, url: audioAsset.url } : null,
      expectedDurationSec: params.model.targetDurationSec || qcVideo?.durationSec,
      narrationRequired: audioRequired,
      scenes: scenes.map((scene) => ({
        prompt: scene.prompt,
        artifactId: scene.artifactId,
        references: scene.references,
        characters: scene.characters,
        products: scene.products,
      })),
      blackFrames,
      promptAdherence: { available: false, score: null },
      consistency: { available: false, score: null, hasReferences },
    });
    const qcModel = applyJobToModel(params.model, { ...job, clips }, assets, audioAsset);
    const qc = runVideoQualityChecks(qcModel);
    const legacyBlockers = qc.checks
      .filter((check) => check.severity === "blocker" && !check.passed)
      .map((check) => check.detail);
    artifactQc = combineQualityVerdicts(artifactQc, legacyBlockers);
    try {
      await persistArtifactQualityReport(params.supabase, {
        userId: params.userId,
        projectId: params.generationId,
        subject: "project",
        subjectId: params.generationId,
        report: artifactQc,
      });
    } catch {
      /* QC persistence is additive */
    }

    if (artifactQc.verdict === "BLOCKED") {
      const errorCode = "quality_blocked";
      const errorMessage = artifactQc.summary;
      state = await failProject(params.supabase, {
        projectId: params.generationId,
        from: state,
        errorCode,
        errorMessage,
      });
      job = { ...job, status: "failed", message: errorMessage, completedAt: nowIso() };
      await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
      const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
      return finish(applyJobToModel(params.model, job, assets, audioAsset), job, {
        providerJobs,
        artifact: qcVideo && isValidVideoArtifact(qcVideo) ? qcVideo : null,
        errorCode,
        errorMessage,
      });
    }

    await persistTransition(params.supabase, {
      projectId: params.generationId,
      from: "quality_check",
      to: "assembling",
      qcVerdict: artifactQc.verdict,
    });
    state = "assembling";

    const existingComposite = await loadPlayableCompositeArtifact(params.supabase, params.generationId);
    let assembled: Awaited<ReturnType<typeof assembleAndUpload>> = {
      assets,
      compositeAsset: undefined,
      assemblyManifest: undefined,
      ok: false,
    };
    if (isReusableFfmpegComposite(existingComposite)) {
      assembled = {
        assets,
        ok: true,
        compositeAsset: {
          id: existingComposite.id,
          kind: "composite",
          mimeType: existingComposite.mimeType,
          url: existingComposite.url,
          durationSec: existingComposite.durationSec,
          width: existingComposite.width,
          height: existingComposite.height,
          provider: existingComposite.provider,
          createdAt: nowIso(),
        },
        assemblyManifest: {
          clipUrls: clips.map((clip) => clip.asset?.url || "").filter(Boolean),
          method: "ffmpeg",
          note: "Reused existing playable composite artifact.",
        },
      };
    } else {
      assembled = await assembleAndUpload({
        model: params.model,
        job: { ...job, clips },
        clips,
        audioAsset,
        supabase: params.supabase,
        userId: params.userId,
        generationId: params.generationId,
        assets,
        assemble: params.assemble,
      });
    }

    let compositeArtifact: VideoArtifact | null = null;
    if (
      assembled.ok &&
      isFfmpegAssemblyMethod(assembled.assemblyManifest?.method) &&
      assembled.compositeAsset?.url &&
      assembled.compositeAsset.mimeType
    ) {
      const candidate: VideoArtifact = {
        id: assembled.compositeAsset.id,
        projectId: params.generationId,
        kind: "composite",
        mimeType: assembled.compositeAsset.mimeType,
        url: assembled.compositeAsset.url,
        durationSec: assembled.compositeAsset.durationSec || 0,
        width: assembled.compositeAsset.width,
        height: assembled.compositeAsset.height,
        provider: assembled.compositeAsset.provider,
        isStub: assembled.compositeAsset.provider === "preview",
      };
      if (isValidVideoArtifact(candidate)) compositeArtifact = candidate;
    }

    const playable = compositeArtifact && isValidVideoArtifact(compositeArtifact) ? compositeArtifact : null;
    if (!playable) {
      const errorMessage =
        assembled.errorMessage ||
        "FFmpeg did not produce a playable MP4. Production renders cannot finish as first-clip or manifest-only.";
      state = await failProject(params.supabase, {
        projectId: params.generationId,
        from: state,
        errorCode: "ffmpeg_failed",
        errorMessage,
      });
      job = {
        ...job,
        clips,
        audioAsset,
        compositeAsset: assembled.compositeAsset,
        assemblyManifest: assembled.assemblyManifest,
        status: "failed",
        message: errorMessage,
        completedAt: nowIso(),
      };
      await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
      const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
      return finish(applyJobToModel(params.model, job, assembled.assets, audioAsset), job, {
        providerJobs,
        errorCode: "ffmpeg_failed",
        errorMessage,
      });
    }

    await persistTransition(params.supabase, {
      projectId: params.generationId,
      from: "assembling",
      to: "video_rendered",
      artifact: playable,
    });
    state = "video_rendered";

    job = {
      ...job,
      clips,
      audioAsset,
      compositeAsset: assembled.compositeAsset,
      assemblyManifest: assembled.assemblyManifest,
      status: "completed",
      progress: 100,
      message: `Rendered ${completed.length} clip(s) via ${lastProvider}${
        assembled.assemblyManifest ? ` · ${assembled.assemblyManifest.method}` : ""
      }.`,
      completedAt: nowIso(),
      updatedAt: nowIso(),
    };
    await persistLegacyJob(params.supabase, params.userId, params.generationId, job);
    const providerJobs = await listProviderJobsForProject(params.supabase, params.generationId);
    return {
      model: applyJobToModel(params.model, job, assembled.assets, audioAsset),
      job,
      domainState: state,
      planId: seeded.planId,
      sceneIds: scenes.map((scene) => scene.id),
      providerJobs,
      artifact: playable,
      errorCode: null,
      errorMessage: null,
      retryCount,
    };
  } catch (error) {
    if (error instanceof ProviderRouterError) {
      await failProject(params.supabase, {
        projectId: params.generationId,
        from: state,
        errorCode: error.code,
        errorMessage: error.message,
      });
      const failedJob: VideoRenderJob = {
        ...createRenderJobFromModel(params.model, mode),
        status: "failed",
        mode,
        message: error.message,
        provider: params.providerId || "kling",
        completedAt: nowIso(),
        updatedAt: nowIso(),
      };
      await persistLegacyJob(params.supabase, params.userId, params.generationId, failedJob);
      throw toNotConfigured(error);
    }
    if (state !== "failed" && state !== "video_rendered") {
      try {
        await failProject(params.supabase, {
          projectId: params.generationId,
          from: state,
          errorCode: "render_failed",
          errorMessage: error instanceof Error ? error.message : "Render failed.",
        });
      } catch {
        /* keep original error */
      }
    }
    throw error;
  }
}

export async function retryDomainRender(
  params: Omit<Parameters<typeof runDomainRenderPipeline>[0], "retry">,
): Promise<DomainRenderResult> {
  return runDomainRenderPipeline({ ...params, retry: true });
}

export async function resumeDomainRender(
  params: Omit<Parameters<typeof runDomainRenderPipeline>[0], "resume">,
): Promise<DomainRenderResult> {
  return runDomainRenderPipeline({ ...params, resume: true });
}

export type { GenerationDomainRow };
