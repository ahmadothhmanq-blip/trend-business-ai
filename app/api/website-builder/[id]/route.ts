import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { z } from "zod";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

const updateWebsiteGenerationSchema = z.object({
  is_favorite: z.boolean().optional(),
  projectName: z.string().trim().min(1).max(120).optional(),
  settings: z.record(z.string(), z.string()).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  return NextResponse.json({ generation: data as WebsiteGeneration });
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

  const parsed = updateWebsiteGenerationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });
  }

  const existing = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const { is_favorite, projectName, settings } = parsed.data;
  const current = existing.data as WebsiteGeneration;
  const nextBlueprint =
    settings && current.blueprint
      ? {
          ...(current.blueprint as unknown as Record<string, unknown>),
          settings: {
            ...((current.blueprint as unknown as { settings?: Record<string, string> }).settings ?? {}),
            ...settings,
          },
        }
      : current.blueprint;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .update({
      ...(typeof is_favorite === "boolean" ? { is_favorite } : {}),
      ...(projectName ? { project_name: projectName } : {}),
      ...(settings ? { blueprint: nextBlueprint } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  if (typeof is_favorite === "boolean") {
    const favoriteSync = await syncFavorite(
      auth.supabase,
      auth.user!.id,
      "website_generation",
      id,
      is_favorite,
    );
    if (favoriteSync.error) {
      return databaseErrorResponse("website-builder.syncFavorite", favoriteSync.error);
    }
  }

  return NextResponse.json({
    generation: data as WebsiteGeneration,
    message: "Website project updated.",
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
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (sourceError || !source) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const { data, error } = await auth.supabase
    .from("website_generations")
    .insert({
      user_id: auth.user!.id,
      project_name: `${source.project_name} Copy`,
      website_type: source.website_type,
      business_description: source.business_description,
      target_audience: source.target_audience,
      language: source.language,
      color_style: source.color_style,
      design_style: source.design_style,
      page_count: source.page_count,
      features: source.features,
      blueprint: source.blueprint,
      is_favorite: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return databaseErrorResponse("website-builder.duplicate", error);
  }

  return NextResponse.json({
    generation: data as WebsiteGeneration,
    message: "Website project duplicated.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const favoriteSync = await syncFavorite(auth.supabase, auth.user!.id, "website_generation", id, false);
  if (favoriteSync.error) {
    return databaseErrorResponse("website-builder.syncFavorite", favoriteSync.error);
  }

  const { data, error } = await auth.supabase
    .from("website_generations")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Website blueprint deleted." });
}
