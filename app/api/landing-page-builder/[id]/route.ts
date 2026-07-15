import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { LandingPageGeneration } from "@/types/landing-page";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  is_favorite: z.boolean().optional(),
  page_name: z.string().trim().min(1).max(120).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("landing_page_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }
  return NextResponse.json({ generation: data as LandingPageGeneration });
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

  const { is_favorite, page_name } = parsed.data;

  const { data, error } = await auth.supabase
    .from("landing_page_generations")
    .update({
      ...(typeof is_favorite === "boolean" ? { is_favorite } : {}),
      ...(page_name ? { page_name } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  if (typeof is_favorite === "boolean") {
    const sync = await syncFavorite(auth.supabase, auth.user!.id, "landing_page_generation", id, is_favorite);
    if (sync.error) return databaseErrorResponse("landing-page-builder.syncFavorite", sync.error);
  }

  return NextResponse.json({ generation: data as LandingPageGeneration, message: "Updated." });
}

export async function POST(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: source, error: sourceError } = await auth.supabase
    .from("landing_page_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .single();

  if (sourceError || !source) {
    return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  }

  const { data, error } = await auth.supabase
    .from("landing_page_generations")
    .insert({
      user_id: auth.user!.id,
      page_name: `${source.page_name} (Copy)`,
      page_type: source.page_type,
      description: source.description,
      language: source.language,
      design_style: source.design_style,
      color_style: source.color_style,
      sections: source.sections,
      prompt: source.prompt,
      blueprint: source.blueprint,
      status: source.status,
      mode: "generate",
      is_favorite: false,
    })
    .select("*")
    .single();

  if (error || !data) return databaseErrorResponse("landing-page-builder.duplicate", error);
  return NextResponse.json({ generation: data as LandingPageGeneration, message: "Duplicated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "landing_page_generation", id, false);

  const { data, error } = await auth.supabase
    .from("landing_page_generations")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("id")
    .single();

  if (error || !data) return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
  return NextResponse.json({ message: "Landing page deleted." });
}
