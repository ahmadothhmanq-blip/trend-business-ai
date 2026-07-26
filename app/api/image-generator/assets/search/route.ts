import { requireUser, paginationParams } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";
import { searchDesignAssets, listAssetFolders } from "@/lib/ai-core/image-design-platform/asset-library";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const query = searchParams.get("q") ?? searchParams.get("query") ?? undefined;
  const folder = searchParams.get("folder") ?? undefined;
  const favorite = searchParams.get("favorite");
  const generationId = searchParams.get("generationId") ?? undefined;
  const projectId = searchParams.get("projectId") ?? undefined;
  const tags = searchParams.get("tags")?.split(",").map((t) => t.trim()).filter(Boolean);
  const listFolders = searchParams.get("folders") === "true";

  if (listFolders) {
    const folders = await listAssetFolders({ supabase: auth.supabase, userId: auth.user!.id });
    if (folders.error) {
      return apiErrorResponse(API_ERROR_CODES.LOAD_FAILED, 500, folders.error);
    }
    return NextResponse.json({ folders: folders.folders });
  }

  const result = await searchDesignAssets({
    supabase: auth.supabase,
    userId: auth.user!.id,
    filters: {
      query,
      folder,
      tags,
      favorite: favorite === "true" ? true : favorite === "false" ? false : undefined,
      generationId,
      projectId,
      limit,
      offset: from,
    },
  });

  const total = result.total;
  if (result.error) {
    return apiErrorResponse(API_ERROR_CODES.LOAD_FAILED, 500, result.error);
  }
  return NextResponse.json({
    assets: result.assets,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}
