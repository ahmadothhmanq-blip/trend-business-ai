import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateWebApp } from "@/lib/webapp-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { getWebAppTypeLabel } from "@/lib/constants/webapp-builder";
import type { WebAppGeneration, WebAppBlueprint } from "@/types/webapp";
import { NextResponse } from "next/server";
import { z } from "zod";

const webappRequestSchema = z.object({
  prompt: z.string().trim().min(10, "Describe your app in at least 10 characters."),
  appType: z.string().trim().min(1, "Select an app type."),
  language: z.string().trim().min(1, "Select a language."),
  designStyle: z.string().trim().min(1, "Select a design style."),
  colorStyle: z.string().trim().min(1, "Select a color style."),
  features: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

function logWebAppBuilderError(stage: string, error: unknown) {
  const stack =
    error instanceof Error
      ? (error.stack ?? error.message)
      : JSON.stringify(error, null, 2);
  console.error(`[webapp-builder:${stage}]`, stack);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const appType = searchParams.get("appType")?.trim();

  let query = auth.supabase
    .from("webapp_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(
    ["app_name", "description", "app_type"],
    search,
  );
  if (orFilter) query = query.or(orFilter);

  if (appType) query = query.eq("app_type", appType);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (
      error.code === "42P01" ||
      (typeof error.message === "string" && error.message.includes("relation"))
    ) {
      return NextResponse.json({
        generations: [],
        page,
        limit,
        total: 0,
        totalPages: 1,
      });
    }
    return databaseErrorResponse("webapp-builder.list", error);
  }

  const total = count ?? 0;

  return NextResponse.json({
    generations: data as WebAppGeneration[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "webapp-builder");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = webappRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const appLabel = getWebAppTypeLabel(input.appType);

  let stage = "generateWebApp";

  try {
    const project = await generateWebApp({
      prompt: input.prompt,
      appType: input.appType,
      language: input.language,
      designStyle: input.designStyle,
      colorStyle: input.colorStyle,
      features: input.features,
    });

    const savedProject = {
      ...project,
      prompt: input.prompt,
      generatedAt: new Date().toISOString(),
      progressEvents: [
        ...(project.progressEvents ?? []),
        "Saving project..." as const,
        "Done." as const,
      ],
    };

    stage = "supabase.insert.webapp_generations";

    const row = {
      user_id: auth.user!.id,
      app_name: savedProject.title || `${appLabel} App`,
      app_type: input.appType,
      description: savedProject.description || input.prompt,
      language: input.language,
      design_style: input.designStyle,
      color_style: input.colorStyle,
      features: input.features,
      prompt: input.prompt,
      blueprint: savedProject as unknown as WebAppBlueprint,
      status: "completed",
      mode: input.mode ?? "generate",
      provider: project.provider ?? getActiveProvider(),
      token_usage: project.usage,
      generation_time_ms: project.generationTimeMs,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase
      .from("webapp_generations")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      if (
        error.code === "42P01" ||
        (typeof error.message === "string" && error.message.includes("relation"))
      ) {
        return NextResponse.json(
          { error: "Web App Builder table not found. Please apply migration 013." },
          { status: 503 },
        );
      }
      logWebAppBuilderError(stage, error);
      return databaseErrorResponse("webapp-builder.insert", error);
    }

    return NextResponse.json({
      project: savedProject,
      generation: data as WebAppGeneration,
      message: "Web app generated and saved.",
    });
  } catch (error) {
    logWebAppBuilderError(stage, error);
    return serverErrorResponse(
      stage,
      error,
      "Unable to generate web application.",
    );
  }
}
