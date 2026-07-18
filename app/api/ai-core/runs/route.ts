import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { executeAiCoreRun } from "@/lib/ai-core/runs/service";
import { aiCoreRunCreateSchema } from "@/lib/ai-core/validations";
import { NextResponse } from "next/server";

/**
 * POST /api/ai-core/runs — start a unified AI Core LayerRunner run.
 * Existing product-specific APIs remain available and unchanged.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(
    auth.supabase,
    auth.user!.id,
    "ai-core",
  );
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = aiCoreRunCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await executeAiCoreRun({
    supabase: auth.supabase,
    userId: auth.user!.id,
    body: parsed.data,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    run: result.result.run,
    output: result.result.output,
    progressEvents: result.result.progressEvents,
    layersExecuted: result.result.layersExecuted,
  });
}
