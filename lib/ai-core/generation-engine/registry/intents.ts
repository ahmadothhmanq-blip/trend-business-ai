import type { Tbge2IntentCategory } from "@/lib/ai-core/generation-engine/core/types";

export type Tbge2IntentPattern = {
  category: Tbge2IntentCategory;
  keywords: string[];
  weight: number;
};

/** Intent detection patterns — deterministic keyword matching. */
export const TBGE2_INTENT_PATTERNS: readonly Tbge2IntentPattern[] = [
  { category: "landing-page", keywords: ["landing page", "landing", "lead capture", "single page"], weight: 1.2 },
  { category: "portfolio", keywords: ["portfolio", "showcase work", "creative studio", "photographer"], weight: 1.1 },
  { category: "restaurant", keywords: ["restaurant", "cafe", "bistro", "dining", "menu", "chef"], weight: 1.2 },
  { category: "medical", keywords: ["medical", "clinic", "hospital", "healthcare", "doctor", "dental"], weight: 1.2 },
  { category: "saas", keywords: ["saas", "software", "platform", "subscription", "b2b software"], weight: 1.2 },
  { category: "ecommerce", keywords: ["ecommerce", "e-commerce", "online store", "shop", "sell products"], weight: 1.2 },
  { category: "real-estate", keywords: ["real estate", "property", "realtor", "listing", "homes for sale"], weight: 1.2 },
  { category: "legal", keywords: ["law firm", "legal", "attorney", "lawyer", "litigation"], weight: 1.1 },
  { category: "education", keywords: ["education", "school", "university", "course", "academy", "training"], weight: 1.1 },
  { category: "agency", keywords: ["agency", "marketing agency", "creative agency", "consulting"], weight: 1.0 },
  { category: "blog", keywords: ["blog", "magazine", "editorial", "news site", "publication"], weight: 1.0 },
  { category: "app", keywords: ["mobile app", "web app", "application", "dashboard app"], weight: 1.0 },
  { category: "nonprofit", keywords: ["nonprofit", "charity", "foundation", "ngo", "donate"], weight: 1.0 },
  { category: "website", keywords: ["website", "business site", "company site", "corporate"], weight: 0.8 },
] as const;

export const TBGE2_INTENT_TO_INDUSTRY: Record<Tbge2IntentCategory, string> = {
  website: "business",
  "landing-page": "landing-page",
  portfolio: "agency",
  restaurant: "restaurant",
  medical: "clinic",
  saas: "saas",
  ecommerce: "ecommerce",
  "real-estate": "real-estate",
  legal: "law",
  education: "education",
  agency: "agency",
  blog: "blog",
  app: "technology",
  nonprofit: "business",
  unknown: "business",
};
