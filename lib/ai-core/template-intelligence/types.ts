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

/** Spacing rhythm for a template preset. */
export type TemplateSpacingPreset = {
  sectionY: string;
  sectionYMobile: string;
  containerMax: string;
  stack: string;
  density: "airy" | "balanced" | "compact";
};

/** Button styling for a template preset. */
export type TemplateButtonPreset = {
  primary: "filled" | "ghost" | "outline";
  secondary: "filled" | "ghost" | "outline";
  radius: string;
  uppercase: boolean;
  weight: number;
};

/** Header / footer variant for a template preset. */
export type TemplateChromePreset = {
  headerVariant: "solid" | "transparent" | "minimal";
  headerComponent: string;
  footerVariant: "multi-column" | "minimal" | "editorial";
  footerComponent: string;
  navStyle: "pill" | "underline" | "plain";
};

/** Section role in the rendered page flow. */
export type TemplateSectionRole = "header" | "hero" | "section" | "footer";

/** One renderable section driven by a template component id. */
export type TemplateSectionSpec = {
  componentId: string;
  role: TemplateSectionRole;
  label: string;
  layoutVariant?: string;
  /** Index into preserved business content[] for body copy. */
  contentSlot?: number;
};

export type TemplateHeroVariant =
  | "luxury-editorial"
  | "saas-split"
  | "cinematic-full"
  | "minimal-bleed"
  | "corporate-trust"
  | "red-premium";

export type TemplateCardVariant =
  | "borderless"
  | "soft-shadow"
  | "structured"
  | "glass"
  | "premium-red";

export type TemplateNavigationVariant =
  | "transparent-underline"
  | "pill-modern"
  | "plain-minimal"
  | "solid-corporate"
  | "red-bold";

export type TemplateFooterVariant =
  | "multi-column"
  | "minimal"
  | "editorial"
  | "premium-red";

/** Section layout + card styling for a template preset. */
export type TemplateLayoutPreset = {
  heroLayout: string;
  sectionLayout: "grid" | "editorial" | "asymmetric" | "bento";
  cardsStyle: "borderless" | "soft-shadow" | "structured" | "glass";
  componentStyle: string;
  layoutVariant: string;
  heroVariant: TemplateHeroVariant;
  cardVariant: TemplateCardVariant;
  navigationVariant: TemplateNavigationVariant;
  footerVariant: TemplateFooterVariant;
};

/** Full visual preset applied when switching templates. */
export type TemplateVisualPreset = {
  spacing: TemplateSpacingPreset;
  buttons: TemplateButtonPreset;
  chrome: TemplateChromePreset;
  layout: TemplateLayoutPreset;
  /** Ordered page sections — drives live preview + structure. */
  sections: TemplateSectionSpec[];
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
  visualPreset?: TemplateVisualPreset;
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
