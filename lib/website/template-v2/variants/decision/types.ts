import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import type { SectionKind, VariantComposition } from "@/lib/website/template-v2/variants/types";

export type BrandPersonality =
  | "professional"
  | "bold"
  | "warm"
  | "luxury"
  | "playful"
  | "minimal"
  | "technical";

export type BusinessSize = "solo" | "small" | "medium" | "enterprise";

export type TargetAudience =
  | "b2b"
  | "b2c"
  | "enterprise"
  | "luxury"
  | "startup"
  | "consumer";

export type WebsiteGoal =
  | "lead-generation"
  | "sales"
  | "booking"
  | "portfolio"
  | "saas"
  | "brand-awareness"
  | "ecommerce"
  | "trust";

export type ContentDensity = "sparse" | "medium" | "dense";

export type ImageAvailability = "none" | "limited" | "moderate" | "rich";

export type BusinessModel = "product" | "service" | "hybrid";

export type PremiumLevel = "standard" | "premium" | "luxury";

export type VisualStyle =
  | "minimal"
  | "editorial"
  | "cinematic"
  | "corporate"
  | "modern"
  | "luxury"
  | "bold";

export type DevicePriority = "mobile-first" | "balanced" | "desktop-first";

export type AccessibilityLevel = "standard" | "enhanced" | "strict";

export type LanguageDirection = "ltr" | "rtl";

/** Input context for variant decision — no generation pipeline coupling. */
export type VariantDecisionContext = {
  industry?: string;
  businessSubtype?: string;
  brandPersonality?: BrandPersonality;
  businessSize?: BusinessSize;
  targetAudience?: TargetAudience;
  websiteGoal?: WebsiteGoal;
  languageDirection?: LanguageDirection;
  contentDensity?: ContentDensity;
  imageAvailability?: ImageAvailability;
  businessModel?: BusinessModel;
  premiumLevel?: PremiumLevel;
  visualStyle?: VisualStyle;
  devicePriority?: DevicePriority;
  accessibilityLevel?: AccessibilityLevel;
  /** Sections to decide; defaults to all registered section kinds. */
  sections?: SectionKind[];
  /** Stable seed for deterministic tie-breaking (e.g. project id). */
  seed?: string;
};

export type VariantDecisionProfile = {
  sectionKind: SectionKind;
  variantId: string;
  composition: VariantComposition;
  imageSlots: ImageSlotKind[];
  tags: string[];
  traits: {
    requiresImages: boolean;
    imageIntensity: 0 | 1 | 2 | 3;
    visualWeight: number;
    conversionFocus: number;
    premiumFit: number;
    rtlFriendly: number;
    accessibility: number;
    mobileFirst: number;
    density: number;
    b2b: number;
    b2c: number;
    enterprise: number;
    luxury: number;
    startup: number;
    product: number;
    service: number;
    goals: Partial<Record<WebsiteGoal, number>>;
    styles: Partial<Record<VisualStyle, number>>;
    industries: Record<string, number>;
  };
};

export type VariantScoreBreakdown = {
  factor: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  note?: string;
};

export type ScoredVariant = {
  sectionKind: SectionKind;
  variantId: string;
  totalScore: number;
  compatible: boolean;
  incompatibilityReasons: string[];
  breakdown: VariantScoreBreakdown[];
  diversityPenalty: number;
  finalScore: number;
};

export type VariantSelection = {
  sectionKind: SectionKind;
  variantId: string;
  score: number;
  composition: VariantComposition;
  runnerUp?: { variantId: string; score: number };
  reasons: string[];
  breakdown: VariantScoreBreakdown[];
};

export type VariantDecisionPlan = {
  selections: Partial<Record<SectionKind, VariantSelection>>;
  scored: Partial<Record<SectionKind, ScoredVariant[]>>;
  diversityApplied: boolean;
  context: VariantDecisionContext;
  engineVersion: string;
};

export type VariantDecisionValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};
