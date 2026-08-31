import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { executeWebsiteEdit } from "@/lib/website/platform/services/edit-service";
import type { WebsiteEditAction } from "@/lib/ai-core/website-editor";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getRequestAiLanguage } from "@/lib/i18n/api";

export const runtime = "nodejs";
export const maxDuration = 800;

type RouteContext = { params: Promise<{ id: string }> };

const editBodySchema = z.object({
  command: z.string().trim().max(4000).optional(),
  /** Apply a suggestion by id (uses suggestion.command / actions). */
  suggestionId: z.string().trim().max(80).optional(),
  actions: z
    .array(
      z.object({
        type: z.string(),
        target: z.string().optional(),
        value: z.string().optional(),
        sectionKind: z.string().optional(),
        componentId: z.string().optional(),
        replaceWith: z.string().optional(),
        notes: z.string().optional(),
        fromIndex: z.number().int().optional(),
        toIndex: z.number().int().optional(),
      }),
    )
    .max(40)
    .optional(),
  /** When true (default), run AI continue for remaining rewrite/conversion intents. */
  applyAi: z.boolean().optional(),
  /** Phase 0 — optional optimistic concurrency (blueprint revision). */
  expectedRevision: z.number().int().min(0).optional(),
  /** Phase 0 — optional idempotent replay key. */
  idempotencyKey: z.string().trim().max(128).optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

/**
 * POST /api/website-builder/[id]/edit
 * Website Editor Intelligence — natural-language edits on a saved generation.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(
    auth.supabase,
    auth.user!.id,
    "website-builder",
  );
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = editBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  getRequestAiLanguage(request, parsed.data.language, parsed.data.country);

  try {
    const result = await executeWebsiteEdit({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      request: {
        command: parsed.data.command,
        suggestionId: parsed.data.suggestionId,
        actions: (parsed.data.actions || []) as WebsiteEditAction[],
        applyAi: parsed.data.applyAi,
      },
      commit: {
        expectedRevision: parsed.data.expectedRevision,
        idempotencyKey: parsed.data.idempotencyKey,
      },
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

    await creditLease.settle(auth.supabase);
    return NextResponse.json({
      project: result.project,
      generation: result.generation,
      editResult: result.editResult,
      message: "Website edited with Website Editor Intelligence.",
    });
  } catch (err) {
    return serverErrorResponse(
      "website-builder.edit",
      err,
      "Unable to edit website.",
    );
  }
}
