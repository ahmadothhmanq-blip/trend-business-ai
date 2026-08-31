import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";
import { loadWebsiteReview } from "@/lib/website/platform/services/review-service";
import { logApiError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — Run AI Website Review Studio analysis.
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const access = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
    "view",
  );
  if (access instanceof NextResponse) return access;

  try {
    const result = await loadWebsiteReview({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: parsedId.id,
    });

    if (!result.ok) {
      return apiValidationError(result.error);
    }

    return NextResponse.json({
      review: result.review,
      projectName: result.projectName,
      persistedState: result.persistedState,
      generationId: parsedId.id,
    });
  } catch (error) {
    logApiError("website-builder.review.get", error);
    return apiErrorResponse(
      API_ERROR_CODES.SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Website review failed.",
    );
  }
}
