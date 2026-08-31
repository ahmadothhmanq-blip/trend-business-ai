import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { executeAiCoreRun } from "@/lib/ai-core/runs/service";
import { resolveAiCoreProduct } from "@/lib/ai-core/products";
import { aiCoreRunCreateSchema } from "@/lib/ai-core/validations";
import { getRequestAiLanguage } from "@/lib/i18n/api";
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
    return apiErrorResponse(API_ERROR_CODES.LOAD_FAILED, 500, error.message || "Failed to load AI runs");
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

  const usage = await beginAiUsage(
    auth.supabase,
    auth.user!.id,
    "ai-core",
  );
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = aiCoreRunCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const language = getRequestAiLanguage(request, parsed.data.language, parsed.data.country);
  const result = await executeAiCoreRun({
    supabase: auth.supabase,
    userId: auth.user!.id,
    body: { ...parsed.data, language },
  });

  if (!result.ok) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, result.status, result.error);
  }

  await creditLease.settle(auth.supabase);
  return NextResponse.json({
    run: result.result.run,
    output: result.result.output,
    progressEvents: result.result.progressEvents,
    layersExecuted: result.result.layersExecuted,
  });
}
