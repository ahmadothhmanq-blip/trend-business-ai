/** Website Quality Benchmark System (WQBS) — Phase 1 */

export const WQBS_VERSION = "1.0.0" as const;
export const WQBS_PHASE = "wqbs-1" as const;
export const WQBS_PACKAGE_ID = "website-quality-benchmark" as const;

/** Default pass threshold for quality gate */
export const WQBS_PASS_THRESHOLD = 70;

/** Sub-dimension score below this triggers recommendations */
export const WQBS_WEAK_SCORE_THRESHOLD = 75;

export const WQBS_BENCHMARK_MODES = ["quick", "standard", "enterprise"] as const;

export const WQBS_CATEGORIES = [
  "visualDesign",
  "userExperience",
  "business",
  "seo",
  "performance",
  "accessibility",
  "content",
  "localization",
] as const;

export const WQBS_REFERENCE_PLATFORMS = [
  "wix-ai",
  "framer",
  "webflow",
  "squarespace",
  "hostinger",
  "durable",
  "lovable",
  "custom",
] as const;

/** Category weights for overall score (sum = 1) */
export const WQBS_CATEGORY_WEIGHTS: Record<
  (typeof WQBS_CATEGORIES)[number],
  number
> = {
  visualDesign: 0.14,
  userExperience: 0.14,
  business: 0.13,
  seo: 0.12,
  performance: 0.12,
  accessibility: 0.12,
  content: 0.12,
  localization: 0.11,
};

/** Categories evaluated per benchmark mode */
export const WQBS_MODE_CATEGORIES: Record<
  (typeof WQBS_BENCHMARK_MODES)[number],
  readonly (typeof WQBS_CATEGORIES)[number][]
> = {
  quick: ["visualDesign", "userExperience", "business", "seo"],
  standard: WQBS_CATEGORIES,
  enterprise: WQBS_CATEGORIES,
};

/** Recommendation count caps per mode */
export const WQBS_MODE_RECOMMENDATION_LIMIT: Record<
  (typeof WQBS_BENCHMARK_MODES)[number],
  number
> = {
  quick: 8,
  standard: 16,
  enterprise: 32,
};
