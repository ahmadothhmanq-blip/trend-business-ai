import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { generateWebsite } from "@/lib/website-generator";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
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
import { sseEncode } from "@/lib/workspace/persist";
import { NextResponse } from "next/server";

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
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEncode(event, data)));
      };

      try {
        send("progress", { message: "Connecting to AI website engine..." });

        const project = await generateWebsite({
          ...input,
          projectKind,
          ...parentContext,
          userId: auth.user!.id,
          preferredProvider: settings?.default_provider as
            | AIProviderName
            | undefined,
          autoFallback: settings?.auto_fallback ?? true,
          onProgress: (message) => {
            send("progress", { message });
          },
        });

        send("progress", { message: "Building product preview..." });

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
          send("error", { error: saved.error });
          return;
        }

        send("complete", {
          project: saved.project,
          generation: saved.generation,
          message: "Website saved to your workspace.",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to generate website application.";
        send("error", { error: message });
      } finally {
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
