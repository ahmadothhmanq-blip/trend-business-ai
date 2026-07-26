import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { apiValidationError } from "@/lib/i18n/api-errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { createSseStreamHelpers } from "@/lib/api/sse-stream";
import {
  composeAppPlan,
  appCapabilityRequiresAi,
  resolveAppCopilotRoute,
  runAppCopilotCommandStream,
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

const streamBodySchema = z.object({
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
 * POST /api/webapp-builder/[id]/copilot/stream
 * App Copilot — SSE progress stream (Phase 4 parity).
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

  const parsed = streamBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const useClassifier = parsed.data.useClassifier !== false;
  const resolved = await resolveAppCopilotRoute({
    command: parsed.data.command,
    useClassifier,
    userId: auth.user!.id,
    supabase: auth.supabase,
  });
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

  const stream = new ReadableStream({
    async start(controller) {
      const { send, close } = createSseStreamHelpers(
        controller,
        "app-copilot-stream",
      );

      try {
        await runAppCopilotCommandStream({
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: id,
          request: { ...parsed.data, useClassifier },
          send: (event, data) => send(event, data),
        });
      } catch (err) {
        send("error", {
          error:
            err instanceof Error
              ? err.message
              : "Unable to run App Copilot stream.",
        });
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
