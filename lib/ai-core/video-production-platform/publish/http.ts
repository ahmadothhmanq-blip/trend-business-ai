import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";
import { VideoPublishError } from "@/lib/ai-core/video-production-platform/publish/errors";

export function videoPublishErrorResponse(error: unknown) {
  if (!(error instanceof VideoPublishError)) return null;
  if (error.code === "not_found") {
    return apiErrorResponse(API_ERROR_CODES.NOT_FOUND, 404, error.message);
  }
  if (error.code === "ownership") {
    return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403, error.message);
  }
  return apiErrorResponse(API_ERROR_CODES.INVALID_INPUT, 400, error.message);
}
