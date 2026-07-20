import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { resolveIteratedPrompt } from "@/lib/ai/iteration";
import { generateImage, modelToBlueprint } from "@/lib/image-generator";
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
  prompt: z.string().trim().min(5),
  negativePrompt: z.string().trim().default(""),
  imageType: z.string().trim().min(1),
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

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const template = input.templateId ? getDesignTemplate(input.templateId) : undefined;
  const brand = input.brandIdentity ? brandTokensToContext(input.brandIdentity) : undefined;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEncode(event, data)));
      };

      try {
        send("progress", { message: "Starting Image Design Engine...", progress: 5 });

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
          send("error", { error: iterated.error });
          controller.close();
          return;
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
          onProgress: (message) => send("progress", { message, progress: null }),
        });

        send("progress", { message: "Saving...", progress: 92 });

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

        const row = {
          user_id: auth.user!.id,
          image_name: result.title || "Image",
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
          send("error", { error: error.message });
          controller.close();
          return;
        }

        const generation = data as ImageGeneration;
        if (result.model) {
          await saveDesignGeneration({
            supabase: auth.supabase,
            userId: auth.user!.id,
            imageGenerationId: generation.id,
            projectId: input.projectId ?? null,
            model: result.model,
            status: "completed",
            provider: result.model.providerUsed,
          });
          await saveDesignAssets({
            supabase: auth.supabase,
            userId: auth.user!.id,
            generationId: generation.id,
            projectId: input.projectId ?? null,
            assets: result.model.rasterAssets,
          });
        }

        send("complete", {
          generation,
          model: result.model,
          message: "Image generation complete.",
        });
        controller.close();
      } catch (error) {
        send("error", {
          error: error instanceof Error ? error.message : "Generation failed",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
