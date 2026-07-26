import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import {
  composeAppPlan,
  routeAppCommand,
  runAppCopilotCommand,
  appCapabilityRequiresAi,
  resolveAppCopilotRoute,
} from "@/lib/ai-core/app-copilot";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 800;

type RouteContext = { params: Promise<{ id: string }> };

const selectionContextSchema = z
  .object({
    source: z.enum(["visual-editor", "none"]).optional(),
    nodeId: z.string().trim().max(120).optional(),
    screenId: z.string().trim().max(120).optional(),
    componentType: z.string().trim().max(120).optional(),
    nodeLabel: z.string().trim().max(200).optional(),
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
  linkedWebsiteGenerationId: z.string().uuid().optional(),
});

/**
 * POST /api/webapp-builder/[id]/copilot/commands
 * App Copilot — unified natural-language command API (Phase 4 parity).
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

  const useClassifier = parsed.data.useClassifier === true;
  const resolved = useClassifier
    ? await resolveAppCopilotRoute({
        command: parsed.data.command,
        useClassifier: true,
        userId: auth.user!.id,
        supabase: auth.supabase,
      })
    : {
        match: routeAppCommand(parsed.data.command),
        resolvedCommand: parsed.data.command.trim(),
        classifierUsed: false,
      };
  const plan = composeAppPlan(resolved.match);
  const needsAi =
    plan.tier === "ai-continue" &&
    parsed.data.applyAi !== false &&
    appCapabilityRequiresAi(resolved.match.uri);

  if (needsAi) {
    const rateLimited = await enforceAiUsage(
      auth.supabase,
      auth.user!.id,
      "webapp-builder",
    );
    if (rateLimited) return rateLimited;
  }

  try {
    const result = await runAppCopilotCommand({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: id,
      request: parsed.data,
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
      if (result.code === "PROVIDER_UNAVAILABLE") {
        return apiErrorResponse(
          API_ERROR_CODES.PROVIDER_UNAVAILABLE,
          503,
          result.error,
        );
      }
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, result.error);
    }

    return NextResponse.json(result);
  } catch (err) {
    return serverErrorResponse(
      "webapp-builder.copilot.commands",
      err,
      "Unable to run App Copilot command.",
    );
  }
}
