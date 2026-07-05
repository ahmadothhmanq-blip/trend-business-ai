import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { favoriteSchema } from "@/lib/validations/common";
import type { MarketAnalysis } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

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
    .from("market_analyses")
    .update({ is_favorite, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  await syncFavorite(
    auth.supabase,
    auth.user!.id,
    "market_analysis",
    id,
    is_favorite,
  );

  return NextResponse.json({
    analysis: data as MarketAnalysis,
    message: is_favorite
      ? "Analysis added to favorites."
      : "Analysis removed from favorites.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireUser();
  if (auth.response) return auth.response;

  await syncFavorite(auth.supabase, auth.user!.id, "market_analysis", id, false);

  const { error } = await auth.supabase
    .from("market_analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Analysis deleted successfully." });
}
