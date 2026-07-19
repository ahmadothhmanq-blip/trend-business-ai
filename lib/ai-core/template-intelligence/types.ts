/**
 * Template Intelligence System — visual template engine for Website Builder.
 * Selects / applies visual templates (layout · theme · components · motion)
 * without replacing Premium / Marketplace / Smart engines.
 */

import type { BrandPresetId } from "@/lib/ai-core/brand-identity/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { PremiumTemplateId } from "@/lib/ai-core/premium-templates/types";
import type {
  IndustryId,
  LayoutStyle,
  TemplateDesignPreset,
} from "@/lib/ai-core/templates/types";

export const TEMPLATE_INTELLIGENCE_CATEGORIES = [
  "Luxury",
  "Modern",
  "Minimal",
  "Corporate",
  "Creative",
  "Technology",
  "SaaS",
  "Automotive",
  "Restaurant",
  "Real Estate",
] as const;

export type TemplateIntelligenceCategory =
  (typeof TEMPLATE_INTELLIGENCE_CATEGORIES)[number];

export type TemplateAnimationProfile = {
  id: string;
  label: string;
  entrance: string;
  hover: string;
  scroll: string;
  reducedMotion: string;
};

export type TemplateColorSystem = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
};

export type TemplateTypographySystem = {
  display: string;
  heading: string;
  body: string;
};

export type TemplateIntelligenceDefinition = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: TemplateIntelligenceCategory;
  industry: IndustryId | "multi";
  designStyle: string;
  designPreset: TemplateDesignPreset;
  layoutStructure: LayoutStyle;
  colors: TemplateColorSystem;
  typography: TemplateTypographySystem;
  components: DesignRendererComponentId[];
  animations: TemplateAnimationProfile;
  brandPresetId: BrandPresetId;
  premiumTemplateId?: PremiumTemplateId;
  keywords: string[];
  audienceHints: string[];
  brandStyleHints: string[];
};

export type TemplateIntelligenceSelectionInput = {
  businessType?: string | null;
  industry?: string | null;
  targetAudience?: string | null;
  brandStyle?: string | null;
  designStyle?: string | null;
  prompt?: string | null;
  explicitTemplateId?: string | null;
  category?: TemplateIntelligenceCategory | null;
};

export type TemplateIntelligenceSelectionResult = {
  template: TemplateIntelligenceDefinition;
  confidence: number;
  source: "explicit" | "category" | "scored" | "default";
  reason: string;
  alternatives: TemplateIntelligenceDefinition[];
};
