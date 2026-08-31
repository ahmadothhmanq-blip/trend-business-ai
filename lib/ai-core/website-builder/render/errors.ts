/**
 * Website render errors (Phase 4).
 * DOM-document validation only — no HTTP, CSS, or publish mapping.
 */

export const WEBSITE_RENDER_ERROR_CODES = [
  "invalid_input",
  "invalid_structure",
  "render_failed",
  "invalid_document",
  "missing_main",
  "heading_order",
  "broken_link",
  "missing_alt",
  "incomplete_seo",
] as const;

export type WebsiteRenderErrorCode = (typeof WEBSITE_RENDER_ERROR_CODES)[number];

export class WebsiteRenderError extends Error {
  readonly code: WebsiteRenderErrorCode;

  constructor(message: string, code: WebsiteRenderErrorCode) {
    super(message);
    this.name = "WebsiteRenderError";
    this.code = code;
  }
}

export function isWebsiteRenderError(error: unknown): error is WebsiteRenderError {
  return error instanceof WebsiteRenderError;
}
