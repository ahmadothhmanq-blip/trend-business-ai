/**
 * Single-scene provider execution for regeneration (Phase 6C).
 * Does not skip scenes with existing artifacts — always runs a new provider attempt.
 */

import { randomUUID } from "node:crypto";
import type { Scene, VideoArtifact } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { nowIso } from "@/lib/ai-core/video-production-platform/ids";
import {
  insertQualityReport,
  loadSceneById,
  updateProviderJob,
  updateSceneRecord,
} from "@/lib/ai-core/video-production-platform/persistence/repository";
import {
  createProviderRegistry,
  createSupabaseProviderJobStore,
  persistRoutedProviderJob,
  type ProviderEnvSnapshot,
} from "@/lib/ai-core/video-production-platform/provider-router";
import type {
  ModelRouterInput,
  ProviderJobHandle,
  ProviderV2Id,
  VideoProviderV2,
} from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
import { buildSceneRouterInput } from "@/lib/ai-core/video-production-platform/provider-router/scene-to-provider";
import { ArtifactIngestError, ingestProviderArtifact } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import { honestProviderJobCost } from "@/lib/ai-core/video-production-platform/runtime/video-credits";
import { SceneRegenerationError } from "@/lib/ai-core/video-production-platform/scene-regeneration/errors";
import { sceneStatusAfterFailure } from "@/lib/ai-core/video-production-platform/scene-regeneration/state";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MAX_INLINE_POLLS = 0;
const POLL_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

export type ExecuteSceneRegenerationInput = {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  scene: Scene;
  routingScene: Scene;
  aspectRatio: string;
  language?: string;
  idempotencySalt: string;
  attempt: number;
  providerPreference?: ModelRouterInput["preferredProvider"];
  preservedArtifactId: string | null;
  snapshot?: ProviderEnvSnapshot;
  registry?: Record<ProviderV2Id, VideoProviderV2>;
};

export type ExecuteSceneRegenerationResult = {
  jobId: string;
  attempt: number;
  status: "ready" | "failed" | "processing";
  activeArtifactId: string | null;
  candidateArtifactId: string | null;
  preservedArtifactId: string | null;
  reused: boolean;
  estimatedCost: number | null;
  actualCost: number | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export async function executeSceneRegeneration(
  input: ExecuteSceneRegenerationInput,
): Promise<ExecuteSceneRegenerationResult> {
  const registry = input.registry || createProviderRegistry(input.snapshot);
  const store = createSupabaseProviderJobStore(input.supabase);
  const preservedArtifactId = input.preservedArtifactId;

  const routeInput: ModelRouterInput = {
    ...buildSceneRouterInput(input.routingScene, {
      projectId: input.projectId,
      aspectRatio: input.aspectRatio,
      mode: "full",
      quality: "standard",
      language: input.language,
      idempotencySalt: input.idempotencySalt,
    }),
    preferredProvider: input.providerPreference,
  };

  let routed;
  try {
    routed = await persistRoutedProviderJob({
      userId: input.userId,
      routeInput,
      store,
      snapshot: input.snapshot,
      registry,
      attempt: input.attempt,
    });
  } catch (error) {
    if (error instanceof ProviderRouterError) {
      throw new SceneRegenerationError(error.message, "provider_unconfigured");
    }
    throw error;
  }

  const base = {
    jobId: routed.job.id,
    attempt: routed.job.attempt,
    preservedArtifactId,
    reused: routed.reused,
    estimatedCost: routed.reused ? null : routed.route.estimatedCost,
    actualCost: null as number | null,
    candidateArtifactId: null as string | null,
    activeArtifactId: preservedArtifactId,
    errorCode: null as string | null,
    errorMessage: null as string | null,
  };

  if (routed.reused && routed.job.status === "succeeded") {
    const reloaded = await loadSceneById(input.supabase, input.scene.id);
    return {
      ...base,
      status: "ready",
      activeArtifactId: reloaded?.artifactId ?? preservedArtifactId,
      actualCost: null,
    };
  }

  await updateSceneRecord(input.supabase, {
    id: input.scene.id,
    status: "generating",
  });

  const provider = registry[routed.route.primaryProvider];

  await updateProviderJob(input.supabase, {
    id: routed.job.id,
    status: "submitted",
    submittedAt: nowIso(),
  });

  await updateSceneRecord(input.supabase, {
    id: input.scene.id,
    status: "processing",
  });

  let handle: ProviderJobHandle;
  try {
    handle = await provider.createJob({
      projectId: input.projectId,
      sceneId: input.scene.id,
      prompt: routeInput.prompt,
      promptHash: routed.route.metadata.idempotencyPromptHash,
      durationSec: input.routingScene.duration,
      aspectRatio: input.aspectRatio,
      imageUrl:
        input.routingScene.references.find((ref) => ref.uri?.startsWith("http"))?.uri || null,
      idempotencyKey: routed.job.idempotencyKey,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider createJob failed.";
    const code = error instanceof ProviderRouterError ? "provider_unconfigured" : "provider_failed";
    await updateProviderJob(input.supabase, {
      id: routed.job.id,
      status: "failed",
      errorCode: code,
      errorMessage: message,
      actualCost: 0,
      completedAt: nowIso(),
    });
    await updateSceneRecord(input.supabase, {
      id: input.scene.id,
      status: sceneStatusAfterFailure(Boolean(preservedArtifactId)),
      artifactId: preservedArtifactId,
    });
    throw new SceneRegenerationError(message, code === "provider_unconfigured" ? "provider_unconfigured" : "provider_failed");
  }

  handle = await pollHandle(provider, handle);
  const jobStatus =
    handle.status === "succeeded"
      ? "succeeded"
      : handle.status === "processing" || handle.status === "queued" || handle.status === "submitted"
        ? "processing"
        : "failed";

  if (jobStatus === "processing") {
    await updateProviderJob(input.supabase, {
      id: routed.job.id,
      status: "processing",
      externalJobId: handle.externalJobId ?? null,
    });
    return {
      ...base,
      status: "processing",
      errorMessage: handle.message,
    };
  }

  if (jobStatus !== "succeeded") {
    await updateProviderJob(input.supabase, {
      id: routed.job.id,
      status: "failed",
      externalJobId: handle.externalJobId ?? null,
      errorCode: handle.errorCode || "provider_failed",
      errorMessage: handle.message,
      actualCost: routed.reused ? undefined : 0,
      completedAt: nowIso(),
    });
    await updateSceneRecord(input.supabase, {
      id: input.scene.id,
      status: sceneStatusAfterFailure(Boolean(preservedArtifactId)),
      artifactId: preservedArtifactId,
    });
    return {
      ...base,
      status: "failed",
      errorCode: handle.errorCode || "provider_failed",
      errorMessage: handle.message,
      actualCost: 0,
    };
  }

  await updateSceneRecord(input.supabase, {
    id: input.scene.id,
    status: "quality_check",
  });

  let artifact: VideoArtifact;
  try {
    artifact = await ingestProviderArtifact({
      supabase: input.supabase,
      userId: input.userId,
      projectId: input.projectId,
      sceneId: input.scene.id,
      handle,
      declaredDurationSec: input.routingScene.duration,
      aspectRatio: input.aspectRatio,
      kind: "scene_clip",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Artifact ingest failed.";
    const code = error instanceof ArtifactIngestError ? error.errorCode : "artifact_invalid";
    await updateProviderJob(input.supabase, {
      id: routed.job.id,
      status: "failed",
      errorCode: code,
      errorMessage: message,
      actualCost: routed.reused ? undefined : 0,
      completedAt: nowIso(),
    });
    await updateSceneRecord(input.supabase, {
      id: input.scene.id,
      status: sceneStatusAfterFailure(Boolean(preservedArtifactId)),
      artifactId: preservedArtifactId,
    });
    return {
      ...base,
      status: "failed",
      errorCode: code,
      errorMessage: message,
      actualCost: 0,
    };
  }

  if (!isValidVideoArtifact(artifact)) {
    await updateProviderJob(input.supabase, {
      id: routed.job.id,
      status: "failed",
      errorCode: "invalid_artifact",
      errorMessage: "Ingested artifact failed validation.",
      actualCost: routed.reused ? undefined : 0,
      completedAt: nowIso(),
    });
    await updateSceneRecord(input.supabase, {
      id: input.scene.id,
      status: sceneStatusAfterFailure(Boolean(preservedArtifactId)),
      artifactId: preservedArtifactId,
    });
    return {
      ...base,
      status: "failed",
      errorCode: "invalid_artifact",
      errorMessage: "Ingested artifact failed validation.",
      actualCost: 0,
    };
  }

  try {
    await insertQualityReport(input.supabase, {
      userId: input.userId,
      report: {
        id: randomUUID(),
        projectId: input.projectId,
        subject: "scene",
        subjectId: input.scene.id,
        ready: true,
        score: 100,
        summary: "Scene regeneration artifact passed validation.",
        blockers: [],
      },
      warnings: [],
    });
  } catch {
    /* QC persistence is additive */
  }

  const cost = honestProviderJobCost({
    succeeded: true,
    reused: routed.reused,
    estimated: routed.route.estimatedCost,
  });
  await updateProviderJob(input.supabase, {
    id: routed.job.id,
    status: "succeeded",
    externalJobId: handle.externalJobId ?? null,
    actualCost: cost.actualCost,
    errorCode: null,
    errorMessage: null,
    completedAt: nowIso(),
  });

  await updateSceneRecord(input.supabase, {
    id: input.scene.id,
    status: "ready",
    artifactId: artifact.id,
  });

  return {
    ...base,
    status: "ready",
    activeArtifactId: artifact.id,
    candidateArtifactId: artifact.id,
    estimatedCost: routed.reused ? null : routed.route.estimatedCost,
    actualCost: cost.actualCost,
  };
}
