import { syncFavorite } from "@/lib/db/favorites";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { z } from "zod";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";

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

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    id,
    "view",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  return NextResponse.json({
    generation: accessResult.generation as WebsiteGeneration,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    id,
    "edit",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = updateWebsiteGenerationSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const current = accessResult.generation as WebsiteGeneration;
  const { is_favorite, projectName, settings } = parsed.data;
  const nextBlueprint =
    settings && current.blueprint
      ? {
          ...(current.blueprint as unknown as Record<string, unknown>),
          settings: {
            ...((current.blueprint as unknown as { settings?: Record<string, string> })
              .settings ?? {}),
            ...settings,
          },
        }
      : current.blueprint;

  const updateQuery = auth.supabase
    .from("website_generations")
    .update({
      ...(typeof is_favorite === "boolean" ? { is_favorite } : {}),
      ...(projectName ? { project_name: projectName } : {}),
      ...(settings ? { blueprint: nextBlueprint } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  const { data, error } =
    accessResult.access === "owner"
      ? await updateQuery.eq("user_id", auth.user!.id).select("*").single()
      : await updateQuery.select("*").single();

  if (error || !data) {
    return apiErrorResponse(API_ERROR_CODES.GENERATION_NOT_FOUND, 404);
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

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    id,
    "owner",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const source = accessResult.generation as WebsiteGeneration;

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

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    id,
    "owner",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const favoriteSync = await syncFavorite(
    auth.supabase,
    auth.user!.id,
    "website_generation",
    id,
    false,
  );
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
    return apiErrorResponse(API_ERROR_CODES.GENERATION_NOT_FOUND, 404);
  }

  return NextResponse.json({ message: "Website blueprint deleted." });
}
