import { NextResponse } from "next/server";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { unpublishVideoProject } from "@/lib/ai-core/video-production-platform/publish/service";
import { videoPublishErrorResponse } from "@/lib/ai-core/video-production-platform/publish/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id: rawId } = await context.params;
  const parsed = parseUuidParam(rawId, "project id");
  if (parsed instanceof NextResponse) return parsed;

  try {
    const result = await unpublishVideoProject({
      supabase: auth.supabase,
      userId: auth.user!.id,
      projectId: parsed.id,
    });
    return NextResponse.json({
      message: result.reused ? "Video already unpublished." : "Video unpublished. Public URL is no longer available.",
      publication: result.publication,
      target: result.target,
      reused: result.reused,
      domainState: result.domainState,
    });
  } catch (error) {
    return videoPublishErrorResponse(error) || serverErrorResponse("video-studio.unpublish", error);
  }
}
