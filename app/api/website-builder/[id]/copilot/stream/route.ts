import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { apiValidationError } from "@/lib/i18n/api-errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import type { AiUsageLease } from "@/lib/billing/ai-usage-settlement";
import { createSseStreamHelpers } from "@/lib/api/sse-stream";
import {
  composePlan,
  capabilityRequiresAi,
  resolveCopilotRoute,
  runCopilotCommandStream,
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
  linkedAppGenerationId: z.string().uuid().optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

/**
 * POST /api/website-builder/[id]/copilot/stream
 * Website Copilot — SSE progress stream for long-running commands.
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
  getRequestAiLanguage(request, parsed.data.language, parsed.data.country);

  const useClassifier = parsed.data.useClassifier !== false;
  const resolved = await resolveCopilotRoute({
    command: parsed.data.command,
    useClassifier,
    userId: auth.user!.id,
    supabase: auth.supabase,
  });
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

  const stream = new ReadableStream({
    async start(controller) {
      const { send, close } = createSseStreamHelpers(
        controller,
        "copilot-stream",
      );

      try {
        await runCopilotCommandStream({
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: id,
          request: {
            ...parsed.data,
            useClassifier,
          },
          send: (event, data) => send(event, data),
        });
        if (creditLease) await creditLease.settle(auth.supabase);
      } catch (err) {
        if (creditLease) await creditLease.release(auth.supabase);
        send("error", {
          error:
            err instanceof Error
              ? err.message
              : "Unable to run Copilot stream.",
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
