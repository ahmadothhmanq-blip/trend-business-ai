import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { VideoGeneration } from "@/types/video";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  is_favorite: z.boolean().optional(),
  video_name: z.string().trim().min(1).max(120).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase.from("video_generations").select("*").eq("id", id).eq("user_id", auth.user!.id).single();
  if (error || !data) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  return NextResponse.json({ generation: data as VideoGeneration });
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

  const { is_favorite, video_name } = parsed.data;

  const { data, error } = await auth.supabase
    .from("video_generations")
    .update({ ...(typeof is_favorite === "boolean" ? { is_favorite } : {}), ...(video_name ? { video_name } : {}), updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", auth.user!.id).select("*").single();

  if (error || !data) return NextResponse.json({ error: "Video not found" }, { status: 404 });

  if (typeof is_favorite === "boolean") {
    const sync = await syncFavorite(auth.supabase, auth.user!.id, "video_generation", id, is_favorite);
    if (sync.error) return databaseErrorResponse("video-studio.syncFavorite", sync.error);
  }

  return NextResponse.json({ generation: data as VideoGeneration, message: "Updated." });
}

export async function POST(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: source, error: srcErr } = await auth.supabase.from("video_generations").select("*").eq("id", id).eq("user_id", auth.user!.id).single();
  if (srcErr || !source) return NextResponse.json({ error: "Video not found" }, { status: 404 });

  const { data, error } = await auth.supabase
    .from("video_generations")
    .insert({ user_id: auth.user!.id, video_name: `${source.video_name} (Copy)`, video_type: source.video_type, description: source.description, style: source.style, aspect_ratio: source.aspect_ratio, duration: source.duration, options: source.options, prompt: source.prompt, blueprint: source.blueprint, status: source.status, mode: "generate", is_favorite: false })
    .select("*").single();

  if (error || !data) return databaseErrorResponse("video-studio.duplicate", error);
  return NextResponse.json({ generation: data as VideoGeneration, message: "Duplicated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "video_generation", id, false);
  const { data, error } = await auth.supabase.from("video_generations").delete().eq("id", id).eq("user_id", auth.user!.id).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  return NextResponse.json({ message: "Video deleted." });
}
