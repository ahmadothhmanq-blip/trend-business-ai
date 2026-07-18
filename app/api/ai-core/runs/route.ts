import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { executeAiCoreRun } from "@/lib/ai-core/runs/service";
import { resolveAiCoreProduct } from "@/lib/ai-core/products";
import { aiCoreRunCreateSchema } from "@/lib/ai-core/validations";
import { NextResponse } from "next/server";

/**
 * GET /api/ai-core/runs — list recent AI Core runs for the signed-in user (Phase 9).
 * Additive list endpoint; does not change POST create contract.
 */
export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") || "12") || 12),
  );
  const productId = searchParams.get("productId")?.trim();

  let query = auth.supabase
    .from("ai_runs")
    .select(
      "id, product_id, status, mode, layers_executed, artifacts, error_message, generation_time_ms, created_at, updated_at",
    )
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (productId) {
    const resolved = resolveAiCoreProduct(productId);
    query = query.eq("product_id", resolved?.id ?? productId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load AI runs" },
      { status: 500 },
    );
  }

  return NextResponse.json({ runs: data ?? [] });
}

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
