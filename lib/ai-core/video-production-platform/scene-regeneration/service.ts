import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import {
  loadPlanById,
  loadPlayableSceneArtifact,
  loadSceneById,
  listProviderJobsForScene,
  resolveActivePlanId,
  updateSceneRecord,
} from "@/lib/ai-core/video-production-platform/persistence/repository";
import type { RegenerateSceneOptions, RegenerateSceneResult } from "@/lib/ai-core/video-production-platform/scene-regeneration/contracts";
import { buildRegenerationIdempotencySalt, nextSceneAttempt } from "@/lib/ai-core/video-production-platform/scene-regeneration/attempts";
import { executeSceneRegeneration } from "@/lib/ai-core/video-production-platform/scene-regeneration/execute";
import { SceneRegenerationError } from "@/lib/ai-core/video-production-platform/scene-regeneration/errors";
import { assertSceneRegeneratable } from "@/lib/ai-core/video-production-platform/scene-regeneration/state";
import {
  applyVideoStudioCreditOutcome,
  regenerationCreditOutcome,
  videoStudioCreditOperationId,
} from "@/lib/ai-core/video-production-platform/runtime/video-credits";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function regenerateScene(
  supabase: AnySupabase,
  input: {
    userId: string;
    projectId: string;
    planId: string;
    sceneId: string;
    options?: RegenerateSceneOptions;
  },
): Promise<RegenerateSceneResult> {
  const options = input.options || {};
  const plan = await loadPlanById(supabase, input.planId);
  if (!plan) {
    throw new SceneRegenerationError("Plan not found.", "plan_not_found");
  }
  if (plan.projectId !== input.projectId) {
    throw new SceneRegenerationError("Plan does not belong to this project.", "foreign_plan");
  }

  const activePlanId = await resolveActivePlanId(supabase, input.projectId);
  if (!options.allowInactivePlan) {
    if (!plan.isActive || plan.id !== activePlanId) {
      throw new SceneRegenerationError(
        "Scene regeneration requires the active plan. Activate the plan first.",
        "inactive_plan",
      );
    }
  }

  const scene = await loadSceneById(supabase, input.sceneId);
  if (!scene) {
    throw new SceneRegenerationError("Scene not found.", "scene_not_found");
  }
  if (scene.projectId !== input.projectId) {
    throw new SceneRegenerationError("Scene does not belong to this project.", "foreign_project");
  }
  if (scene.planId !== input.planId) {
    throw new SceneRegenerationError("Scene does not belong to the specified plan.", "foreign_plan");
  }

  assertSceneRegeneratable(scene.status);

  const preservedArtifact = scene.artifactId
    ? await loadPlayableSceneArtifact(supabase, input.projectId, input.sceneId)
    : null;
  const preservedArtifactId = preservedArtifact?.id ?? scene.artifactId ?? null;

  const sceneJobs = await listProviderJobsForScene(supabase, input.projectId, input.sceneId);
  const attempt =
    options.requestId && !options.retry
      ? sceneJobs.length
        ? Math.max(...sceneJobs.map((job) => job.attempt || 1))
        : 1
      : nextSceneAttempt(sceneJobs);
  const idempotencySalt = buildRegenerationIdempotencySalt({
    attempt,
    requestId: options.requestId,
    promptOverride: options.promptOverride,
    retry: options.retry,
  });

  const routingScene: Scene = options.promptOverride?.trim()
    ? { ...scene, prompt: options.promptOverride.trim() }
    : scene;

  const creditOperationId = videoStudioCreditOperationId({
    kind: "regenerate",
    projectId: input.projectId,
    sceneId: input.sceneId,
    attempt,
  });

  try {
    const executed = await executeSceneRegeneration({
      supabase,
      userId: input.userId,
      projectId: input.projectId,
      scene,
      routingScene,
      aspectRatio: options.aspectRatio || plan.aspectRatio || "16:9",
      language: options.language || plan.language,
      idempotencySalt,
      attempt,
      providerPreference: options.providerPreference,
      preservedArtifactId,
      snapshot: options.snapshot,
      registry: options.registry,
    });

    if (
      executed.status === "ready" &&
      options.promptOverride?.trim() &&
      executed.activeArtifactId &&
      executed.activeArtifactId !== preservedArtifactId
    ) {
      await updateSceneRecord(supabase, {
        id: scene.id,
        prompt: options.promptOverride.trim(),
      });
    }

    await applyVideoStudioCreditOutcome({
      supabase,
      userId: input.userId,
      operationId: creditOperationId,
      outcome: regenerationCreditOutcome(executed),
    });

    return {
      projectId: input.projectId,
      planId: input.planId,
      sceneId: input.sceneId,
      attempt: executed.attempt,
      jobId: executed.jobId,
      status: executed.status === "processing" ? "processing" : executed.status,
      activeArtifactId: executed.activeArtifactId,
      preservedArtifactId: executed.preservedArtifactId,
      candidateArtifactId: executed.candidateArtifactId,
      reused: executed.reused,
      estimatedCost: executed.estimatedCost,
      actualCost: executed.actualCost,
      errorCode: executed.errorCode,
      errorMessage: executed.errorMessage,
    };
  } catch (error) {
    await applyVideoStudioCreditOutcome({
      supabase,
      userId: input.userId,
      operationId: creditOperationId,
      outcome: "failed",
    });
    throw error;
  }
}
