import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateContent } from "@/lib/content-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { getContentToolLabel, getContentTypeLabel } from "@/lib/constants/content-studio";
import type { ContentGeneration, ContentBlueprint } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Describe your content in at least 5 characters."),
  contentTool: z.string().trim().min(1, "Select a content tool."),
  contentType: z.string().trim().min(1, "Select a content type."),
  tone: z.string().trim().default("Professional"),
  audience: z.string().trim().default("General"),
  language: z.string().trim().default("English"),
  brandVoice: z.string().trim().default(""),
  writingStyle: z.string().trim().default("Standard"),
  creativityLevel: z.string().trim().default("Balanced"),
  options: z.array(z.string().trim()).default([]),
  seoKeywords: z.string().trim().default(""),
  mode: z.enum(["generate", "regenerate", "rewrite", "expand", "shorten", "translate", "summarize"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});

function logError(stage: string, error: unknown) {
  const msg = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error, null, 2);
  console.error(`[content-studio:${stage}]`, msg);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const tool = searchParams.get("tool");
  const contentType = searchParams.get("contentType");

  let query = auth.supabase
    .from("content_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["title", "description", "content_type", "content_tool"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (tool) query = query.eq("content_tool", tool);
  if (contentType) query = query.eq("content_type", contentType);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ generations: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("content-studio.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({ generations: data as ContentGeneration[], page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "content-studio");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  let stage = "generateContent";

  try {
    const result = await generateContent({
      prompt: input.prompt,
      contentTool: input.contentTool,
      contentType: input.contentType,
      tone: input.tone,
      audience: input.audience,
      language: input.language,
      brandVoice: input.brandVoice,
      writingStyle: input.writingStyle,
      creativityLevel: input.creativityLevel,
      options: input.options,
      seoKeywords: input.seoKeywords,
    });

    const blueprint: ContentBlueprint = {
      title: result.title,
      contentTool: input.contentTool,
      contentType: input.contentType,
      body: result.body,
      headlines: result.headlines,
      seo: result.seo,
      suggestions: result.suggestions,
      improvements: result.improvements,
      summary: result.summary,
      files: result.files,
      prompt: input.prompt,
      tone: input.tone,
      audience: input.audience,
      language: input.language,
      writingStyle: input.writingStyle,
      creativityLevel: input.creativityLevel,
      generatedAt: new Date().toISOString(),
      progressEvents: [...result.progressEvents, "Saving...", "Done."],
    };

    stage = "supabase.insert.content_generations";

    const row = {
      user_id: auth.user!.id,
      title: result.title || `${getContentToolLabel(input.contentTool)} — ${getContentTypeLabel(input.contentType)}`,
      content_tool: input.contentTool,
      content_type: input.contentType,
      description: result.summary || input.prompt,
      prompt: input.prompt,
      tone: input.tone,
      audience: input.audience,
      language: input.language,
      brand_voice: input.brandVoice,
      writing_style: input.writingStyle,
      creativity_level: input.creativityLevel,
      options: input.options,
      seo_keywords: input.seoKeywords,
      blueprint: blueprint as unknown as Record<string, unknown>,
      status: "completed",
      mode: input.mode ?? "generate",
      provider: result.provider ?? getActiveProvider(),
      token_usage: result.usage,
      generation_time_ms: result.generationTimeMs,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase.from("content_generations").insert(row).select("*").single();

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return NextResponse.json({ error: "Content Studio table not found. Please apply migration 019." }, { status: 503 });
      }
      logError(stage, error);
      return databaseErrorResponse("content-studio.insert", error);
    }

    return NextResponse.json({ generation: data as ContentGeneration, message: "Content generated and saved." });
  } catch (error) {
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate content.");
  }
}
