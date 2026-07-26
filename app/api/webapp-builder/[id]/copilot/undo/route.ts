import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import { restoreAppCopilotSnapshot } from "@/lib/ai-core/app-copilot";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

const undoBodySchema = z.object({
  snapshot: z.object({
    model: z.record(z.string(), z.unknown()),
    files: z.array(z.record(z.string(), z.unknown())).optional(),
  }),
  expectedRevision: z.number().int().min(0).optional(),
});

/**
 * POST /api/webapp-builder/[id]/copilot/undo
 * Restore a prior in-memory App Copilot snapshot (Phase 4 parity).
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = undoBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  try {
    const result = await restoreAppCopilotSnapshot({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      model: parsed.data.snapshot.model as StructuredAppModel,
      files: parsed.data.snapshot.files as GeneratedProjectFile[] | undefined,
      expectedRevision: parsed.data.expectedRevision,
    });

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return apiErrorResponse(API_ERROR_CODES.GENERATION_NOT_FOUND, 404);
      }
      if (result.code === "VALIDATION") {
        return apiValidationError(result.error);
      }
      if (result.code === "CONFLICT") {
        return apiErrorResponse(API_ERROR_CODES.CONFLICT, 409, result.error);
      }
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, result.error);
    }

    return NextResponse.json(result);
  } catch (err) {
    return serverErrorResponse(
      "webapp-builder.copilot.undo",
      err,
      "Unable to undo App Copilot change.",
    );
  }
}
