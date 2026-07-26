import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser } from "@/lib/api/helpers";
import {
  buildUseTemplateHref,
  getCreatorMarketplaceListingDetail,
} from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — Listing detail + live preview HTML.
 */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireUser();
  const detail = getCreatorMarketplaceListingDetail(id, auth.user?.id ?? null);
  if (!detail) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Template not found.");
  }
  return NextResponse.json({
    ...detail,
    builderHref: buildUseTemplateHref(detail.listing),
  });
}
