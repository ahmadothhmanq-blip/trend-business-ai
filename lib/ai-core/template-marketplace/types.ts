/**
 * Template Marketplace Engine — browse, preview, select premium templates.
 */

import type { PremiumTemplateId } from "@/lib/ai-core/premium-templates/types";
import type {
  IndustryId,
  LayoutStyle,
  TemplateDesignPreset,
} from "@/lib/ai-core/templates/types";

export type MarketplaceCategory =
  | "restaurant"
  | "automotive"
  | "real-estate"
  | "saas"
  | "ecommerce"
  | "healthcare"
  | "agency"
  | "finance"
  | "portfolio"
  | "education"
  | "technology";

/** Premium design style variations (not generic blocks). */
export type MarketplaceStyleVariation =
  | "luxury"
  | "modern"
  | "corporate"
  | "creative"
  | "minimal"
  | "premium-saas"
  | "technology";

export type MarketplaceColorSystem = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
};

export type MarketplacePreviewSection = {
  key: string;
  label: string;
  kind: "hero" | "content" | "proof" | "cta" | "media" | "pricing" | "contact";
};

export type MarketplaceTemplate = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: MarketplaceCategory;
  /** Maps into Premium Templates System for generation. */
  premiumTemplateId: PremiumTemplateId;
  industry: IndustryId;
  style: MarketplaceStyleVariation;
  /** Design Intelligence / Brand Identity preset hint. */
  designPreset: TemplateDesignPreset;
  layoutType: LayoutStyle;
  colorSystem: MarketplaceColorSystem;
  typography: { display: string; body: string };
  recommendedAudience: string;
  features: string[];
  previewSections: MarketplacePreviewSection[];
  /** Systems this template seeds. */
  connectsTo: Array<
    | "design-intelligence"
    | "brand-identity"
    | "ai-assets"
    | "website-editor"
    | "final-quality"
  >;
  popular?: boolean;
  new?: boolean;
};

export type MarketplaceRecommendInput = {
  industry?: string | null;
  businessGoal?: string | null;
  audience?: string | null;
  prompt?: string | null;
  preferredStyle?: string | null;
  limit?: number;
};

export type MarketplaceRecommendation = {
  template: MarketplaceTemplate;
  score: number;
  reason: string;
};

export type MarketplaceRecommendResult = {
  recommendations: MarketplaceRecommendation[];
  summary: string;
  detected: {
    category?: MarketplaceCategory;
    style?: MarketplaceStyleVariation;
    industry?: string;
  };
};
