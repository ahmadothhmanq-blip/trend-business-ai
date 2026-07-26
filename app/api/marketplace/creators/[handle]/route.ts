import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { getPublicCreatorProfile } from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ handle: string }> };

/**
 * GET — Public creator profile by handle or id.
 */
export async function GET(_request: Request, { params }: Params) {
  const { handle } = await params;
  const result = getPublicCreatorProfile(handle);
  if (!result) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Creator not found.");
  }
  return NextResponse.json(result);
}
