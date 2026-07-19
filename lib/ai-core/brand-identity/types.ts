/**
 * Brand Identity Intelligence — complete professional brand identity
 * produced before website design generation.
 */

import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type { DesignPresetId } from "@/lib/ai-core/design-system/types";

/** Named brand presets used as starting systems. */
export type BrandPresetId =
  | "luxury-brand"
  | "technology-brand"
  | "corporate-brand"
  | "creative-brand"
  | "minimal-brand"
  | "premium-saas-brand";

export type BrandPersonality =
  | "refined"
  | "bold"
  | "trustworthy"
  | "playful"
  | "innovative"
  | "calm"
  | "authoritative"
  | "warm";

export type BrandStrategyBrief = {
  industry: string;
  businessType: string;
  targetAudience: string;
  marketPosition: string;
  brandPersonality: BrandPersonality;
  brandStyle: string;
  brandVoice: {
    tone: string;
    principles: string[];
    doExamples: string[];
    dontExamples: string[];
    taglineDirection: string;
  };
  visualDirection: string;
  archetype: string;
};

export type BrandColorSystem = {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  surface: string;
  background: string;
  foreground: string;
  onPrimary: string;
  roles: Array<{ name: string; hex: string; role: string; usage: string }>;
  direction: string;
};

export type BrandTypographySystem = {
  displayFont: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  pairing: string;
  scaleNotes: string;
  direction: string;
};

export type BrandSpacingRules = {
  sectionY: string;
  sectionYMobile: string;
  containerMax: string;
  stack: string;
  density: "airy" | "balanced" | "compact";
  notes: string;
};

export type BrandUiStyle = {
  density: "airy" | "balanced" | "compact";
  corners: "sharp" | "soft" | "pill";
  elevation: "flat" | "soft" | "elevated";
  contrast: "subtle" | "medium" | "high";
  buttons: string;
  cards: string;
  navigation: string;
  notes: string;
};

export type BrandLogoDirection = {
  logoStyle: string;
  iconConcept: string;
  symbolism: string[];
  usageGuidelines: string[];
  clearSpace: string;
  doNot: string[];
};

/** Complete brand identity package for website generation. */
export type BrandIdentityBrief = {
  id: string;
  brandName: string;
  presetId: BrandPresetId;
  /** Maps into Design / Premium engines. */
  premiumStyleId: PremiumStyleId;
  enginePreset: DesignPresetId;
  strategy: BrandStrategyBrief;
  colors: BrandColorSystem;
  typography: BrandTypographySystem;
  spacing: BrandSpacingRules;
  uiStyle: BrandUiStyle;
  imageDirection: string;
  animationDirection: string;
  componentStyle: string;
  logo: BrandLogoDirection;
  artDirectionNotes: string[];
  confidence: number;
  reason: string;
  summary: string;
};
