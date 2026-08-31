/**
 * Website Generation Engine errors (Phase 3).
 * Structure mapping only — no HTML, HTTP, or persistence.
 */

export const WEBSITE_GENERATION_ERROR_CODES = [
  "invalid_input",
  "invalid_state",
  "ownership",
  "empty_plan",
  "generation_failed",
  "invalid_structure",
  "missing_homepage",
  "orphan_page",
  "incomplete_seo",
] as const;

export type WebsiteGenerationErrorCode = (typeof WEBSITE_GENERATION_ERROR_CODES)[number];

export class WebsiteGenerationError extends Error {
  readonly code: WebsiteGenerationErrorCode;

  constructor(message: string, code: WebsiteGenerationErrorCode) {
    super(message);
    this.name = "WebsiteGenerationError";
    this.code = code;
  }
}

export function isWebsiteGenerationError(error: unknown): error is WebsiteGenerationError {
  return error instanceof WebsiteGenerationError;
}
