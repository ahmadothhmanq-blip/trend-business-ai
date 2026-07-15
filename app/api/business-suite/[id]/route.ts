import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { BusinessGeneration } from "@/types/business";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  is_favorite: z.boolean().optional(),
  title: z.string().trim().min(1).max(200).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase.from("business_generations").select("*").eq("id", idParsed.id).eq("user_id", auth.user!.id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ generation: data as BusinessGeneration });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });

  const { is_favorite, title } = parsed.data;

  const { data, error } = await auth.supabase
    .from("business_generations")
    .update({ ...(typeof is_favorite === "boolean" ? { is_favorite } : {}), ...(title ? { title } : {}), updated_at: new Date().toISOString() })
    .eq("id", idParsed.id).eq("user_id", auth.user!.id).select("*").single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (typeof is_favorite === "boolean") {
    const sync = await syncFavorite(auth.supabase, auth.user!.id, "business_generation", idParsed.id, is_favorite);
    if (sync.error) return databaseErrorResponse("business-suite.syncFavorite", sync.error);
  }

  return NextResponse.json({ generation: data as BusinessGeneration, message: "Updated." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "business_generation", idParsed.id, false);
  const { data, error } = await auth.supabase.from("business_generations").delete().eq("id", idParsed.id).eq("user_id", auth.user!.id).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted." });
}
