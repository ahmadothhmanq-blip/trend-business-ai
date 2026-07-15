import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { WebAppGeneration } from "@/types/webapp";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  is_favorite: z.boolean().optional(),
  app_name: z.string().trim().min(1).max(120).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("webapp_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Web app not found" }, { status: 404 });
  }

  return NextResponse.json({ generation: data as WebAppGeneration });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update" },
      { status: 400 },
    );
  }

  const { is_favorite, app_name } = parsed.data;

  const { data, error } = await auth.supabase
    .from("webapp_generations")
    .update({
      ...(typeof is_favorite === "boolean" ? { is_favorite } : {}),
      ...(app_name ? { app_name } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Web app not found" }, { status: 404 });
  }

  if (typeof is_favorite === "boolean") {
    const sync = await syncFavorite(
      auth.supabase,
      auth.user!.id,
      "webapp_generation",
      id,
      is_favorite,
    );
    if (sync.error) {
      return databaseErrorResponse("webapp-builder.syncFavorite", sync.error);
    }
  }

  return NextResponse.json({
    generation: data as WebAppGeneration,
    message: "Web app updated.",
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: source, error: sourceError } = await auth.supabase
    .from("webapp_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (sourceError || !source) {
    return NextResponse.json({ error: "Web app not found" }, { status: 404 });
  }

  const { data, error } = await auth.supabase
    .from("webapp_generations")
    .insert({
      user_id: auth.user!.id,
      app_name: `${source.app_name} (Copy)`,
      app_type: source.app_type,
      description: source.description,
      language: source.language,
      design_style: source.design_style,
      color_style: source.color_style,
      features: source.features,
      prompt: source.prompt,
      blueprint: source.blueprint,
      status: source.status,
      mode: "generate",
      is_favorite: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return databaseErrorResponse("webapp-builder.duplicate", error);
  }

  return NextResponse.json({
    generation: data as WebAppGeneration,
    message: "Web app duplicated.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "webapp_generation", id, false);

  const { data, error } = await auth.supabase
    .from("webapp_generations")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Web app not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Web app deleted." });
}
