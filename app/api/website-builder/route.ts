import { generateWebsiteBlueprint } from "@/lib/ai/website-builder";
import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { websiteBuilderInputSchema } from "@/lib/validations/website-builder";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("website_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(
    ["project_name", "business_description", "website_type"],
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
    generations: data as WebsiteGeneration[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "website-builder");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = websiteBuilderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;

  const { blueprint, source } = await generateWebsiteBlueprint(input);

  const { data, error } = await auth.supabase
    .from("website_generations")
    .insert({
      user_id: auth.user!.id,
      project_name: input.projectName,
      website_type: input.websiteType,
      business_description: input.businessDescription,
      target_audience: input.targetAudience,
      language: input.language,
      color_style: input.colorStyle,
      design_style: input.designStyle,
      page_count: input.pageCount,
      features: input.features,
      blueprint,
      is_favorite: false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    generation: data as WebsiteGeneration,
    message:
      source === "openai"
        ? "Website blueprint generated and saved with AI."
        : "Website blueprint generated and saved.",
  });
}
