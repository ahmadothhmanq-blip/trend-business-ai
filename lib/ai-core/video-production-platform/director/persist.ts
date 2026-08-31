import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";
import {
  DIRECTOR_SPEC_VERSION,
  type DirectorAudioPlan,
  type DirectorBrand,
  type DirectorCharacter,
  type DirectorInput,
  type DirectorProduct,
  type DirectorProviderHint,
  type DirectorScene,
  type DirectorVideoPlan,
} from "@/lib/ai-core/video-production-platform/director/contracts";
import { DirectorError } from "@/lib/ai-core/video-production-platform/director/errors";
import { directorIdempotencyKey } from "@/lib/ai-core/video-production-platform/director/normalize";
import {
  findPlanByIdempotencyKey,
  insertVideoPlan,
  insertVideoScenes,
  loadScenesForPlan,
  nextPlanVersion,
} from "@/lib/ai-core/video-production-platform/persistence";
import { activatePlan } from "@/lib/ai-core/video-production-platform/plan-versioning";
import type { VideoPlanRecord } from "@/lib/ai-core/video-production-platform/persistence/mappers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type DirectorPlanSpec = {
  specVersion: number;
  title?: string;
  workflow: DirectorVideoPlan["workflow"];
  audience?: string;
  narrative: string;
  visualStyle: string;
  qualityTier?: DirectorVideoPlan["qualityTier"];
  characters: DirectorCharacter[];
  products: DirectorProduct[];
  brandReferences: DirectorBrand[];
  audioPlan: DirectorAudioPlan;
  outputVariants: DirectorVideoPlan["outputVariants"];
  providerHints: DirectorProviderHint[];
  callToAction?: string;
  createdAt: string;
};

export function directorPlanToSpec(plan: DirectorVideoPlan): DirectorPlanSpec {
  return {
    specVersion: DIRECTOR_SPEC_VERSION,
    title: plan.title,
    workflow: plan.workflow,
    audience: plan.audience,
    narrative: plan.narrative,
    visualStyle: plan.visualStyle,
    qualityTier: plan.qualityTier,
    characters: plan.characters,
    products: plan.products,
    brandReferences: plan.brandReferences,
    audioPlan: plan.audioPlan,
    outputVariants: plan.outputVariants,
    providerHints: plan.providerHints,
    callToAction: plan.callToAction,
    createdAt: plan.createdAt,
  };
}

export function asDirectorScene(scene: Scene): DirectorScene {
  return {
    ...scene,
    purpose: scene.purpose || scene.camera.purpose || "scene",
    environment: scene.environment || scene.camera.environment || "",
    lighting: scene.lighting || scene.camera.lighting || "",
    voiceRequired: scene.voiceRequired ?? scene.audio.voiceRequired ?? false,
  };
}

export function hydrateDirectorPlan(record: VideoPlanRecord, scenes: Scene[]): DirectorVideoPlan {
  const spec = (record.spec || {}) as Partial<DirectorPlanSpec>;
  const directorScenes = scenes.map(asDirectorScene);
  const audioPlan: DirectorAudioPlan = spec.audioPlan || {
    id: `audio-${record.id}`,
    projectId: record.projectId,
    narrationRequired: directorScenes.some((scene) => scene.voiceRequired),
    language: record.language,
    musicRequired: false,
    sfxRequired: directorScenes.some((scene) => (scene.audio.sfx || []).length > 0),
    dialoguePerScene: directorScenes
      .filter((scene) => scene.dialogue.text.trim())
      .map((scene) => ({
        sceneOrder: scene.order,
        text: scene.dialogue.text,
        speakerId: scene.dialogue.speakerId,
      })),
    voiceScript: directorScenes.map((scene) => scene.dialogue.text).filter(Boolean).join("\n"),
    musicCue: directorScenes.find((scene) => scene.audio.musicCue)?.audio.musicCue,
    sfx: directorScenes.flatMap((scene) => scene.audio.sfx || []),
  };
  const aspectRatio = (record.aspectRatio === "9:16" || record.aspectRatio === "1:1" ? record.aspectRatio : "16:9") as
    | "16:9"
    | "9:16"
    | "1:1";
  return {
    id: record.id,
    projectId: record.projectId,
    title: spec.title,
    workflow: spec.workflow || "cinematic",
    objective: record.objective || spec.narrative || record.narrativeArc,
    audience: spec.audience,
    narrative: spec.narrative || record.narrativeArc,
    totalDuration: record.durationSec,
    aspectRatio,
    language: record.language,
    visualStyle: spec.visualStyle || record.style,
    pacing: (record.pacing as DirectorVideoPlan["pacing"]) || "measured",
    qualityTier: spec.qualityTier,
    budget: record.budgetCredits ?? undefined,
    scenes: directorScenes,
    characters: spec.characters || [],
    products: spec.products || [],
    brandReferences: spec.brandReferences || [],
    audioPlan,
    outputVariants: spec.outputVariants?.length
      ? spec.outputVariants
      : [{ aspectRatio, supported: true }],
    providerHints: spec.providerHints || directorScenes.map((scene) => ({
      sceneOrder: scene.order,
      preferredProvider: scene.providerPreference,
      fallbackProvider: scene.fallbackProvider,
      reason: "hydrated from persisted scene preference",
    })),
    callToAction: spec.callToAction,
    createdAt: spec.createdAt || record.createdAt,
  };
}

export async function persistDirectorPlan(params: {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  input: DirectorInput;
  plan: DirectorVideoPlan;
}): Promise<{ plan: DirectorVideoPlan; reused: boolean }> {
  const key = directorIdempotencyKey(params.projectId, params.input);
  const existing = await findPlanByIdempotencyKey(params.supabase, params.projectId, key);
  if (existing) {
    const scenes = await loadScenesForPlan(params.supabase, params.projectId, existing.id);
    return { plan: hydrateDirectorPlan(existing, scenes), reused: true };
  }

  const version = await nextPlanVersion(params.supabase, params.projectId);
  const spec = directorPlanToSpec(params.plan);
  try {
    const record = await insertVideoPlan(params.supabase, {
      userId: params.userId,
      projectId: params.projectId,
      plan: {
        id: params.plan.id,
        version,
        narrativeArc: params.plan.objective,
        pacing: params.plan.pacing,
        preferredProvider: "auto",
        language: params.plan.language,
        aspectRatio: params.plan.aspectRatio,
        durationSec: params.plan.totalDuration,
        style: params.plan.visualStyle,
        budgetCredits: params.plan.budget ?? null,
        spec,
        idempotencyKey: key,
        sourcePrompt: params.input.prompt,
        sourceHash: key,
      },
    });
    const scenes = await insertVideoScenes(params.supabase, {
      userId: params.userId,
      planId: record.id,
      scenes: params.plan.scenes.map((scene) => ({ ...scene, projectId: params.projectId, planId: record.id })),
    });
    await activatePlan(params.supabase, { projectId: params.projectId, planId: record.id });
    return { plan: hydrateDirectorPlan({ ...record, spec, idempotencyKey: key }, scenes), reused: false };
  } catch (error) {
    if (error instanceof DomainValidationError && /duplicate/i.test(error.message)) {
      const raced = await findPlanByIdempotencyKey(params.supabase, params.projectId, key);
      if (raced) {
        const scenes = await loadScenesForPlan(params.supabase, params.projectId, raced.id);
        return { plan: hydrateDirectorPlan(raced, scenes), reused: true };
      }
    }
    throw new DirectorError(
      error instanceof Error ? error.message : "Failed to persist VideoPlan.",
      "persist_failed",
    );
  }
}
