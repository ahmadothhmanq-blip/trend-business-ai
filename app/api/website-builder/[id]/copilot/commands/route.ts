import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { beginAiUsage, type AiUsageLease } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import {
  composePlan,
  routeCommand,
  runCopilotCommand,
  capabilityRequiresAi,
  resolveCopilotRoute,
} from "@/lib/ai-core/website-copilot";
import { getRequestAiLanguage } from "@/lib/i18n/api";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 800;

type RouteContext = { params: Promise<{ id: string }> };

const selectionContextSchema = z
  .object({
    source: z.enum(["visual-editor", "none"]).optional(),
    nodeId: z.string().trim().max(120).optional(),
    nodeLabel: z.string().trim().max(200).optional(),
    sectionKind: z.string().trim().max(80).optional(),
    componentExportName: z.string().trim().max(120).optional(),
  })
  .optional();

const commandBodySchema = z.object({
  command: z.string().trim().min(1).max(4000),
  expectedRevision: z.number().int().min(0).optional(),
  idempotencyKey: z.string().trim().min(1).max(128).optional(),
  applyAi: z.boolean().optional(),
  selectionContext: selectionContextSchema,
  useClassifier: z.boolean().optional(),
  sessionId: z.string().trim().min(1).max(128).optional(),
  useMemory: z.boolean().optional(),
  includeReview: z.boolean().optional(),
  linkedAppGenerationId: z.string().uuid().optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

/**
 * POST /api/website-builder/[id]/copilot/commands
 * Website Copilot — unified natural-language command API.
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

  const parsed = commandBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }
  getRequestAiLanguage(request, parsed.data.language, parsed.data.country);

  const useClassifier = parsed.data.useClassifier === true;
  const resolved = useClassifier
    ? await resolveCopilotRoute({
        command: parsed.data.command,
        useClassifier: true,
        userId: auth.user!.id,
        supabase: auth.supabase,
      })
    : {
        match: routeCommand(parsed.data.command),
        resolvedCommand: parsed.data.command.trim(),
        classifierUsed: false,
      };
  const plan = composePlan(resolved.match);
  const needsAi =
    plan.tier === "ai-continue" &&
    parsed.data.applyAi !== false &&
    capabilityRequiresAi(resolved.match.uri);

  let creditLease: AiUsageLease | null = null;

  if (needsAi) {
    const usage = await beginAiUsage(
      auth.supabase,
      auth.user!.id,
      "website-builder",
    );
    if (!usage.ok) return usage.response;
    creditLease = usage.lease;
  }

  try {
    const result = await runCopilotCommand({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      request: parsed.data,
    });

    if (!result.ok) {
      await creditLease?.release(auth.supabase);
      if (result.code === "NOT_FOUND") {
        return apiErrorResponse(API_ERROR_CODES.GENERATION_NOT_FOUND, 404);
      }
      if (result.code === "VALIDATION") {
        return apiValidationError(result.error);
      }
      if (result.code === "CONFLICT") {
        return apiErrorResponse(API_ERROR_CODES.CONFLICT, 409, result.error);
      }
      if (result.code === "PROVIDER_UNAVAILABLE") {
        return apiErrorResponse(
          API_ERROR_CODES.PROVIDER_UNAVAILABLE,
          503,
          result.error,
        );
      }
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, result.error);
    }

    await creditLease?.settle(auth.supabase);
    return NextResponse.json(result);
  } catch (err) {
    await creditLease?.release(auth.supabase);
    return serverErrorResponse(
      "website-builder.copilot.commands",
      err,
      "Unable to run Copilot command.",
    );
  }
}
