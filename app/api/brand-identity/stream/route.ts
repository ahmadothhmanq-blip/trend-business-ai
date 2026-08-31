import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { resolveIteratedPrompt } from "@/lib/ai/iteration";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { brandIdentityEngine } from "@/lib/ai-core/brand-studio/engine";
import { modelToBlueprint } from "@/lib/ai-core/brand-studio/model";
import { getBrandTemplate } from "@/lib/ai-core/brand-studio/templates";
import { getBrandTypeLabel } from "@/lib/constants/brand-identity-builder";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import type { BrandIdentityGeneration } from "@/types/brand-identity";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().trim().min(5),
  brandName: z.string().trim().min(1),
  brandType: z.string().trim().min(1),
  industry: z.string().trim().default(""),
  targetAudience: z.string().trim().default(""),
  brandPersonality: z.string().trim().default("Professional"),
  deliverables: z.array(z.string().trim()).default([]),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  continueInstruction: z.string().trim().max(4000).optional(),
  projectId: z.string().uuid().optional(),
  templateId: z.string().optional(),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "brand-identity");
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const input = parsed.data;
  const aiLanguage = resolveRequestLanguage(request, input.language, input.country);
  const template = input.templateId ? getBrandTemplate(input.templateId) : undefined;
  const deliverables = template?.deliverables.length
    ? template.deliverables
    : input.deliverables;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEncode(event, data)));
      };

      try {
        send("progress", { message: "Starting Brand Identity Engine...", progress: 5 });

        const iterated = await resolveIteratedPrompt({
          supabase: auth.supabase,
          table: "brand_identity_generations",
          userId: auth.user!.id,
          mode: input.mode,
          prompt: input.prompt,
          continueInstruction: input.continueInstruction,
          parentGenerationId: input.parentGenerationId,
          titleField: "brand_name",
        });

        if (!iterated.ok) {
          send("error", { error: iterated.error });
          controller.close();
          return;
        }

        const result = await brandIdentityEngine.generate(
          {
            prompt: iterated.prompt,
            brandName: input.brandName,
            brandType: template?.brandType || input.brandType,
            industry: template?.industry || input.industry,
            targetAudience: input.targetAudience,
            brandPersonality: template?.personality || input.brandPersonality,
            deliverables,
            language: aiLanguage,
          },
          {
            templateId: input.templateId,
            onProgress: (message) => send("progress", { message, progress: null }),
          },
        );

        send("progress", { message: "Saving brand identity...", progress: 92 });

        const blueprint = modelToBlueprint(result.model, input.prompt);
        blueprint.progressEvents = [...result.progressEvents, "Saving...", "Done."];

        const typeLabel = getBrandTypeLabel(input.brandType);
        const row = {
          user_id: auth.user!.id,
          brand_name: result.output.title || `${typeLabel} Brand`,
          brand_type: input.brandType,
          description: result.output.description || input.prompt,
          industry: input.industry,
          target_audience: input.targetAudience,
          brand_personality: input.brandPersonality,
          deliverables,
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
          await creditLease.release(auth.supabase);
          send("error", { error: error.message });
          controller.close();
          return;
        }

        await creditLease.settle(auth.supabase);
        send("complete", {
          generation: data as BrandIdentityGeneration,
          model: result.model,
          message: "Brand identity designed and saved.",
        });
        controller.close();
      } catch (error) {
        await creditLease.release(auth.supabase);
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
