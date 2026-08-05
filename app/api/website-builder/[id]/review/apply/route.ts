import { NextResponse } from "next/server";
import { z } from "zod";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";
import { executeWebsiteReviewApply } from "@/lib/website/platform/services/review-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const applySchema = z.object({
  improvementIds: z.array(z.string().uuid()).min(1).max(12),
  expectedRevision: z.number().int().min(0).optional(),
  idempotencyKey: z.string().trim().max(128).optional(),
});

/**
 * POST — Apply selected Review Studio improvements (targeted only).
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400);
  }

  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const access = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
    "edit",
  );
  if (access instanceof NextResponse) return access;

  const result = await executeWebsiteReviewApply({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: parsedId.id,
    improvementIds: parsed.data.improvementIds,
    commit: {
      expectedRevision: parsed.data.expectedRevision,
      idempotencyKey: parsed.data.idempotencyKey,
    },
  });

  if (!result.ok) {
    if (result.code === "CONFLICT") {
      return apiErrorResponse(API_ERROR_CODES.CONFLICT, 409, result.error);
    }
    return apiValidationError(result.error);
  }

  return NextResponse.json({
    success: true,
    project: result.project,
    generation: result.generation,
    comparison: result.comparison,
    appliedChanges: result.appliedChanges,
    review: result.review,
    revision: result.revision,
    message: result.appliedChanges.join("; "),
  });
}
