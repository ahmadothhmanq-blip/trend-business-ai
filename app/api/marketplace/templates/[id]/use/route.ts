import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { applyCreatorTemplate } from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST — Duplicate / use template into Website Builder (records analytics).
 */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const result = applyCreatorTemplate(id);
  if (!result) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Template not found.");
  }
  return NextResponse.json({
    listing: result.listing,
    builderHref: result.builderHref,
    handoff: result.handoff,
  });
}
