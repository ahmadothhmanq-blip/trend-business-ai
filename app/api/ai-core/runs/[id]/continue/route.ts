import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { continueAiCoreRun } from "@/lib/ai-core/runs/service";
import { aiCoreRunContinueSchema } from "@/lib/ai-core/validations";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/ai-core/runs/[id]/continue — continue a prior AI Core run.
 */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(
    auth.supabase,
    auth.user!.id,
    "ai-core",
  );
  if (rateLimited) return rateLimited;

  const { id } = await context.params;
  if (!id) {
    return apiValidationError("Run id is required.");
  }

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = aiCoreRunContinueSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const result = await continueAiCoreRun({
    supabase: auth.supabase,
    userId: auth.user!.id,
    parentRunId: id,
    continueInstruction: parsed.data.continueInstruction,
    provider: parsed.data.provider,
  });

  if (!result.ok) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, result.status, result.error);
  }

  return NextResponse.json({
    run: result.result.run,
    output: result.result.output,
    progressEvents: result.result.progressEvents,
    layersExecuted: result.result.layersExecuted,
  });
}
