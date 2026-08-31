import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";
import { EditorMvpError } from "@/lib/ai-core/video-production-platform/editor-mvp/errors";

export function editorMvpErrorResponse(error: unknown) {
  if (!(error instanceof EditorMvpError)) return null;
  if (error.code === "not_found") {
    return apiErrorResponse(API_ERROR_CODES.VIDEO_NOT_FOUND, 404, error.message);
  }
  if (error.code === "unauthorized") {
    return apiErrorResponse(API_ERROR_CODES.UNAUTHORIZED, 401, error.message);
  }
  if (
    error.code === "ownership" ||
    error.code === "foreign_scene" ||
    error.code === "foreign_plan" ||
    error.code === "inactive_plan" ||
    error.code === "plan_mixing"
  ) {
    return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403, error.message);
  }
  return apiErrorResponse(API_ERROR_CODES.INVALID_INPUT, 422, error.message);
}
