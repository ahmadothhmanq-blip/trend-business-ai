import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";
import { authorizeVideoStudioCron } from "@/lib/ai-core/video-production-platform/runtime/cron-auth";

/**
 * Session user or the Video Studio cron/service secret.
 * Must succeed before any FFmpeg capability probe on design-platform.
 */
export async function authorizeVideoStudioDesignPlatform(
  request: Request,
): Promise<{ response: NextResponse | null }> {
  if (authorizeVideoStudioCron(request)) return { response: null };
  try {
    const auth = await requireUser();
    return { response: auth.response };
  } catch {
    return { response: apiErrorResponse(API_ERROR_CODES.UNAUTHORIZED, 401) };
  }
}
