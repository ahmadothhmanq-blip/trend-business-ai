import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse, notFoundResponse } from "@/lib/api/errors";
import { isWorkspaceType } from "@/lib/workspace/types";
import { workspacePatchSchema } from "@/lib/validations/workspace";
import type { WorkspaceGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ type: string; id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { type, id: rawId } = await context.params;
  if (!isWorkspaceType(type)) {
    return notFoundResponse("Unknown workspace type.");
  }

  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const { data, error } = await auth.supabase
    .from("workspace_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .eq("workspace_type", type)
    .single();

  if (error || !data) {
    return notFoundResponse("Workspace project not found.");
  }

  return NextResponse.json({ generation: data as WorkspaceGeneration });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { type, id: rawId } = await context.params;
  if (!isWorkspaceType(type)) {
    return notFoundResponse("Unknown workspace type.");
  }

  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = workspacePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.title !== undefined) {
    updates.title = parsed.data.title;
  }

  if (parsed.data.is_favorite !== undefined) {
    updates.is_favorite = parsed.data.is_favorite;
    const favoriteSync = await syncFavorite(
      auth.supabase,
      auth.user!.id,
      "workspace_generation",
      id,
      parsed.data.is_favorite,
    );
    if (favoriteSync.error) {
      return databaseErrorResponse("workspace.syncFavorite", favoriteSync.error);
    }
  }

  const { data, error } = await auth.supabase
    .from("workspace_generations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .eq("workspace_type", type)
    .select("*")
    .single();

  if (error) {
    return databaseErrorResponse("workspace.update", error);
  }

  return NextResponse.json({
    generation: data as WorkspaceGeneration,
    message: "Workspace project updated.",
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { type, id: rawId } = await context.params;
  if (!isWorkspaceType(type)) {
    return notFoundResponse("Unknown workspace type.");
  }

  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const { data: source, error: sourceError } = await auth.supabase
    .from("workspace_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .eq("workspace_type", type)
    .single();

  if (sourceError || !source) {
    return notFoundResponse("Workspace project not found.");
  }

  const row = source as WorkspaceGeneration;

  const { data, error } = await auth.supabase
    .from("workspace_generations")
    .insert({
      user_id: auth.user!.id,
      workspace_type: type,
      title: `${row.title} (Copy)`,
      brief: row.brief,
      template: row.template,
      language: row.language,
      theme: row.theme,
      features: row.features,
      output: row.output,
      is_favorite: false,
    })
    .select("*")
    .single();

  if (error) {
    return databaseErrorResponse("workspace.duplicate", error);
  }

  return NextResponse.json({
    generation: data as WorkspaceGeneration,
    message: "Workspace project duplicated.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { type, id: rawId } = await context.params;
  if (!isWorkspaceType(type)) {
    return notFoundResponse("Unknown workspace type.");
  }

  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const { error } = await auth.supabase
    .from("workspace_generations")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .eq("workspace_type", type);

  if (error) {
    return databaseErrorResponse("workspace.delete", error);
  }

  await auth.supabase
    .from("favorites")
    .delete()
    .eq("user_id", auth.user!.id)
    .eq("item_type", "workspace_generation")
    .eq("item_id", id);

  return NextResponse.json({ message: "Workspace project deleted." });
}
