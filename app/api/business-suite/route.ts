import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateBusiness } from "@/lib/business-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { resolveIteratedPrompt } from "@/lib/ai/iteration";
import { getBusinessToolLabel, getBusinessTypeLabel } from "@/lib/constants/business-suite";
import type { BusinessGeneration, BusinessBlueprint } from "@/types/business";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Describe your business context in at least 5 characters."),
  businessTool: z.string().trim().min(1, "Select a business tool."),
  businessType: z.string().trim().min(1, "Select a business type."),
  industry: z.string().trim().default("Technology"),
  companyStage: z.string().trim().default("Startup"),
  targetMarket: z.string().trim().default(""),
  options: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "update", "expand"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  continueInstruction: z.string().trim().max(4000).optional(),
  projectId: z.string().uuid().optional(),
});

function logError(stage: string, error: unknown) {
  const msg = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error, null, 2);
  console.error(`[business-suite:${stage}]`, msg);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const tool = searchParams.get("tool");

  let query = auth.supabase
    .from("business_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["title", "description", "business_tool", "business_type", "industry"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (tool) query = query.eq("business_tool", tool);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ generations: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("business-suite.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({ generations: data as BusinessGeneration[], page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "business-suite");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  let stage = "generateBusiness";

  try {
    const iterated = await resolveIteratedPrompt({
      supabase: auth.supabase,
      table: "business_generations",
      userId: auth.user!.id,
      mode: input.mode,
      prompt: input.prompt,
      continueInstruction: input.continueInstruction,
      parentGenerationId: input.parentGenerationId,
      titleField: "title",
    });
    if (!iterated.ok) {
      return NextResponse.json({ error: iterated.error }, { status: iterated.status });
    }

    const result = await generateBusiness({
      prompt: iterated.prompt,
      businessTool: input.businessTool,
      businessType: input.businessType,
      industry: input.industry,
      companyStage: input.companyStage,
      targetMarket: input.targetMarket,
      options: input.options,
    });

    const blueprint: BusinessBlueprint = {
      title: result.title,
      businessTool: input.businessTool,
      businessType: input.businessType,
      executiveSummary: result.executiveSummary,
      body: result.body,
      sections: result.sections,
      scorecard: result.scorecard,
      risks: result.risks,
      opportunities: result.opportunities,
      actionPlan: result.actionPlan,
      recommendations: result.recommendations,
      improvements: result.improvements,
      files: result.files,
      prompt: input.prompt,
      industry: input.industry,
      companyStage: input.companyStage,
      targetMarket: input.targetMarket,
      generatedAt: new Date().toISOString(),
      progressEvents: [...result.progressEvents, "Saving...", "Done."],
    };

    stage = "supabase.insert.business_generations";

    const row = {
      user_id: auth.user!.id,
      title: result.title || `${getBusinessToolLabel(input.businessTool)} — ${getBusinessTypeLabel(input.businessType)}`,
      business_tool: input.businessTool,
      business_type: input.businessType,
      description: result.executiveSummary || input.prompt,
      prompt: input.prompt,
      industry: input.industry,
      company_stage: input.companyStage,
      target_market: input.targetMarket,
      options: input.options,
      blueprint: blueprint as unknown as Record<string, unknown>,
      status: "completed",
      mode: input.mode ?? "generate",
      provider: result.provider ?? getActiveProvider(),
      token_usage: result.usage,
      generation_time_ms: result.generationTimeMs,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase.from("business_generations").insert(row).select("*").single();

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return NextResponse.json({ error: "Business Suite table not found. Please apply migration 020." }, { status: 503 });
      }
      logError(stage, error);
      return databaseErrorResponse("business-suite.insert", error);
    }

    return NextResponse.json({ generation: data as BusinessGeneration, message: "Business analysis generated and saved." });
  } catch (error) {
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate business analysis.");
  }
}
