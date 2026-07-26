import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser } from "@/lib/api/helpers";
import { favoriteCreatorTemplate } from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * POST — Toggle favorite for a marketplace listing.
 */
export async function POST(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  try {
    const result = favoriteCreatorTemplate(auth.user!.id, id);
    return NextResponse.json(result);
  } catch {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Template not found.");
  }
}
