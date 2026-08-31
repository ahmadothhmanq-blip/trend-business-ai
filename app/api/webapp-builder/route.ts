import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateWebApp } from "@/lib/webapp-generator";
import { resolveAppPlannerIntegration } from "@/lib/webapp/universal-planner-integration";
import {
  AppBuilderStageTiming,
} from "@/lib/webapp/stage-timing";
import { runWithAppBuilderTiming } from "@/lib/webapp/stage-timing-context";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { resolveIteratedPrompt } from "@/lib/ai/iteration";
import { getWebAppTypeLabel } from "@/lib/constants/webapp-builder";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import type { WebAppGeneration, WebAppBlueprint } from "@/types/webapp";
import { NextResponse } from "next/server";
import { z } from "zod";

const webappRequestSchema = z.object({
  prompt: z.string().trim().min(10, "Describe your app in at least 10 characters."),
  appType: z.string().trim().min(1, "Select an app type."),
  language: z.string().trim().min(1, "Select a language."),
  country: z.string().trim().optional(),
  designStyle: z.string().trim().min(1, "Select a design style."),
  colorStyle: z.string().trim().min(1, "Select a color style."),
  features: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  continueInstruction: z.string().trim().max(4000).optional(),
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

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "webapp-builder");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = webappRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const input = parsed.data;
  const aiLanguage = resolveRequestLanguage(request, input.language, input.country);
  const appLabel = getWebAppTypeLabel(input.appType);

  let stage = "generateWebApp";

  try {
    return await runWithAppBuilderTiming(async (apiTiming) => {
      const iterated = await resolveIteratedPrompt({
        supabase: auth.supabase,
        table: "webapp_generations",
        userId: auth.user!.id,
        mode: input.mode,
        prompt: input.prompt,
        continueInstruction: input.continueInstruction,
        parentGenerationId: input.parentGenerationId,
        titleField: "app_name",
      });
      if (!iterated.ok) {
        return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, iterated.status, iterated.error);
      }

      stage = "universalPlanner";
      apiTiming.beginStage("universal-planner", "resolveAppPlannerIntegration");
      const plannerIntegration = await resolveAppPlannerIntegration({
        input: {
          prompt: iterated.prompt,
          appType: input.appType,
          language: aiLanguage,
          designStyle: input.designStyle,
          colorStyle: input.colorStyle,
          features: input.features,
        },
        onProgress: (message) => apiTiming.observeProgress(message),
      });
      apiTiming.endStage("universal-planner");

      stage = "generateWebApp";
      const project = await generateWebApp({
        prompt: iterated.prompt,
        appType: input.appType,
        language: aiLanguage,
        designStyle: input.designStyle,
        colorStyle: input.colorStyle,
        features: input.features,
        ...(plannerIntegration.inputPatch ?? {}),
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
      apiTiming.beginStage("persist", "supabase.insert.webapp_generations");

      const row = {
        user_id: auth.user!.id,
        app_name: savedProject.title || `${appLabel} App`,
        app_type: input.appType,
        description: savedProject.description || input.prompt,
        language: aiLanguage,
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
          return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "Web App Builder table not found. Please apply migration 013.");
        }
        logWebAppBuilderError(stage, error);
        return databaseErrorResponse("webapp-builder.insert", error);
      }

      apiTiming.endStage("persist");
      apiTiming.finish({ generationTimeMs: project.generationTimeMs });

      await creditLease.settle(auth.supabase);
      return NextResponse.json({
        project: savedProject,
        generation: data as WebAppGeneration,
        message: "Web app generated and saved.",
      });
    }, new AppBuilderStageTiming(`api-${Date.now().toString(36)}`));
  } catch (error) {
    try {
      await creditLease.release(auth.supabase);
    } catch {
      /* refund is best-effort */
    }
    logWebAppBuilderError(stage, error);
    return serverErrorResponse(
      stage,
      error,
      "Unable to generate web application.",
    );
  }
}
