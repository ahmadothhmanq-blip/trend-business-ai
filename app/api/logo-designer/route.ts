import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateLogo } from "@/lib/logo-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { getLogoStyleLabel } from "@/lib/constants/logo-designer";
import type { LogoGeneration, LogoBlueprint } from "@/types/logo";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Describe your logo in at least 5 characters."),
  brandName: z.string().trim().min(1, "Provide a brand name."),
  logoStyle: z.string().trim().min(1, "Select a logo style."),
  industry: z.string().trim().default(""),
  colorPalette: z.string().trim().default("Auto"),
  iconStyle: z.string().trim().default("Abstract"),
  typography: z.string().trim().default("Auto"),
  personality: z.string().trim().default("Professional"),
  options: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

function logError(stage: string, error: unknown) {
  const stack = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error, null, 2);
  console.error(`[logo-designer:${stage}]`, stack);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("logo_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["logo_name", "description", "logo_style"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ generations: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("logo-designer.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    generations: data as LogoGeneration[],
    page, limit, total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "logo-designer");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const styleLabel = getLogoStyleLabel(input.logoStyle);
  let stage = "generateLogo";

  try {
    const project = await generateLogo({
      prompt: input.prompt,
      brandName: input.brandName,
      logoStyle: input.logoStyle,
      industry: input.industry,
      colorPalette: input.colorPalette,
      iconStyle: input.iconStyle,
      typography: input.typography,
      personality: input.personality,
      options: input.options,
    });

    const blueprint: LogoBlueprint = {
      title: project.title,
      description: project.description,
      logoStyle: project.logoStyle,
      concepts: project.concepts,
      colorPalette: project.colorPalette,
      typography: project.typography,
      variations: project.variations,
      guidelines: project.guidelines,
      files: project.files,
      prompt: input.prompt,
      generatedAt: new Date().toISOString(),
      progressEvents: [...project.progressEvents, "Saving project...", "Done."],
    };

    stage = "supabase.insert.logo_generations";

    const row = {
      user_id: auth.user!.id,
      logo_name: project.title || `${styleLabel} Logo`,
      logo_style: input.logoStyle,
      description: project.description || input.prompt,
      industry: input.industry,
      color_palette: input.colorPalette,
      icon_style: input.iconStyle,
      options: input.options,
      prompt: input.prompt,
      blueprint: blueprint as unknown as Record<string, unknown>,
      status: "completed",
      mode: input.mode ?? "generate",
      provider: project.provider ?? getActiveProvider(),
      token_usage: project.usage,
      generation_time_ms: project.generationTimeMs,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase
      .from("logo_generations")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return NextResponse.json({ error: "Logo Designer table not found. Please apply migration 015." }, { status: 503 });
      }
      logError(stage, error);
      return databaseErrorResponse("logo-designer.insert", error);
    }

    return NextResponse.json({
      generation: data as LogoGeneration,
      message: "Logo designed and saved.",
    });
  } catch (error) {
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate logo.");
  }
}
