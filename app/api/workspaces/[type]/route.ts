import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateWorkspaceProject } from "@/lib/workspace/service";
import { getWorkspaceDefinition } from "@/lib/workspace/registry";
import { isWorkspaceType } from "@/lib/workspace/types";
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

  try {
    const { output, source } = await generateWorkspaceProject(type, parsed.data);

    const savedOutput = {
      ...output,
      progressEvents: [...(output.progressEvents ?? []), "Saving project...", "Done."],
    };

    const { data, error } = await auth.supabase
      .from("workspace_generations")
      .insert({
        user_id: auth.user!.id,
        workspace_type: type,
        title: savedOutput.title,
        brief: parsed.data.prompt,
        template: parsed.data.template ?? null,
        language: parsed.data.language,
        theme: parsed.data.theme,
        features: parsed.data.features,
        output: savedOutput,
        is_favorite: false,
      })
      .select("*")
      .single();

    if (error) {
      return databaseErrorResponse("workspace.insert", error);
    }

    return NextResponse.json({
      generation: data as WorkspaceGeneration,
      output: savedOutput,
      message:
        source === "openai"
          ? "Workspace project generated and saved with AI."
          : "Workspace project generated and saved.",
    });
  } catch (error) {
    return serverErrorResponse(
      "workspace.generate",
      error,
      "Unable to generate workspace project.",
    );
  }
}
