/**
 * Generic AI Core Engine layer contracts.
 * Product-agnostic — Website Builder keeps its own layer types until Phase 1 migration.
 */

import type { TemplateSelection } from "@/lib/ai-core/templates/types";

export type CoreRunMode = "generate" | "regenerate" | "continue" | "retry";

export type CoreBrief = {
  prompt: string;
  productId: string;
  language?: string;
  theme?: string;
  features?: string[];
  metadata?: Record<string, unknown>;
};

export type CoreBusinessProfile = {
  projectName: string;
  industry: string;
  targetAudience: string;
  businessGoals: string[];
  offer: string;
  tone: string;
  geography: string;
  competitors: string[];
  kpis: string[];
  summary: string;
  requiredSections: string[];
};

export type CoreStrategyPage = {
  name: string;
  path: string;
  purpose: string;
  keySections: string[];
  primaryCta?: string;
};

export type CoreStrategySection = {
  id: string;
  page: string;
  name: string;
  goal: string;
  contentNotes: string;
};

export type CoreContentStrategy = {
  brandVoice: string;
  messagingPillars: string[];
  proofPoints: string[];
  objectionHandlers: string[];
  seoTopics: string[];
};

export type CoreProductStrategy = {
  positioning: string;
  sitemap: string[];
  pages: CoreStrategyPage[];
  sectionPlan: CoreStrategySection[];
  conversionFunnel: string[];
  contentStructure: string[];
  contentStrategy: CoreContentStrategy;
  ctas: string[];
  seoFocus: string[];
};

export type CoreDesignStylePreset =
  | "luxury"
  | "modern"
  | "corporate"
  | "minimal"
  | "creative";

export type CoreDesignColorTokens = {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  surface: string;
  background: string;
  foreground: string;
};

export type CoreDesignTypography = {
  headingFont: string;
  bodyFont: string;
  scale: string[];
  notes: string;
};

/** Phase 7 extended design decisions (optional for backward compatibility). */
export type CoreDesignSpacingSystem = {
  unit: string;
  scale: string[];
  sectionGap: string;
  containerMax: string;
  notes: string;
};

export type CoreDesignUiStyle = {
  density: "airy" | "balanced" | "compact";
  corners: "sharp" | "soft" | "pill";
  elevation: "flat" | "soft" | "elevated";
  contrast: "subtle" | "medium" | "high";
  notes: string;
};

export type CoreDesignComponentStyle = {
  buttons: string;
  cards: string;
  inputs: string;
  navigation: string;
  palette: string[];
};

export type CoreDesignAnimationStyle = {
  motion: "none" | "subtle" | "expressive";
  easing: string;
  duration: string;
  entrances: string[];
  notes: string;
};

export type CoreDesignSystem = {
  style: string;
  stylePreset: CoreDesignStylePreset;
  industryPattern: string;
  colors: CoreDesignColorTokens;
  typography: CoreDesignTypography;
  layoutRules: string[];
  layoutStyle: string;
  uiPatterns: string[];
  componentPalette: string[];
  spacingScale: string[];
  borderRadius: string;
  shadowStyle: string;
  /** Phase 7 AI Design System extensions */
  spacingSystem?: CoreDesignSpacingSystem;
  uiStyle?: CoreDesignUiStyle;
  componentStyle?: CoreDesignComponentStyle;
  animationStyle?: CoreDesignAnimationStyle;
};

export type CoreAssetRole =
  | "hero"
  | "product"
  | "background"
  | "brand"
  | "icon"
  | "section"
  | "other";

export type CoreAssetStatus = "generated" | "fallback" | "pending" | "failed";

export type CoreAssetItem = {
  id: string;
  role: CoreAssetRole;
  name: string;
  prompt: string;
  alt: string;
  url: string | null;
  storagePath: string | null;
  status: CoreAssetStatus;
  mimeType?: string;
};

export type CoreAssetManifest = {
  items: CoreAssetItem[];
  provider?: string;
  generatedAt?: string;
};

export type CoreQualityDimensionName =
  | "structure"
  | "responsive"
  | "seo"
  | "content"
  | "brand"
  | "media";

export type CoreQualityDimension = {
  name: CoreQualityDimensionName;
  passed: boolean;
  issues: string[];
};

export type CoreQualityReport = {
  passed: boolean;
  dimensions: CoreQualityDimension[];
  weakSections: string[];
  improveApplied: boolean;
  improveNotes?: string[];
  issues: string[];
};

/** Artifacts accumulated across the Core layer pipeline. */
export type CoreLayerArtifacts = {
  brief: CoreBrief;
  /** Industry template selection (Phase 6 Template Engine). */
  templateSelection?: TemplateSelection;
  businessProfile?: CoreBusinessProfile;
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  assetManifest?: CoreAssetManifest;
  qualityReport?: CoreQualityReport;
  /** Opaque product generation payload (files, media, copy, etc.) */
  generationOutput?: unknown;
  /** Opaque finalized delivery payload for persistence/UI */
  finalOutput?: unknown;
};

export type CoreLayerName =
  | "idea"
  | "strategy"
  | "design"
  | "assets"
  | "generation"
  | "quality"
  | "finalize"
  | "template";

export type CoreLayerFlags = {
  idea?: boolean;
  strategy?: boolean;
  design?: boolean;
  assets?: boolean;
  /** Always required for a useful run */
  generation: true;
  quality?: boolean;
  finalize?: boolean;
};

export type CoreRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type CoreProgressEvent = {
  layer: CoreLayerName | "start" | "done" | "error";
  message: string;
  at: string;
};
