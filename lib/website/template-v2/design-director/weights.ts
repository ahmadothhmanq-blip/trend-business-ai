import type { DesignIssueCategory } from "@/lib/website/template-v2/design-director/types";

/** Relative weight of each quality dimension (sums to 1.0). */
export const SCORE_WEIGHTS: Record<DesignIssueCategory, number> = {
  "visual-quality": 0.1,
  conflict: 0.1,
  hierarchy: 0.08,
  "brand-identity": 0.1,
  density: 0.08,
  rhythm: 0.08,
  "layout-repetition": 0.08,
  "color-harmony": 0.08,
  typography: 0.07,
  cta: 0.07,
  image: 0.07,
  navigation: 0.04,
  footer: 0.03,
  responsive: 0.04,
  accessibility: 0.08,
  seo: 0.04,
};

export const SEVERITY_PENALTY: Record<string, number> = {
  critical: 25,
  warning: 10,
  info: 4,
};

export const APPROVAL_THRESHOLD = 70;

export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  F: 0,
} as const;

export const ALL_CATEGORIES: DesignIssueCategory[] = [
  "visual-quality",
  "conflict",
  "hierarchy",
  "brand-identity",
  "density",
  "rhythm",
  "layout-repetition",
  "color-harmony",
  "typography",
  "cta",
  "image",
  "navigation",
  "footer",
  "responsive",
  "accessibility",
  "seo",
];

/** Personality → expected palette presets. */
export const BRAND_PALETTE_AFFINITY: Record<string, string[]> = {
  luxury: ["luxury-editorial", "cinematic-dark"],
  professional: ["corporate-premium", "modern-startup"],
  bold: ["bold-creative", "modern-startup"],
  warm: ["warm-service", "luxury-editorial"],
  minimal: ["minimal-mono"],
  technical: ["modern-startup", "minimal-mono"],
  playful: ["bold-creative", "modern-startup"],
};

/** Personality → expected typography presets. */
export const BRAND_TYPOGRAPHY_AFFINITY: Record<string, string[]> = {
  luxury: ["editorial-luxury", "executive-serif"],
  professional: ["executive-serif", "modern-sans"],
  bold: ["modern-sans", "warm-humanist"],
  warm: ["warm-humanist", "executive-serif"],
  minimal: ["minimal-geometric"],
  technical: ["technical-mono", "modern-sans"],
  playful: ["warm-humanist", "modern-sans"],
};

/** Visual style → compatible motion intensities. */
export const STYLE_MOTION_COMPAT: Record<string, string[]> = {
  minimal: ["none", "subtle"],
  corporate: ["subtle", "moderate"],
  modern: ["subtle", "moderate", "expressive"],
  luxury: ["subtle", "moderate"],
  cinematic: ["moderate", "expressive"],
  bold: ["moderate", "expressive"],
  editorial: ["subtle", "moderate"],
};
