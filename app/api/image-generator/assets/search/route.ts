import { requireUser, paginationParams } from "@/lib/api/helpers";
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
    return NextResponse.json({ folders: folders.folders, error: folders.error });
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
  return NextResponse.json({
    assets: result.assets,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    error: result.error,
  });
}
