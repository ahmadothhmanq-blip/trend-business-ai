/**
 * Canonical Brand Identity Model — unified Brand Studio output.
 */

import type {
  BrandAsset,
  BrandColorEntry,
  BrandTypographySystem,
  BrandVoiceTone,
} from "@/plugins/brand-identity/types";

export type BrandLogoVariant = {
  id: string;
  name: string;
  variant: "primary" | "icon" | "favicon" | "monochrome" | "concept";
  format: "svg" | "png";
  svg?: string;
  pngDataUrl?: string;
  description?: string;
};

export type BrandLogoConcept = {
  id: string;
  name: string;
  description: string;
  svg: string;
  selected?: boolean;
};

export type BrandStrategyModel = {
  mission: string;
  vision: string;
  values: string[];
  positioning: string;
  audience: string;
  personality: string;
  archetype: string;
  differentiators: string[];
  competitors: string[];
  emotionalAppeal: string;
  document: string;
};

export type BrandPositioningModel = {
  statement: string;
  marketPosition: string;
  valueProposition: string;
  tagline: string;
  elevatorPitch: string;
};

export type BrandVoiceModel = BrandVoiceTone & {
  principles: string[];
};

export type BrandLogoDirectionModel = {
  style: string;
  iconConcept: string;
  symbolism: string[];
  usageGuidelines: string[];
  clearSpace: string;
  doNot: string[];
  guidelinesDocument: string;
};

export type BrandKitTokens = {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  surface: string;
  background: string;
  foreground: string;
  headingFont: string;
  bodyFont: string;
  voiceTone: string;
  tagline: string;
};

/** Complete structured brand identity for Brand Studio. */
export type BrandIdentityModel = {
  id?: string;
  brandName: string;
  brandType: string;
  industry: string;
  description: string;
  strategy: BrandStrategyModel;
  positioning: BrandPositioningModel;
  voice: BrandVoiceModel;
  colors: BrandColorEntry[];
  typography: BrandTypographySystem;
  logoDirection: BrandLogoDirectionModel;
  logos: BrandLogoConcept[];
  logoVariants: BrandLogoVariant[];
  assets: BrandAsset[];
  files: { path: string; content: string; language: string }[];
  tokens: BrandKitTokens;
  qualityScore: number;
  qualityIssues: string[];
  templateId?: string;
  presetId?: string;
  generatedAt: string;
};

export type BrandTemplateDefinition = {
  id: string;
  label: string;
  category: "industry" | "style";
  industry?: string;
  style?: string;
  description: string;
  brandType: string;
  personality: string;
  deliverables: string[];
  previewColors: string[];
  recommended?: boolean;
};

export type BrandAssistantResult = {
  applied: boolean;
  command?: string;
  message: string;
  actions: string[];
  model: BrandIdentityModel;
  creditsUsed?: number;
};

export type BrandKitRecord = {
  id: string;
  generation_id: string;
  user_id: string;
  name: string;
  version: number;
  model: BrandIdentityModel;
  tokens: BrandKitTokens;
  share_token: string | null;
  created_at: string;
  updated_at: string;
};

export type BrandAssetRecord = {
  id: string;
  kit_id: string;
  user_id: string;
  generation_id: string;
  asset_type: string;
  name: string;
  format: string;
  storage_path: string | null;
  content: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type BrandApplyTarget = "website-builder" | "app-builder" | "video-studio";

export type BrandApplyPayload = {
  target: BrandApplyTarget;
  brandName: string;
  tokens: BrandKitTokens;
  colors: BrandColorEntry[];
  typography: BrandTypographySystem;
  voice: BrandVoiceModel;
  logoVariants: BrandLogoVariant[];
  guidelines: string;
};
