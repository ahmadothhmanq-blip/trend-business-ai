import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateBrandIdentity } from "@/lib/brand-identity-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { getBrandTypeLabel } from "@/lib/constants/brand-identity-builder";
import type { BrandIdentityGeneration, BrandIdentityBlueprint } from "@/types/brand-identity";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Describe your brand in at least 5 characters."),
  brandName: z.string().trim().min(1, "Provide a brand name."),
  brandType: z.string().trim().min(1, "Select a brand type."),
  industry: z.string().trim().default(""),
  targetAudience: z.string().trim().default(""),
  brandPersonality: z.string().trim().default("Professional"),
  deliverables: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

function logError(stage: string, error: unknown) {
  const stack = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error, null, 2);
  console.error(`[brand-identity:${stage}]`, stack);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("brand_identity_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["brand_name", "description", "brand_type"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ generations: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("brand-identity.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    generations: data as BrandIdentityGeneration[],
    page, limit, total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "brand-identity");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const typeLabel = getBrandTypeLabel(input.brandType);
  let stage = "generateBrandIdentity";

  try {
    const result = await generateBrandIdentity({
      prompt: input.prompt,
      brandName: input.brandName,
      brandType: input.brandType,
      industry: input.industry,
      targetAudience: input.targetAudience,
      brandPersonality: input.brandPersonality,
      deliverables: input.deliverables,
    });

    const blueprint: BrandIdentityBlueprint = {
      title: result.title,
      description: result.description,
      brandType: result.brandType,
      mission: result.mission,
      vision: result.vision,
      values: result.values,
      voiceTone: result.voiceTone,
      colorPalette: result.colorPalette,
      typography: result.typography,
      logoGuidelines: result.logoGuidelines,
      brandStory: result.brandStory,
      brandStrategy: result.brandStrategy,
      assets: result.assets,
      files: result.files,
      prompt: input.prompt,
      generatedAt: new Date().toISOString(),
      progressEvents: [...result.progressEvents, "Saving...", "Done."],
    };

    stage = "supabase.insert.brand_identity_generations";

    const row = {
      user_id: auth.user!.id,
      brand_name: result.title || `${typeLabel} Brand`,
      brand_type: input.brandType,
      description: result.description || input.prompt,
      industry: input.industry,
      target_audience: input.targetAudience,
      brand_personality: input.brandPersonality,
      deliverables: input.deliverables,
      prompt: input.prompt,
      blueprint: blueprint as unknown as Record<string, unknown>,
      status: "completed",
      mode: input.mode ?? "generate",
      provider: result.provider ?? getActiveProvider(),
      token_usage: result.usage,
      generation_time_ms: result.generationTimeMs,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase
      .from("brand_identity_generations")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return NextResponse.json({ error: "Brand Identity table not found. Please apply migration 016." }, { status: 503 });
      }
      logError(stage, error);
      return databaseErrorResponse("brand-identity.insert", error);
    }

    return NextResponse.json({
      generation: data as BrandIdentityGeneration,
      message: "Brand identity designed and saved.",
    });
  } catch (error) {
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate brand identity.");
  }
}
