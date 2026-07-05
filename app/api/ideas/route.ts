import { generateBusinessIdeas } from "@/lib/ai/business-ideas";
import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import {
  ideaInputSchema,
} from "@/lib/validations/ideas";
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
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "ideas");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = ideaInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { ideas: generated, source } = await generateBusinessIdeas(parsed.data);

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ideas: data as BusinessIdea[],
    message:
      source === "openai"
        ? "3 new ideas generated and saved with AI."
        : "3 new ideas generated and saved.",
  });
}
