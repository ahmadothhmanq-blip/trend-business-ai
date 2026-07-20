import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { buildVideoStudioHealthReport } from "@/lib/ai-core/video-production-platform/production-health";
import { VIDEO_STUDIO_ENV_DOCS } from "@/lib/ai-core/video-production-platform/env-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET — Video Studio production health (database, storage, ffmpeg, providers, TTS, pipeline).
 * Query: ?docs=1 returns environment variable template.
 */
export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const showDocs = new URL(request.url).searchParams.get("docs") === "1";
  if (showDocs) {
    return NextResponse.json({
      docs: VIDEO_STUDIO_ENV_DOCS,
      message: "Copy into .env.local for Video Studio production.",
    });
  }

  try {
    const report = await buildVideoStudioHealthReport(auth.supabase);
    return NextResponse.json(report);
  } catch (error) {
    return serverErrorResponse(
      "video-studio.health",
      error,
      "Unable to load Video Studio health.",
    );
  }
}
