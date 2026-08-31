import { generateBusinessIdeas } from "@/lib/ai/business-ideas";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import {
  ideaInputSchema,
} from "@/lib/validations/ideas";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import type { BusinessIdea } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("business_ideas")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(
    ["title", "description", "industry"],
    search,
  );
  if (orFilter) {
    query = query.or(orFilter);
  }

  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return databaseErrorResponse("ideas.list", error);
  }

  const total = count ?? 0;

  return NextResponse.json({
    ideas: data as BusinessIdea[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "ideas");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = ideaInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const aiLanguage = resolveRequestLanguage(request, parsed.data.language, parsed.data.country);

  let generated;
  let source: string;
  try {
    const result = await generateBusinessIdeas({ ...parsed.data, language: aiLanguage });
    generated = result.ideas;
    source = result.source;
  } catch (error) {
    await creditLease.release(auth.supabase);
    return serverErrorResponse(
      "ideas.generate",
      error,
      error instanceof Error ? error.message : "AI idea generation failed.",
    );
  }

  const rows = generated.map((idea) => ({
    user_id: auth.user!.id,
    title: idea.title,
    description: idea.description,
    industry: idea.industry,
    target_market: idea.target_market,
    revenue_model: idea.revenue_model,
    is_favorite: false,
  }));

  const { data, error } = await auth.supabase
    .from("business_ideas")
    .insert(rows)
    .select("*");

  if (error) {
    await creditLease.release(auth.supabase);
    return databaseErrorResponse("ideas.insert", error);
  }

  await creditLease.settle(auth.supabase);
  return NextResponse.json({
    ideas: data as BusinessIdea[],
    message:
      source === "deepseek" || source === "openai" || source === "claude"
        ? "3 new ideas generated and saved with AI."
        : "3 new ideas generated and saved.",
  });
}
