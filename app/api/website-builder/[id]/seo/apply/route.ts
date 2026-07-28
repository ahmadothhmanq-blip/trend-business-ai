import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { z } from "zod";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";
import { executeWebsiteSeoApply } from "@/lib/website/platform/services/seo-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const applySchema = z.object({
  fixId: z.string().trim().min(1).max(120),
  /** When true, also run editor actions for dual-mode fixes. */
  applyEditor: z.boolean().optional(),
  expectedRevision: z.number().int().min(0).optional(),
  idempotencyKey: z.string().trim().max(128).optional(),
});

/**
 * POST — Apply a single SEO Agent fix (package inject and/or editor actions).
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

  try {
    const result = await executeWebsiteSeoApply({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: parsedId.id,
      request: {
        fixId: parsed.data.fixId,
        applyEditor: parsed.data.applyEditor,
      },
      commit: {
        expectedRevision: parsed.data.expectedRevision,
        idempotencyKey: parsed.data.idempotencyKey,
      },
    });

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, result.error);
      }
      if (result.code === "VALIDATION") {
        return apiValidationError(result.error);
      }
      if (result.code === "CONFLICT") {
        return apiErrorResponse(API_ERROR_CODES.CONFLICT, 409, result.error);
      }
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, result.error);
    }

    return NextResponse.json({
      success: true,
      fix: result.fix,
      notes: result.notes,
      report: result.report,
      project: result.project,
      generation: result.generation,
      message: `Applied: ${result.fix.title}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apply fix failed";
    return apiValidationError(message);
  }
}
