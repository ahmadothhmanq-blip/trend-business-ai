import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverErrorResponse } from "@/lib/api/errors";
import { processVideoStudioBackgroundQueue } from "@/lib/ai-core/video-production-platform";
import { authorizeVideoStudioCron } from "@/lib/ai-core/video-production-platform/runtime/cron-auth";
import { validateVideoStudioProductionEnv } from "@/lib/ai-core/video-production-platform/env-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Platform worker: processes due jobs across tenants using the service role.
 * Authenticated dashboard users must use `/api/video-studio/jobs`, which is
 * always scoped to the caller. This route is not a tenant session.
 */
async function runWorker(request: Request) {
  if (!authorizeVideoStudioCron(request)) {
    return apiErrorResponse(API_ERROR_CODES.UNAUTHORIZED, 401, "Unauthorized. Set VIDEO_STUDIO_CRON_SECRET and pass Bearer token.");
  }

  const productionEnv = validateVideoStudioProductionEnv();
  if (productionEnv.production && !productionEnv.ok) {
    return apiErrorResponse(
      API_ERROR_CODES.PROVIDER_UNAVAILABLE,
      503,
      productionEnv.blockers[0] || "Video Studio production configuration is incomplete.",
      productionEnv.blockers.join(" "),
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return apiErrorResponse(
      API_ERROR_CODES.MIGRATION_REQUIRED,
      503,
      "SUPABASE_SERVICE_ROLE_KEY required for background render worker.",
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
