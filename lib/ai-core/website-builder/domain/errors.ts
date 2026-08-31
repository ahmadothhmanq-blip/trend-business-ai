/**
 * Website Builder domain errors (Phase 1).
 * No I/O, no API mapping.
 */

export const WEBSITE_BUILDER_ERROR_CODES = [
  "invalid_uuid",
  "ownership",
  "invalid_state",
  "illegal_transition",
  "invalid_project",
  "invalid_plan",
  "invalid_page",
  "invalid_section",
  "invalid_component",
  "invalid_theme",
  "invalid_seo",
  "invalid_navigation",
  "invalid_asset",
  "invalid_publish_target",
  "hierarchy_cycle",
  "duplicate_slug",
  "duplicate_order",
  "missing_homepage",
  "missing_required",
] as const;

export type WebsiteBuilderErrorCode = (typeof WEBSITE_BUILDER_ERROR_CODES)[number];

export class WebsiteBuilderError extends Error {
  readonly code: WebsiteBuilderErrorCode;

  constructor(message: string, code: WebsiteBuilderErrorCode) {
    super(message);
    this.name = "WebsiteBuilderError";
    this.code = code;
  }
}

export function isWebsiteBuilderError(error: unknown): error is WebsiteBuilderError {
  return error instanceof WebsiteBuilderError;
}
