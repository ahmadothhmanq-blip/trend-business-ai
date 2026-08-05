/** AI Website Review Studio — Phase 1 */

export const REVIEW_STUDIO_VERSION = "1.0.0" as const;
export const REVIEW_STUDIO_PHASE = "review-studio-1" as const;
export const REVIEW_STUDIO_PACKAGE_ID = "website-review-studio" as const;

export const REVIEW_AREAS = [
  "hero",
  "navigation",
  "cta",
  "trust",
  "testimonials",
  "pricing",
  "forms",
  "footer",
  "seo",
  "content",
  "accessibility",
  "performance",
  "localization",
] as const;

export const REVIEW_PRIORITIES = [
  "critical",
  "high",
  "medium",
  "low",
  "nice-to-have",
] as const;

export const ANALYZER_DIMENSIONS = [
  "layout",
  "sections",
  "components",
  "businessLogic",
  "seo",
  "accessibility",
  "performance",
  "content",
  "conversion",
  "brandConsistency",
] as const;

/** Max versions retained per review session (Phase 1 in-memory) */
export const REVIEW_STUDIO_MAX_VERSIONS = 20;
