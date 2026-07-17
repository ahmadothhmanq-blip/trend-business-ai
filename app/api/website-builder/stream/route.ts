import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { generateWebsite } from "@/lib/website-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import {
  detectWebsiteProjectKind,
  websiteGenerateRequestSchema,
} from "@/lib/validations/website-builder";
import { sseEncode } from "@/lib/workspace/persist";
import type { WebsiteBlueprint, WebsiteGeneration } from "@/types/database";
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
    auth.supabase,
    auth.user!.id,
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
          preferredProvider: settings?.default_provider as
            | AIProviderName
            | undefined,
          autoFallback: settings?.auto_fallback ?? true,
          onProgress: (message) => {
            send("progress", { message });
          },
        });

        send("progress", { message: "Saving project to workspace..." });

        const savedProjectKind = project.projectKind ?? projectKind;
        const savedProject = {
          ...project,
          projectKind: savedProjectKind,
          prompt: input.prompt,
          generatedAt: new Date().toISOString(),
          settings: {
            framework: "Next.js App Router",
            styling: "Tailwind CSS",
            packageManager: "npm",
            deploymentTarget: "Vercel or Node hosting",
            ...project.settings,
          },
          progressEvents: [
            ...(project.progressEvents ?? []),
            "Saving project..." as const,
            "Done." as const,
          ],
        };

        const coreRow = {
          user_id: auth.user!.id,
          project_name: savedProject.title,
          website_type:
            savedProjectKind === "web_application" ? "Web Application" : "Website",
          business_description: savedProject.description,
          target_audience: "Auto-detected from project prompt",
          language: input.language,
          color_style: input.theme,
          design_style: input.theme,
          page_count: String(savedProject.pages.length || 1),
          features: [
            ...input.features,
            ...(input.productId ? [`product:${input.productId}`] : []),
          ],
          blueprint: savedProject as unknown as WebsiteBlueprint,
        };

        const phase5Row = {
          ...coreRow,
          product_id: input.productId ?? null,
          project_id: input.projectId ?? null,
          status: "completed",
          mode: input.mode ?? "generate",
          parent_generation_id: input.parentGenerationId ?? null,
          provider: project.provider ?? getActiveProvider(),
          token_usage: project.usage,
          generation_time_ms: project.generationTimeMs,
          prompt_versions: [
            {
              id: crypto.randomUUID(),
              prompt: input.prompt,
              createdAt: new Date().toISOString(),
              mode: input.mode ?? "generate",
            },
          ],
          attachments: [],
        };

        let result = await auth.supabase
          .from("website_generations")
          .insert(phase5Row)
          .select("*")
          .single();

        if (result.error) {
          const msg = result.error.message?.toLowerCase() ?? "";
          const missingCol =
            msg.includes("column") ||
            msg.includes("does not exist") ||
            msg.includes("schema cache");

          if (missingCol) {
            result = await auth.supabase
              .from("website_generations")
              .insert(coreRow)
              .select("*")
              .single();
          }
        }

        if (result.error) {
          send("error", { error: result.error.message });
          return;
        }

        send("complete", {
          project: savedProject,
          generation: result.data as WebsiteGeneration,
          message: "Generated project saved.",
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
