import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverErrorResponse } from "@/lib/api/errors";
import { processVideoStudioBackgroundQueue } from "@/lib/ai-core/video-production-platform";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

function authorizeCron(request: Request): boolean {
  const secret = process.env.VIDEO_STUDIO_CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const header = request.headers.get("x-video-studio-cron-secret")?.trim() || "";
  return bearer === secret || header === secret;
}

/**
 * GET/POST — Video Studio background worker (cron).
 * Auth: Authorization: Bearer VIDEO_STUDIO_CRON_SECRET
 * Requires SUPABASE_SERVICE_ROLE_KEY for cross-user job processing.
 */
async function runWorker(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Set VIDEO_STUDIO_CRON_SECRET and pass Bearer token." },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY required for background render worker.",
      },
      { status: 503 },
    );
  }

  try {
    const url = new URL(request.url);
    const limit = Math.min(
      20,
      Math.max(1, Number.parseInt(url.searchParams.get("limit") || "10", 10) || 10),
    );
    const retryFailed = url.searchParams.get("retryFailed") !== "false";

    const result = await processVideoStudioBackgroundQueue({
      supabase: admin,
      limit,
      pollRounds: 24,
      retryFailed,
      maxRetryAttempts: 3,
    });

    return NextResponse.json({
      message: `Video Studio worker processed ${result.processed} job(s).`,
      ...result,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.cron",
      error,
      "Video Studio background worker failed.",
    );
  }
}

export async function GET(request: Request) {
  return runWorker(request);
}

export async function POST(request: Request) {
  return runWorker(request);
}
