/**
 * Website Director errors (Phase 2).
 * Structured codes only — no HTTP, HTML, or provider mapping.
 */

export const WEBSITE_DIRECTOR_ERROR_CODES = [
  "invalid_input",
  "invalid_state",
  "incomplete_plan",
  "invalid_plan",
  "malformed_response",
  "llm_unconfigured",
  "llm_failed",
] as const;

export type WebsiteDirectorErrorCode = (typeof WEBSITE_DIRECTOR_ERROR_CODES)[number];

export class WebsiteDirectorError extends Error {
  readonly code: WebsiteDirectorErrorCode;

  constructor(message: string, code: WebsiteDirectorErrorCode) {
    super(message);
    this.name = "WebsiteDirectorError";
    this.code = code;
  }
}

export function isWebsiteDirectorError(error: unknown): error is WebsiteDirectorError {
  return error instanceof WebsiteDirectorError;
}
