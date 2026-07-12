import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateWorkspaceProject } from "@/lib/workspace/service";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import { isWorkspaceType } from "@/lib/workspace/types";
import { ensureProjectForGeneration } from "@/lib/workspace/projects";
import {
  appendPromptVersion,
  buildCompletedGenerationRow,
} from "@/lib/workspace/persist";
import { insertWorkspaceGeneration } from "@/lib/workspace/insert";
import type { WorkspaceGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ type: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { type } = await context.params;
  if (!isWorkspaceType(type)) {
    return NextResponse.json({ error: "Unknown workspace type." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");
  const productId = searchParams.get("productId")?.trim();
  const projectId = searchParams.get("projectId")?.trim();

  let query = auth.supabase
    .from("workspace_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .eq("workspace_type", type)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["title", "brief", "template"], search);
  if (orFilter) {
    query = query.or(orFilter);
  }

  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);
  if (productId) query = query.eq("product_id", productId);
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return databaseErrorResponse("workspace.list", error);
  }

  const total = count ?? 0;

  return NextResponse.json({
    generations: data as WorkspaceGeneration[],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

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

  try {
    const { output, source, provider, usage, generationTimeMs } =
      await generateWorkspaceProject(type, {
        ...parsed.data,
        mode,
        previousOutput,
      });

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
      return databaseErrorResponse("workspace.insert", error);
    }

    return NextResponse.json({
      generation: data as WorkspaceGeneration,
      output: savedOutput,
      message:
        source && source !== "structured"
          ? "Workspace project generated and saved with AI."
          : "Workspace project generated and saved.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate workspace project.";

    // Persist failed generation for retry history when possible.
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
          source: "structured",
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
      // ignore persistence failure on error path
    }

    return serverErrorResponse("workspace.generate", error, message);
  }
}
