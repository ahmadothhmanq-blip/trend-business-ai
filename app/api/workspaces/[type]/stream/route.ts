import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { generateWorkspaceProject } from "@/lib/workspace/service";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import { isWorkspaceType } from "@/lib/workspace/types";
import { ensureProjectForGeneration } from "@/lib/workspace/projects";
import {
  appendPromptVersion,
  buildCompletedGenerationRow,
  sseEncode,
} from "@/lib/workspace/persist";
import { insertWorkspaceGeneration } from "@/lib/workspace/insert";
import type { WorkspaceGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ type: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { type } = await context.params;
  if (!isWorkspaceType(type)) {
    return NextResponse.json({ error: "Unknown workspace type." }, { status: 404 });
  }

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "workspace");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = getWorkspaceDefinition(type).inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const mode = parsed.data.mode ?? "generate";
  const encoder = new TextEncoder();

  let previousOutput = undefined as WorkspaceGeneration["output"] | undefined;
  let parentPromptVersions = undefined as WorkspaceGeneration["prompt_versions"];

  if (parsed.data.parentGenerationId) {
    const { data: parent } = await auth.supabase
      .from("workspace_generations")
      .select("*")
      .eq("id", parsed.data.parentGenerationId)
      .eq("user_id", auth.user!.id)
      .eq("workspace_type", type)
      .maybeSingle();

    if (parent) {
      const row = parent as WorkspaceGeneration;
      previousOutput = row.output;
      parentPromptVersions = row.prompt_versions;
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEncode(event, data)));
      };

      try {
        send("progress", { message: "Starting AI engine...", progress: 8 });

        const { output, source, provider, usage, generationTimeMs } =
          await generateWorkspaceProject(
            type,
            {
              ...parsed.data,
              mode,
              previousOutput,
            },
            {
              onProgress: (message) => {
                send("progress", { message, progress: null });
              },
            },
          );

        send("progress", { message: "Saving to Supabase...", progress: 92 });

        const savedOutput = {
          ...output,
          productId: parsed.data.productId,
          depth: parsed.data.depth,
          progressEvents: [
            ...(output.progressEvents ?? []),
            "Saving project to workspace...",
            "Project saved.",
            "Done.",
          ],
        };

        const features = [
          ...(parsed.data.features ?? []),
          ...(parsed.data.productId ? [`product:${parsed.data.productId}`] : []),
          ...(parsed.data.depth ? [`depth:${parsed.data.depth}`] : []),
        ];

        const project = await ensureProjectForGeneration(auth.supabase, {
          userId: auth.user!.id,
          productId: parsed.data.productId,
          workspaceType: type,
          name: savedOutput.title,
          projectId: parsed.data.projectId,
        });

        const promptVersions = appendPromptVersion(
          parentPromptVersions,
          parsed.data.prompt,
          mode,
        );

        const row = buildCompletedGenerationRow({
          title: savedOutput.title,
          brief: parsed.data.prompt,
          template: parsed.data.template ?? null,
          language: parsed.data.language ?? "English",
          theme: parsed.data.theme ?? "Gold",
          features,
          output: savedOutput,
          projectId: project?.id ?? parsed.data.projectId,
          productId: parsed.data.productId,
          mode,
          parentGenerationId: parsed.data.parentGenerationId,
          provider,
          usage,
          generationTimeMs,
          promptVersions,
          attachments: parsed.data.attachments ?? [],
        });

        const { data, error } = await insertWorkspaceGeneration(auth.supabase, {
          user_id: auth.user!.id,
          workspace_type: type,
          ...row,
        });

        if (error) {
          send("error", { error: error.message });
          controller.close();
          return;
        }

        send("complete", {
          generation: data as WorkspaceGeneration,
          output: savedOutput,
          source,
          message:
            source && source !== "structured"
              ? "Workspace project generated and saved with AI."
              : "Workspace project generated and saved.",
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to generate workspace project.";

        try {
          await auth.supabase.from("workspace_generations").insert({
            user_id: auth.user!.id,
            workspace_type: type,
            title: "Failed generation",
            brief: parsed.data.prompt,
            template: parsed.data.template ?? null,
            language: parsed.data.language ?? "English",
            theme: parsed.data.theme ?? "Gold",
            features: parsed.data.features ?? [],
            output: {
              title: "Failed generation",
              summary: message,
              sections: [],
              deliverables: [],
              productId: parsed.data.productId,
              mode,
            },
            product_id: parsed.data.productId ?? null,
            project_id: parsed.data.projectId ?? null,
            status: "failed",
            mode,
            parent_generation_id: parsed.data.parentGenerationId ?? null,
            error_message: message,
            prompt_versions: appendPromptVersion([], parsed.data.prompt, mode),
            attachments: parsed.data.attachments ?? [],
            is_favorite: false,
          });
        } catch {
          // ignore
        }

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
