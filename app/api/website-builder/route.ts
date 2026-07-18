import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { WEBSITE_LIST_COLUMNS } from "@/lib/api/list-selects";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateWebsite } from "@/lib/website-generator";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import { startTimer } from "@/lib/perf/timing";
import {
  detectWebsiteProjectKind,
  websiteGenerateRequestSchema,
} from "@/lib/validations/website-builder";
import {
  asSupabaseMaybeSingleClient,
  asSupabaseSingleClient,
} from "@/lib/api/supabase-query";
import { loadWebsiteParentContext } from "@/plugins/website/iteration";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

function logWebsiteBuilderError(stage: string, error: unknown) {
  const stack =
    error instanceof Error
      ? (error.stack ?? error.message)
      : JSON.stringify(error, null, 2);

  console.error(`[website-builder:${stage}]`, stack);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("website_generations")
    .select(WEBSITE_LIST_COLUMNS, { count: "exact" })
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

  const timer = startTimer();
  const { data, error, count } = await query.range(from, to);
  const listMs = timer.ms();

  if (error) {
    return databaseErrorResponse("website-builder.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json(
    {
      generations: ((data ?? []) as Omit<WebsiteGeneration, "blueprint">[]).map((row) => ({
        ...row,
        blueprint: { files: [] },
      })) as unknown as WebsiteGeneration[],
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    {
      headers: {
        "Server-Timing": `db;dur=${listMs}`,
        "Cache-Control": "private, no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "website-builder");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = websiteGenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const projectKind = detectWebsiteProjectKind(input);
  const settings = await providerManager.loadUserSettings(
    asSupabaseSingleClient(auth.supabase),
    auth.user!.id,
  );
  const parentContext = await loadWebsiteParentContext(
    asSupabaseMaybeSingleClient(auth.supabase),
    auth.user!.id,
    input.parentGenerationId,
  );

  let stage = "generateWebsite";

  try {
    const project = await generateWebsite({
      ...input,
      projectKind,
      ...parentContext,
      userId: auth.user!.id,
      preferredProvider: settings?.default_provider as AIProviderName | undefined,
      autoFallback: settings?.auto_fallback ?? true,
    });

    stage = "supabase.insert.website_generations";
    const saved = await persistWebsiteGeneration({
      supabase: auth.supabase,
      userId: auth.user!.id,
      project,
      projectKind: project.projectKind ?? projectKind,
      input: {
        prompt: input.prompt,
        language: input.language,
        theme: input.theme,
        features: input.features,
        productId: input.productId,
        projectId: input.projectId,
        mode: input.mode,
        parentGenerationId: input.parentGenerationId,
        continueInstruction: input.continueInstruction,
      },
    });

    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: 500 });
    }

    return NextResponse.json({
      project: saved.project,
      generation: saved.generation,
      message: "Website saved to your workspace.",
    });
  } catch (error) {
    logWebsiteBuilderError(stage, error);
    return serverErrorResponse(
      stage,
      error,
      "Unable to generate website application.",
    );
  }
}
