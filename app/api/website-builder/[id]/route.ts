import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { favoriteSchema } from "@/lib/validations/common";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
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
  const { id } = await context.params;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "is_favorite boolean is required" }, { status: 400 });
  }

  const { is_favorite } = parsed.data;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .update({ is_favorite, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  await syncFavorite(
    auth.supabase,
    auth.user!.id,
    "website_generation",
    id,
    is_favorite,
  );

  return NextResponse.json({
    generation: data as WebsiteGeneration,
    message: is_favorite
      ? "Website blueprint added to favorites."
      : "Website blueprint removed from favorites.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "website_generation", id, false);

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
