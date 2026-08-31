/**
 * Website editor errors (Phase 6).
 * Domain editing only — no UI, API, publish, or persistence.
 */

export const WEBSITE_EDITOR_ERROR_CODES = [
  "invalid_input",
  "invalid_state",
  "ownership",
  "inactive_plan",
  "not_found",
  "illegal_selection",
  "illegal_delete",
  "invalid_hierarchy",
  "invalid_theme",
  "invalid_seo",
  "duplicate_id",
  "nothing_to_undo",
  "nothing_to_redo",
] as const;

export type WebsiteEditorErrorCode = (typeof WEBSITE_EDITOR_ERROR_CODES)[number];

export class WebsiteEditorError extends Error {
  readonly code: WebsiteEditorErrorCode;

  constructor(message: string, code: WebsiteEditorErrorCode) {
    super(message);
    this.name = "WebsiteEditorError";
    this.code = code;
  }
}

export function isWebsiteEditorError(error: unknown): error is WebsiteEditorError {
  return error instanceof WebsiteEditorError;
}
