import { syncFavorite } from "@/lib/db/favorites";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { favoriteSchema } from "@/lib/validations/common";
import type { MarketAnalysis } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

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
    return databaseErrorResponse("market-analysis.favorite", error);
  }

  if (!data) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const favoriteSync = await syncFavorite(
    auth.supabase,
    auth.user!.id,
    "market_analysis",
    id,
    is_favorite,
  );
  if (favoriteSync.error) {
    return databaseErrorResponse("market-analysis.syncFavorite", favoriteSync.error);
  }

  return NextResponse.json({
    analysis: data as MarketAnalysis,
    message: is_favorite
      ? "Analysis added to favorites."
      : "Analysis removed from favorites.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("market_analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const favoriteSync = await syncFavorite(auth.supabase, auth.user!.id, "market_analysis", id, false);
  if (favoriteSync.error) {
    return databaseErrorResponse("market-analysis.syncFavorite", favoriteSync.error);
  }

  return NextResponse.json({ message: "Analysis deleted successfully." });
}
