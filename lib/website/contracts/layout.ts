/**
 * Industry layout family contract — shared between AKB and Website Builder.
 */

export type IndustryLayoutFamily =
  | "commerce-grid"
  | "corporate-trust"
  | "editorial-magazine"
  | "product-saas"
  | "showroom"
  | "hospitality"
  | "classic-stack";

export const INDUSTRY_LAYOUT_FAMILIES: readonly IndustryLayoutFamily[] = [
  "commerce-grid",
  "corporate-trust",
  "editorial-magazine",
  "product-saas",
  "showroom",
  "hospitality",
  "classic-stack",
] as const;
