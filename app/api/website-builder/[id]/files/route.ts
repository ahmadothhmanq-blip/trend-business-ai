import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiNotFoundError,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { patchWebsiteFile } from "@/lib/website/platform/services/files-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  path: z.string().trim().min(1).max(500),
  content: z.string().max(500_000),
});

/**
 * PATCH /api/website-builder/[id]/files — save a single project file (Pro IDE).
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const result = await patchWebsiteFile({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: idParsed.id,
    request: parsed.data,
  });

  if (!result.ok) {
    if (result.code === "NOT_FOUND") {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, result.error);
    }
    return apiErrorResponse(API_ERROR_CODES.INVALID_INPUT, 400, result.error);
  }

  return NextResponse.json({
    project: result.project,
    generation: result.generation,
    revision: result.revision,
    message: "File saved.",
  });
}
