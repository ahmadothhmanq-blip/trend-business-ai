import { persistTransition } from "@/lib/ai-core/video-production-platform/state-machine";
import {
  findPlanByIdempotencyKey,
  loadScenesForPlan,
} from "@/lib/ai-core/video-production-platform/persistence";
import type { DirectorInput, DirectorResult, DirectorVideoPlan } from "@/lib/ai-core/video-production-platform/director/contracts";
import { DirectorError } from "@/lib/ai-core/video-production-platform/director/errors";
import { generateDirectorDraft } from "@/lib/ai-core/video-production-platform/director/llm";
import type { DirectorLlmClient } from "@/lib/ai-core/video-production-platform/director/llm";
import { directorIdempotencyKey, normalizeDirectorPlan } from "@/lib/ai-core/video-production-platform/director/normalize";
import { hydrateDirectorPlan, persistDirectorPlan } from "@/lib/ai-core/video-production-platform/director/persist";
import { assertDirectorInput, assertDirectorPlan } from "@/lib/ai-core/video-production-platform/director/validation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type RunDirectorParams = {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
  input: DirectorInput;
  client?: DirectorLlmClient;
  persistProjectState?: boolean;
};

async function markFailed(params: RunDirectorParams, error: DirectorError): Promise<DirectorResult> {
  if (params.persistProjectState) {
    try {
      const { data } = await params.supabase
        .from("video_generations")
        .select("domain_state")
        .eq("id", params.projectId)
        .maybeSingle();
      const from = (data?.domain_state as string | undefined) || "planning";
      if (from === "planning" || from === "draft") {
        await persistTransition(params.supabase, { projectId: params.projectId, from, to: "failed" });
      }
    } catch {
      /* unit tests may omit the generation row */
    }
  }
  return {
    status: "failed",
    plan: null,
    reused: false,
    errorCode: error.code,
    errorMessage: error.message,
  };
}

async function buildValidatedPlan(params: RunDirectorParams): Promise<DirectorVideoPlan> {
  assertDirectorInput(params.input);
  let lastError: DirectorError | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const draft = await generateDirectorDraft({ input: params.input, client: params.client });
      const plan = normalizeDirectorPlan({
        projectId: params.projectId,
        input: params.input,
        draft,
      });
      assertDirectorPlan(plan, params.input);
      return plan;
    } catch (error) {
      if (error instanceof DirectorError) {
        lastError = error;
        if (error.code === "malformed_json" || error.code === "invalid_plan") continue;
        throw error;
      }
      throw new DirectorError(error instanceof Error ? error.message : "Director failed.", "llm_failed");
    }
  }
  throw lastError || new DirectorError("Director could not produce a valid VideoPlan.", "invalid_plan");
}

export async function runDirector(params: RunDirectorParams): Promise<DirectorResult> {
  try {
    assertDirectorInput(params.input);
    const key = directorIdempotencyKey(params.projectId, params.input);
    const existing = await findPlanByIdempotencyKey(params.supabase, params.projectId, key);
    if (existing) {
      const scenes = await loadScenesForPlan(params.supabase, params.projectId, existing.id);
      return { status: "reused", plan: hydrateDirectorPlan(existing, scenes), reused: true };
    }

    const plan = await buildValidatedPlan(params);
    const persisted = await persistDirectorPlan({
      supabase: params.supabase,
      userId: params.userId,
      projectId: params.projectId,
      input: params.input,
      plan,
    });

    return {
      status: persisted.reused ? "reused" : "ready",
      plan: persisted.plan,
      reused: persisted.reused,
    };
  } catch (error) {
    const directorError =
      error instanceof DirectorError
        ? error
        : new DirectorError(error instanceof Error ? error.message : "Director failed.", "llm_failed");
    return markFailed(params, directorError);
  }
}
