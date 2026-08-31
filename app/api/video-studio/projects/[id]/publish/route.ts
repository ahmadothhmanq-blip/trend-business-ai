import { NextResponse } from "next/server";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { publishVideoProject } from "@/lib/ai-core/video-production-platform/publish/service";
import { videoPublishErrorResponse } from "@/lib/ai-core/video-production-platform/publish/http";
import { publicVideoPath } from "@/lib/ai-core/video-production-platform/publish/persist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id: rawId } = await context.params;
  const parsed = parseUuidParam(rawId, "project id");
  if (parsed instanceof NextResponse) return parsed;

  try {
    const result = await publishVideoProject({
      supabase: auth.supabase,
      userId: auth.user!.id,
      projectId: parsed.id,
    });
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      message: result.reused
        ? "Publish target already exists for this artifact."
        : "Video published.",
      publication: result.publication,
      target: result.target,
      publicPath: result.publicPath,
      publicUrl: `${origin}${publicVideoPath(result.publication.slug)}`,
      reused: result.reused,
      domainState: result.domainState,
    });
  } catch (error) {
    return videoPublishErrorResponse(error) || serverErrorResponse("video-studio.publish", error);
  }
}
