import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateLandingPage } from "@/lib/landing-page-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { getLandingPageTypeLabel } from "@/lib/constants/landing-page-builder";
import type { LandingPageGeneration, LandingPageBlueprint } from "@/types/landing-page";
import { NextResponse } from "next/server";
import { z } from "zod";

const lpRequestSchema = z.object({
  prompt: z.string().trim().min(10, "Describe your landing page in at least 10 characters."),
  pageType: z.string().trim().min(1, "Select a page type."),
  language: z.string().trim().min(1, "Select a language."),
  designStyle: z.string().trim().min(1, "Select a design style."),
  colorStyle: z.string().trim().min(1, "Select a color style."),
  sections: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

function logError(stage: string, error: unknown) {
  const stack = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error, null, 2);
  console.error(`[landing-page-builder:${stage}]`, stack);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const pageType = searchParams.get("pageType")?.trim();

  let query = auth.supabase
    .from("landing_page_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["page_name", "description", "page_type"], search);
  if (orFilter) query = query.or(orFilter);
  if (pageType) query = query.eq("page_type", pageType);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ generations: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("landing-page-builder.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    generations: data as LandingPageGeneration[],
    page, limit, total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "landing-page-builder");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = lpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const pageLabel = getLandingPageTypeLabel(input.pageType);
  let stage = "generateLandingPage";

  try {
    const project = await generateLandingPage({
      prompt: input.prompt,
      pageType: input.pageType,
      language: input.language,
      designStyle: input.designStyle,
      colorStyle: input.colorStyle,
      sections: input.sections,
    });

    const savedProject = {
      ...project,
      prompt: input.prompt,
      generatedAt: new Date().toISOString(),
      progressEvents: [...(project.progressEvents ?? []), "Saving project...", "Done."],
    };

    stage = "supabase.insert.landing_page_generations";

    const row = {
      user_id: auth.user!.id,
      page_name: savedProject.title || `${pageLabel} Landing Page`,
      page_type: input.pageType,
      description: savedProject.description || input.prompt,
      language: input.language,
      design_style: input.designStyle,
      color_style: input.colorStyle,
      sections: input.sections,
      prompt: input.prompt,
      blueprint: savedProject as unknown as LandingPageBlueprint,
      status: "completed",
      mode: input.mode ?? "generate",
      provider: project.provider ?? getActiveProvider(),
      token_usage: project.usage,
      generation_time_ms: project.generationTimeMs,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase
      .from("landing_page_generations")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return NextResponse.json(
          { error: "Landing Page Builder table not found. Please apply migration 014." },
          { status: 503 },
        );
      }
      logError(stage, error);
      return databaseErrorResponse("landing-page-builder.insert", error);
    }

    return NextResponse.json({
      project: savedProject,
      generation: data as LandingPageGeneration,
      message: "Landing page generated and saved.",
    });
  } catch (error) {
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate landing page.");
  }
}
