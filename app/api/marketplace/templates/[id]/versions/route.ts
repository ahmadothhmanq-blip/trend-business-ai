import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { z } from "zod";
import { requireUser } from "@/lib/api/helpers";
import { versionCreatorTemplate } from "@/lib/marketplace/templates";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const versionSchema = z.object({
  version: z.string().trim().min(1).max(32),
  changelog: z.string().trim().min(1).max(1000),
  premiumTemplateId: z.string().trim().max(80).optional(),
  marketplaceTemplateId: z.string().trim().max(120).optional(),
});

/**
 * POST — Add a new version to a creator-owned listing.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400);
  }

  const parsed = versionSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  try {
    const listing = versionCreatorTemplate({
      listingId: id,
      userId: auth.user!.id,
      ...parsed.data,
    });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Version failed";
    const status = message.includes("Not allowed") ? 403 : 404;
    const code = status === 403 ? API_ERROR_CODES.FORBIDDEN : API_ERROR_CODES.NOT_FOUND;
    return apiErrorResponse(code, status, message);
  }
}
