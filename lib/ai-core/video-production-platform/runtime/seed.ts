/**
 * Seed domain plan/scenes after generate, and on-demand for legacy projects.
 * Never rewrites JSONB blueprint.
 */

import { randomUUID } from "node:crypto";
import type { VideoGeneration } from "@/types/video";
import type { Scene, VideoProjectState } from "@/lib/ai-core/video-production-platform/domain/contracts";
import {
  isWritableProjectState,
  readProjectState,
  readScenesFromBlueprint,
  WORKFLOW_FROM_TYPE,
} from "@/lib/ai-core/video-production-platform/domain";
import { parseDurationToSeconds } from "@/lib/ai-core/video-production-platform/duration";
import { persistTransition } from "@/lib/ai-core/video-production-platform/state-machine";
import {
  insertVideoPlan,
  insertVideoScenes,
  listPlansForProject,
  loadScenesForPlan,
} from "@/lib/ai-core/video-production-platform/persistence/repository";
import { activatePlan } from "@/lib/ai-core/video-production-platform/plan-versioning";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type GenerationDomainRow = VideoGeneration & {
  domain_state?: string | null;
  workflow?: string | null;
  language?: string | null;
  active_plan_id?: string | null;
};

export type SeedDomainResult = {
  seeded: boolean;
  skippedReason?: "already_seeded" | "no_scenes" | "domain_tables_missing";
  planId: string | null;
  sceneIds: string[];
  state: VideoProjectState;
  source: "domain" | "legacy_blueprint";
};

export function isMissingDomainRelation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: string }).code || "") : "";
  const message = error instanceof Error ? error.message : String((error as { message?: string }).message || error);
  return code === "42P01" || /relation|does not exist|video_plans|video_scenes/i.test(message);
}

export function currentDomainState(generation: GenerationDomainRow): VideoProjectState {
  if (generation.domain_state && isWritableProjectState(generation.domain_state)) {
    return generation.domain_state;
  }
  return readProjectState(generation.status);
}

export function scenesForDomainWrite(generation: GenerationDomainRow): Scene[] {
  const legacy = readScenesFromBlueprint(generation.blueprint, generation.id);
  return legacy.map((scene, index) => ({
    ...scene,
    id: randomUUID(),
    order: index,
    duration: scene.duration > 0 ? scene.duration : 5,
    references: [
      ...scene.references,
      {
        kind: "video" as const,
        uri: `blueprint:${generation.blueprint?.scenes?.[index]?.id || scene.id}`,
        role: "legacy-scene-id",
      },
    ],
    status: "planned",
  }));
}

export async function loadGenerationDomainRow(
  supabase: AnySupabase,
  projectId: string,
  userId?: string,
): Promise<GenerationDomainRow | null> {
  let query = supabase.from("video_generations").select("*").eq("id", projectId);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data as GenerationDomainRow | null) ?? null;
}

async function setActivePlan(
  supabase: AnySupabase,
  projectId: string,
  planId: string,
): Promise<void> {
  await activatePlan(supabase, { projectId, planId });
}

/**
 * Walk draft → planning → storyboard_ready and persist plan/scenes.
 * Safe to call on legacy rows: inserts domain tables only when missing.
 * Does not mix scenes across plan versions. Does not rewrite JSONB blueprint.
 */
export async function seedDomainProject(
  supabase: AnySupabase,
  input: { userId: string; generation: GenerationDomainRow },
): Promise<SeedDomainResult> {
  const projectId = input.generation.id;
  let state = currentDomainState(input.generation);

  try {
    const plans = await listPlansForProject(supabase, projectId);
    if (plans.length) {
      const active = plans.find((plan) => plan.isActive) || null;
      const scenes = active ? await loadScenesForPlan(supabase, projectId, active.id) : [];
      if (state === "draft") {
        await persistTransition(supabase, { projectId, from: state, to: "planning" });
        state = "planning";
      }
      if (state === "planning") {
        await persistTransition(supabase, { projectId, from: state, to: "storyboard_ready" });
        state = "storyboard_ready";
      }
      return {
        seeded: true,
        skippedReason: "already_seeded",
        planId: active?.id ?? input.generation.active_plan_id ?? null,
        sceneIds: scenes.map((scene) => scene.id),
        state,
        source: "domain",
      };
    }

    if (state === "draft") {
      await persistTransition(supabase, { projectId, from: state, to: "planning" });
      state = "planning";
    }

    const durationSec = parseDurationToSeconds(input.generation.duration);
    const plan = await insertVideoPlan(supabase, {
      userId: input.userId,
      projectId,
      plan: {
        narrativeArc: input.generation.description || input.generation.prompt || "Video plan",
        pacing: "measured",
        preferredProvider: "auto",
        language: input.generation.blueprint?.language || input.generation.language || "en",
        aspectRatio: input.generation.aspect_ratio || "16:9",
        durationSec,
        style: input.generation.style || "Cinematic",
        sourcePrompt: input.generation.prompt,
        sourceHash: null,
      },
    });
    const toInsert = scenesForDomainWrite(input.generation);
    if (!toInsert.length) {
      return {
        seeded: false,
        skippedReason: "no_scenes",
        planId: plan.id,
        sceneIds: [],
        state,
        source: "legacy_blueprint",
      };
    }
    const scenes = await insertVideoScenes(supabase, {
      userId: input.userId,
      planId: plan.id,
      scenes: toInsert,
    });
    await setActivePlan(supabase, projectId, plan.id);

    if (state === "planning") {
      await persistTransition(supabase, { projectId, from: state, to: "storyboard_ready" });
      state = "storyboard_ready";
    }

    return {
      seeded: true,
      planId: plan.id,
      sceneIds: scenes.map((scene) => scene.id),
      state,
      source: "domain",
    };
  } catch (error) {
    if (isMissingDomainRelation(error)) {
      return {
        seeded: false,
        skippedReason: "domain_tables_missing",
        planId: null,
        sceneIds: [],
        state,
        source: "legacy_blueprint",
      };
    }
    throw error;
  }
}

export function workflowForGeneration(generation: Pick<VideoGeneration, "video_type">) {
  return WORKFLOW_FROM_TYPE[generation.video_type] || "cinematic";
}
