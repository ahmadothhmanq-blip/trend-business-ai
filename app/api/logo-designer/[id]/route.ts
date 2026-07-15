import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { LogoGeneration } from "@/types/logo";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  is_favorite: z.boolean().optional(),
  logo_name: z.string().trim().min(1).max(120).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase.from("logo_generations").select("*").eq("id", id).eq("user_id", auth.user!.id).single();
  if (error || !data) return NextResponse.json({ error: "Logo not found" }, { status: 404 });
  return NextResponse.json({ generation: data as LogoGeneration });
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
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });

  const { is_favorite, logo_name } = parsed.data;

  const { data, error } = await auth.supabase
    .from("logo_generations")
    .update({ ...(typeof is_favorite === "boolean" ? { is_favorite } : {}), ...(logo_name ? { logo_name } : {}), updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", auth.user!.id).select("*").single();

  if (error || !data) return NextResponse.json({ error: "Logo not found" }, { status: 404 });

  if (typeof is_favorite === "boolean") {
    const sync = await syncFavorite(auth.supabase, auth.user!.id, "logo_generation", id, is_favorite);
    if (sync.error) return databaseErrorResponse("logo-designer.syncFavorite", sync.error);
  }

  return NextResponse.json({ generation: data as LogoGeneration, message: "Updated." });
}

export async function POST(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: source, error: sourceError } = await auth.supabase.from("logo_generations").select("*").eq("id", id).eq("user_id", auth.user!.id).single();
  if (sourceError || !source) return NextResponse.json({ error: "Logo not found" }, { status: 404 });

  const { data, error } = await auth.supabase
    .from("logo_generations")
    .insert({ user_id: auth.user!.id, logo_name: `${source.logo_name} (Copy)`, logo_style: source.logo_style, description: source.description, industry: source.industry, color_palette: source.color_palette, icon_style: source.icon_style, options: source.options, prompt: source.prompt, blueprint: source.blueprint, status: source.status, mode: "generate", is_favorite: false })
    .select("*").single();

  if (error || !data) return databaseErrorResponse("logo-designer.duplicate", error);
  return NextResponse.json({ generation: data as LogoGeneration, message: "Duplicated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "logo_generation", id, false);
  const { data, error } = await auth.supabase.from("logo_generations").delete().eq("id", id).eq("user_id", auth.user!.id).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Logo not found" }, { status: 404 });
  return NextResponse.json({ message: "Logo deleted." });
}
