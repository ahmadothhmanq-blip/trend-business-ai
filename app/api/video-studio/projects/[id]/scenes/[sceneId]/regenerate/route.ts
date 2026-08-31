import { NextResponse } from "next/server";
import { z } from "zod";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { loadPlanForProject, resolveActivePlanId } from "@/lib/ai-core/video-production-platform/persistence";
import {
  regenerateScene,
  SceneRegenerationError,
} from "@/lib/ai-core/video-production-platform/scene-regeneration";
import type { AiUsageLease } from "@/lib/billing/ai-usage-settlement";
import { resolveRequestLanguage } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

type Params = { params: Promise<{ id: string; sceneId: string }> };

const bodySchema = z.object({
  planId: z.string().uuid().optional(),
  promptOverride: z.string().trim().min(3).max(4000).optional(),
  providerPreference: z.enum(["veo", "kling", "runway", "heygen", "auto"]).optional(),
  requestId: z.string().trim().min(8).max(128).optional(),
  retry: z.boolean().optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

async function loadGeneration(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("video_generations")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function POST(request: Request, context: Params) {
  const { id: rawProjectId, sceneId: rawSceneId } = await context.params;
  const projectParsed = parseUuidParam(rawProjectId);
  if (projectParsed instanceof NextResponse) return projectParsed;
  const sceneParsed = parseUuidParam(rawSceneId);
  if (sceneParsed instanceof NextResponse) return sceneParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "video-studio");
  if (!usage.ok) return usage.response;
  // Rate-limit + balance gate only. Actual charge is applyVideoStudioCreditOutcome inside regenerateScene.
  const creditLease: AiUsageLease = usage.lease;

  try {
    const generation = await loadGeneration(auth.supabase, auth.user!.id, projectParsed.id);
    if (!generation) {
      return apiNotFoundError(API_ERROR_CODES.VIDEO_NOT_FOUND, "Video project not found.");
    }

    const body = await parseJsonBody<unknown>(request);
    if (body instanceof NextResponse) return body;
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error.issues[0]?.message || "Invalid request body.");
    }

    const planId = parsed.data.planId || (await resolveActivePlanId(auth.supabase, projectParsed.id));
    if (!planId) {
      return apiValidationError("No active plan found for this project.");
    }

    const plan = await loadPlanForProject(auth.supabase, projectParsed.id);
    if (!plan && !parsed.data.planId) {
      return apiValidationError("Active plan not found.");
    }

    const aiLanguage = resolveRequestLanguage(
      request,
      parsed.data.language ?? plan?.language,
      parsed.data.country,
    );

    try {
      const result = await regenerateScene(auth.supabase, {
        userId: auth.user!.id,
        projectId: projectParsed.id,
        planId,
        sceneId: sceneParsed.id,
        options: {
          promptOverride: parsed.data.promptOverride,
          providerPreference: parsed.data.providerPreference,
          requestId: parsed.data.requestId,
          retry: parsed.data.retry,
          aspectRatio: plan?.aspectRatio,
          language: aiLanguage,
        },
      });

      return NextResponse.json({
        sceneId: result.sceneId,
        planId: result.planId,
        attempt: result.attempt,
        jobId: result.jobId,
        status: result.status,
        activeArtifactId: result.activeArtifactId,
        preservedArtifactId: result.preservedArtifactId,
        candidateArtifactId: result.candidateArtifactId,
        reused: result.reused,
        estimatedCost: result.estimatedCost,
        actualCost: result.actualCost,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });
    } catch (error) {
      if (error instanceof SceneRegenerationError) {
        const status =
          error.code === "scene_not_found" || error.code === "plan_not_found"
            ? 404
            : error.code === "foreign_project" || error.code === "foreign_plan" || error.code === "inactive_plan"
              ? 403
              : error.code === "invalid_scene_state"
                ? 409
                : 422;
        const apiCode =
          status === 404
            ? API_ERROR_CODES.NOT_FOUND
            : status === 403
              ? API_ERROR_CODES.FORBIDDEN
              : status === 409
                ? API_ERROR_CODES.CONFLICT
                : API_ERROR_CODES.INVALID_INPUT;
        return apiErrorResponse(apiCode, status, error.message);
      }
      return serverErrorResponse("video-studio.scene-regenerate", error, "Unable to regenerate scene.");
    }
  } finally {
    await creditLease.release(auth.supabase);
  }
}
