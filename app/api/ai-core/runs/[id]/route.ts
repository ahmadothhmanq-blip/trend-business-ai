import { requireUser } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { getAiCoreRun } from "@/lib/ai-core/runs/service";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/ai-core/runs/[id] — fetch a persisted AI Core run.
 */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  if (!id) {
    return apiValidationError("Run id is required.");
  }

  const result = await getAiCoreRun(auth.supabase, auth.user!.id, id);
  if (result.missingTable) {
    return apiErrorResponse(
      API_ERROR_CODES.MIGRATION_REQUIRED,
      503,
      "AI Core runs table not found. Apply migration 033_ai_runs.sql.",
    );
  }
  if (result.error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, result.error);
  }
  if (!result.run) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Run not found.");
  }

  return NextResponse.json({ run: result.run });
}
