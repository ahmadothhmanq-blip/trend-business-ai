import { generateMarketAnalysis } from "@/lib/ai/market-analysis";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter, ilikeContainsPattern } from "@/lib/api/search-filters";
import { marketInputSchema } from "@/lib/validations/market-analysis";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import type { MarketAnalysis } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const industry = searchParams.get("industry")?.trim();

  let query = auth.supabase
    .from("market_analyses")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(
    ["industry", "region", "summary"],
    search,
  );
  if (orFilter) {
    query = query.or(orFilter);
  }

  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const industryPattern = ilikeContainsPattern(industry);
  if (industryPattern) query = query.ilike("industry", industryPattern);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return databaseErrorResponse("market-analysis.list", error);
  }

  const total = count ?? 0;

  return NextResponse.json({
    analyses: data as MarketAnalysis[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "market-analysis");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = marketInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const aiLanguage = resolveRequestLanguage(request, parsed.data.language, parsed.data.country);

  let analysis;
  let source: string;
  try {
    const result = await generateMarketAnalysis({ ...parsed.data, language: aiLanguage });
    analysis = result.analysis;
    source = result.source;
  } catch (error) {
    await creditLease.release(auth.supabase);
    return serverErrorResponse(
      "market-analysis.generate",
      error,
      error instanceof Error ? error.message : "AI market analysis failed.",
    );
  }

  const { data, error } = await auth.supabase
    .from("market_analyses")
    .insert({
      user_id: auth.user!.id,
      industry: analysis.industry,
      region: analysis.region,
      target_audience: parsed.data.targetAudience,
      market_size: analysis.market_size,
      growth_rate: analysis.growth_rate,
      competitors: analysis.competitors,
      opportunities: analysis.opportunities,
      risks: analysis.risks,
      summary: analysis.summary,
      is_favorite: false,
    })
    .select("*")
    .single();

  if (error) {
    await creditLease.release(auth.supabase);
    return databaseErrorResponse("market-analysis.insert", error);
  }

  await creditLease.settle(auth.supabase);
  return NextResponse.json({
    analysis: data as MarketAnalysis,
    message:
      source === "deepseek" || source === "openai" || source === "claude"
        ? "Market analysis generated and saved with AI."
        : "Market analysis generated and saved.",
  });
}
