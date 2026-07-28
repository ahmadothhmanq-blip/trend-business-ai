import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { buildWebsiteAnalyticsSummary } from "@/lib/ai-core/analytics";
import { runConversionOptimizer } from "@/lib/ai-core/conversion-optimizer";
import type { ConversionOptimizationReport } from "@/lib/ai-core/conversion";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — Website analytics dashboard + AI conversion insights.
 */
export async function GET(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const { searchParams } = new URL(request.url);
  const rangeDays = Math.min(
    90,
    Math.max(7, Number(searchParams.get("days") ?? 14) || 14),
  );

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
    "view",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const generation = accessResult.generation;

  const blueprint = (generation.blueprint ?? {}) as {
    conversionReport?: ConversionOptimizationReport | null;
    businessProfile?: { industry?: string };
    strategy?: { industry?: string };
  };

  const summary = await buildWebsiteAnalyticsSummary(
    parsedId.id,
    rangeDays,
    auth.supabase,
  );
  const optimizer = await runConversionOptimizer({
    generationId: parsedId.id,
    conversionReport: blueprint.conversionReport ?? null,
    industry:
      blueprint.businessProfile?.industry ||
      blueprint.strategy?.industry ||
      null,
    projectName: generation.project_name,
    client: auth.supabase,
  });

  return NextResponse.json({
    summary,
    optimizer,
    generationId: parsedId.id,
    projectName: generation.project_name,
  });
}
