import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateImage, modelToBlueprint } from "@/lib/image-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { resolveIteratedPrompt } from "@/lib/ai/iteration";
import { getImageTypeLabel } from "@/lib/constants/image-generator";
import { getDesignTemplate } from "@/lib/ai-core/image-design-platform/templates";
import { brandTokensToContext } from "@/lib/ai-core/image-design-platform/model";
import {
  ensureDesignProject,
  saveDesignAssets,
  saveDesignGeneration,
} from "@/lib/ai-core/image-design-platform/assets";
import type { ImageProviderId, ImageQuality } from "@/lib/ai-core/assets/settings";
import type { ImageGeneration, ImageBlueprint } from "@/types/image-generation";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Describe your image in at least 5 characters."),
  negativePrompt: z.string().trim().default(""),
  imageType: z.string().trim().min(1, "Select an image type."),
  style: z.string().trim().default("Photorealistic"),
  aspectRatio: z.string().trim().default("1:1"),
  mood: z.string().trim().default("Professional"),
  options: z.array(z.string().trim()).default([]),
  batchCount: z.number().int().min(1).max(4).default(2),
  brandColors: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  continueInstruction: z.string().trim().max(4000).optional(),
  projectId: z.string().uuid().optional(),
  templateId: z.string().optional(),
  quality: z.enum(["standard", "hd"]).optional(),
  preferredProvider: z.enum(["openai", "replicate", "stability"]).optional(),
  seed: z.number().int().optional(),
  brandIdentity: z.object({
    brandName: z.string().optional(),
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    headingFont: z.string().optional(),
    bodyFont: z.string().optional(),
    voiceTone: z.string().optional(),
    tagline: z.string().optional(),
  }).optional(),
});

function logError(stage: string, error: unknown) {
  const stack = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error, null, 2);
  console.error(`[image-generator:${stage}]`, stack);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("image_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["image_name", "description", "image_type"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ generations: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("image-generator.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    generations: data as ImageGeneration[],
    page, limit, total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "image-generator");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const template = input.templateId ? getDesignTemplate(input.templateId) : undefined;
  const typeLabel = getImageTypeLabel(input.imageType);
  const brand = input.brandIdentity ? brandTokensToContext(input.brandIdentity) : undefined;
  let stage = "generateImage";

  try {
    const iterated = await resolveIteratedPrompt({
      supabase: auth.supabase,
      table: "image_generations",
      userId: auth.user!.id,
      mode: input.mode,
      prompt: input.prompt,
      continueInstruction: input.continueInstruction,
      parentGenerationId: input.parentGenerationId,
      titleField: "image_name",
    });
    if (!iterated.ok) {
      return NextResponse.json({ error: iterated.error }, { status: iterated.status });
    }

    const result = await generateImage({
      prompt: iterated.prompt,
      negativePrompt: input.negativePrompt,
      imageType: template?.imageType || input.imageType,
      style: template?.style || input.style,
      aspectRatio: template?.aspectRatio || input.aspectRatio,
      mood: template?.mood || input.mood,
      options: template?.deliverables?.length ? template.deliverables : input.options,
      batchCount: input.batchCount,
      brandColors: input.brandColors,
      templateId: input.templateId,
      brand,
      quality: (input.quality ?? "standard") as ImageQuality,
      preferredProvider: input.preferredProvider as ImageProviderId | undefined,
      seed: input.seed,
    });

    const blueprint: ImageBlueprint = result.model
      ? modelToBlueprint(result.model, input.prompt, input.negativePrompt)
      : {
      title: result.title,
      description: result.description,
      imageType: result.imageType,
      style: result.style,
      concepts: result.concepts,
      colorDirection: result.colorDirection,
      moodBoard: result.moodBoard,
      promptLibrary: result.promptLibrary,
      files: result.files,
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      generatedAt: new Date().toISOString(),
    };
    blueprint.progressEvents = [...result.progressEvents, "Saving...", "Done."];

    stage = "supabase.insert.image_generations";

    const row = {
      user_id: auth.user!.id,
      image_name: result.title || `${typeLabel} Image`,
      image_type: input.imageType,
      description: result.description || input.prompt,
      style: input.style,
      aspect_ratio: input.aspectRatio,
      mood: input.mood,
      options: input.options,
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
      .from("image_generations")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return NextResponse.json({ error: "Image Generator table not found. Please apply migration 017." }, { status: 503 });
      }
      logError(stage, error);
      return databaseErrorResponse("image-generator.insert", error);
    }

    const generation = data as ImageGeneration;
    let projectId = input.projectId ?? null;

    if (!projectId && result.model) {
      const project = await ensureDesignProject({
        supabase: auth.supabase,
        userId: auth.user!.id,
        name: generation.image_name,
        description: generation.description,
      });
      projectId = project.projectId;
    }

    if (result.model) {
      await saveDesignGeneration({
        supabase: auth.supabase,
        userId: auth.user!.id,
        imageGenerationId: generation.id,
        projectId,
        model: result.model,
        status: result.model.rasterAssets.some((a) => a.status === "completed") ? "completed" : "fallback",
        provider: result.model.providerUsed,
      });

      if (result.model.rasterAssets.length) {
        const saved = await saveDesignAssets({
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: generation.id,
          projectId,
          assets: result.model.rasterAssets,
        });
        if (saved.assets.length && blueprint.model) {
          blueprint.rasterAssets = saved.assets.map((a, i) => ({
            ...(result.model!.rasterAssets[i] ?? result.model!.rasterAssets[0]!),
            storagePath: a.storage_path,
            publicUrl: a.public_url,
          }));
          blueprint.model = { ...result.model, rasterAssets: blueprint.rasterAssets };
          await auth.supabase
            .from("image_generations")
            .update({ blueprint: blueprint as unknown as Record<string, unknown> })
            .eq("id", generation.id);
        }
      }
    }

    return NextResponse.json({
      generation,
      message: result.model?.rasterAssets.some((a) => a.status === "completed")
        ? "Images generated and saved."
        : "Image concepts generated and saved.",
    });
  } catch (error) {
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate image.");
  }
}
