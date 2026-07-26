import { syncFavorite } from "@/lib/db/favorites";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { favoriteSchema } from "@/lib/validations/common";
import { ideaUpdateSchema } from "@/lib/validations/ideas";
import type { BusinessIdea } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = ideaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const { data, error } = await auth.supabase
    .from("business_ideas")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error) {
    return databaseErrorResponse("ideas.update", error);
  }

  if (!data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Idea not found");
  }

  return NextResponse.json({
    idea: data as BusinessIdea,
    message: "Idea updated successfully.",
  });
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

  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError("is_favorite boolean is required");
  }

  const { is_favorite } = parsed.data;

  const { data, error } = await auth.supabase
    .from("business_ideas")
    .update({ is_favorite, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("*")
    .single();

  if (error) {
    return databaseErrorResponse("ideas.favorite", error);
  }

  if (!data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Idea not found");
  }

  const favoriteSync = await syncFavorite(
    auth.supabase,
    auth.user!.id,
    "business_idea",
    id,
    is_favorite,
  );
  if (favoriteSync.error) {
    return databaseErrorResponse("ideas.syncFavorite", favoriteSync.error);
  }

  return NextResponse.json({
    idea: data as BusinessIdea,
    message: is_favorite ? "Idea added to favorites." : "Idea removed from favorites.",
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
    .from("business_ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .select("id")
    .single();

  if (error || !data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Idea not found");
  }

  const favoriteSync = await syncFavorite(auth.supabase, auth.user!.id, "business_idea", id, false);
  if (favoriteSync.error) {
    return databaseErrorResponse("ideas.syncFavorite", favoriteSync.error);
  }

  return NextResponse.json({ message: "Idea deleted successfully." });
}
