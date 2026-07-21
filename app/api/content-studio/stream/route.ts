import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { generateContent } from "@/lib/content-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { resolveIteratedPrompt } from "@/lib/ai/iteration";
import { fetchBrandVoiceContext, brandVoiceToPromptContext } from "@/lib/content-studio/brand-voice";
import { runContentAction } from "@/lib/content-studio/actions";
import { createSseStreamHelpers } from "@/lib/api/sse-stream";
import { getContentToolLabel, getContentTypeLabel } from "@/lib/constants/content-studio";
import type { ContentBlueprint } from "@/types/content";
import { NextResponse } from "next/server";
import { z } from "zod";

const streamSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("generate"),
    prompt: z.string().trim().min(5),
    contentTool: z.string().trim().min(1),
    contentType: z.string().trim().min(1),
    tone: z.string().trim().default("Professional"),
    audience: z.string().trim().default("General"),
    language: z.string().trim().default("English"),
    brandVoice: z.string().trim().default(""),
    brandIdentityId: z.string().uuid().optional(),
    writingStyle: z.string().trim().default("Standard"),
    creativityLevel: z.string().trim().default("Balanced"),
    options: z.array(z.string().trim()).default([]),
    seoKeywords: z.string().trim().default(""),
    mode: z.enum(["generate", "regenerate", "continue", "rewrite", "expand", "shorten", "translate", "summarize"]).optional(),
    parentGenerationId: z.string().uuid().optional(),
    continueInstruction: z.string().trim().max(4000).optional(),
    projectId: z.string().uuid().optional(),
    documentId: z.string().uuid().optional(),
  }),
  z.object({
    type: z.literal("action"),
    action: z.enum(["rewrite", "improve", "expand", "shorten", "summarize", "translate", "change_tone", "change_style"]),
    text: z.string().trim().min(1).max(50000),
    tone: z.string().trim().optional(),
    style: z.string().trim().optional(),
    targetLanguage: z.string().trim().optional(),
    instruction: z.string().trim().max(2000).optional(),
    brandIdentityId: z.string().uuid().optional(),
  }),
]);

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "content-studio");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = streamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;

  const stream = new ReadableStream({
    async start(controller) {
      const { send, close } = createSseStreamHelpers(controller, "content-studio-stream");

      try {
        if (input.type === "action") {
          send("progress", { stage: "action", message: `Running ${input.action}…` });

          let brandVoice = null;
          if (input.brandIdentityId) {
            brandVoice = await fetchBrandVoiceContext(
              auth.supabase!,
              auth.user!.id,
              input.brandIdentityId,
            );
          }

          let partial = "";
          const result = await runContentAction(
            {
              action: input.action,
              text: input.text,
              tone: input.tone,
              style: input.style,
              targetLanguage: input.targetLanguage,
              instruction: input.instruction,
              brandVoice,
            },
            (chunk) => {
              partial += chunk;
              send("token", { chunk, partial });
            },
          );

          send("complete", { result: result.text, action: result.action, provider: result.provider });
          close();
          return;
        }

        send("progress", { stage: "prepare", message: "Preparing generation…" });

        let brandVoiceText = input.brandVoice;
        if (input.brandIdentityId) {
          const voice = await fetchBrandVoiceContext(
            auth.supabase!,
            auth.user!.id,
            input.brandIdentityId,
          );
          if (voice) brandVoiceText = brandVoiceToPromptContext(voice);
        }

        const iterated = await resolveIteratedPrompt({
          supabase: auth.supabase!,
          table: "content_generations",
          userId: auth.user!.id,
          mode: input.mode,
          prompt: input.prompt,
          continueInstruction: input.continueInstruction,
          parentGenerationId: input.parentGenerationId,
          titleField: "title",
        });

        if (!iterated.ok) {
          send("error", { error: iterated.error });
          close();
          return;
        }

        const progressEvents: string[] = [];
        const result = await generateContent({
          prompt: iterated.prompt,
          contentTool: input.contentTool,
          contentType: input.contentType,
          tone: input.tone,
          audience: input.audience,
          language: input.language,
          brandVoice: brandVoiceText,
          writingStyle: input.writingStyle,
          creativityLevel: input.creativityLevel,
          options: input.options,
          seoKeywords: input.seoKeywords,
          onProgress: (event) => {
            progressEvents.push(event);
            send("progress", { stage: "pipeline", message: event });
          },
        });

        const bodyChunks = result.body.match(/.{1,120}/g) ?? [result.body];
        let partial = "";
        for (const chunk of bodyChunks) {
          partial += chunk;
          send("token", { chunk, partial });
          await new Promise((r) => setTimeout(r, 8));
        }

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
          progressEvents: [...result.progressEvents, "Saving…"],
        };

        send("progress", { stage: "save", message: "Saving generation…" });

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
          brand_voice: brandVoiceText,
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

        const { data, error } = await auth.supabase!
          .from("content_generations")
          .insert(row)
          .select("*")
          .single();

        if (error) {
          send("error", { error: "Failed to save generation." });
          close();
          return;
        }

        send("complete", {
          generation: data,
          blueprint,
          progressEvents,
        });
      } catch (error) {
        send("error", {
          error: error instanceof Error ? error.message : "Stream failed",
        });
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
