/**
 * React renderer errors (Phase 5).
 * Next.js project generation only — no publish, API, or database.
 */

export const WEBSITE_REACT_RENDER_ERROR_CODES = [
  "invalid_input",
  "invalid_document",
  "render_failed",
  "invalid_react_tree",
  "invalid_metadata",
  "accessibility",
  "hydration",
  "duplicate_id",
  "incomplete_seo",
] as const;

export type WebsiteReactRenderErrorCode = (typeof WEBSITE_REACT_RENDER_ERROR_CODES)[number];

export class WebsiteReactRenderError extends Error {
  readonly code: WebsiteReactRenderErrorCode;

  constructor(message: string, code: WebsiteReactRenderErrorCode) {
    super(message);
    this.name = "WebsiteReactRenderError";
    this.code = code;
  }
}

export function isWebsiteReactRenderError(error: unknown): error is WebsiteReactRenderError {
  return error instanceof WebsiteReactRenderError;
}
