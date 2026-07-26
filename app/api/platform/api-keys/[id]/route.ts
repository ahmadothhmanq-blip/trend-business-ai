import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase.from("api_keys").delete().eq("id", idParsed.id).eq("user_id", auth.user!.id).select("id").single();
  if (error || !data) return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "API key not found");
  return NextResponse.json({ message: "API key revoked." });
}

export async function PATCH(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data: existing } = await auth.supabase.from("api_keys").select("is_active").eq("id", idParsed.id).eq("user_id", auth.user!.id).single();
  if (!existing) return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "API key not found");

  const { data, error } = await auth.supabase.from("api_keys").update({ is_active: !existing.is_active }).eq("id", idParsed.id).eq("user_id", auth.user!.id).select("*").single();
  if (error || !data) return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, "Update failed");
  return NextResponse.json({ key: data, message: data.is_active ? "API key activated." : "API key deactivated." });
}
