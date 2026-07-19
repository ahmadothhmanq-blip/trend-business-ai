/** Layer artifacts for the AI Design & Development Engine. */

export type BusinessProfile = {
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
  /** Sections the business site must include (hero, proof, pricing, etc.) */
  requiredSections: string[];
};

export type StrategyPage = {
  name: string;
  path: string;
  purpose: string;
  keySections: string[];
  primaryCta?: string;
};

export type StrategySection = {
  id: string;
  page: string;
  name: string;
  goal: string;
  contentNotes: string;
};

export type ContentStrategy = {
  brandVoice: string;
  messagingPillars: string[];
  proofPoints: string[];
  objectionHandlers: string[];
  seoTopics: string[];
  /**
   * Optional AI quirk field. Models sometimes return `sections` here;
   * always normalized to string[] before use (never iterated raw).
   */
  sections?: string[];
};

export type WebsiteStrategy = {
  positioning: string;
  sitemap: string[];
  pages: StrategyPage[];
  sectionPlan: StrategySection[];
  conversionFunnel: string[];
  contentStructure: string[];
  contentStrategy: ContentStrategy;
  ctas: string[];
  seoFocus: string[];
};

export type DesignStylePreset =
  | "luxury"
  | "modern"
  | "corporate"
  | "minimal"
  | "creative"
  | "tech"
  | "premium-brand";

export type DesignColorTokens = {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  surface: string;
  background: string;
  foreground: string;
};

export type DesignTypography = {
  headingFont: string;
  bodyFont: string;
  scale: string[];
  notes: string;
};

export type DesignSystem = {
  style: string;
  /** Canonical style bucket used by scaffolds and prompts */
  stylePreset: DesignStylePreset;
  industryPattern: string;
  colors: DesignColorTokens;
  typography: DesignTypography;
  layoutRules: string[];
  layoutStyle: string;
  uiPatterns: string[];
  componentPalette: string[];
  spacingScale: string[];
  borderRadius: string;
  shadowStyle: string;
  /** Premium Design System Engine package when applied. */
  premium?: import("@/lib/ai-core/design-system/premium/types").PremiumDesignSystem;
};

export type AssetRole =
  | "hero"
  | "product"
  | "service"
  | "background"
  | "brand"
  | "icon"
  | "section"
  | "gallery"
  | "testimonial"
  | "other";

export type AssetStatus = "generated" | "fallback" | "pending" | "failed";

export type AssetItem = {
  id: string;
  role: AssetRole;
  name: string;
  prompt: string;
  alt: string;
  url: string | null;
  storagePath: string | null;
  status: AssetStatus;
  mimeType?: string;
  metadata?: {
    purpose?:
      | "hero"
      | "section"
      | "product"
      | "service"
      | "background"
      | "gallery"
      | "brand"
      | "testimonial";
    section?: string;
    style?: string;
    prompt?: string;
    provider?: string;
    artDirection?: string;
  };
};

export type AssetManifest = {
  items: AssetItem[];
  provider?: string;
  generatedAt?: string;
  engine?: string;
  /** Advanced AI Assets Engine quality report */
  qualityReport?: import("@/lib/ai-core/image-engine/validate").AssetQualityReport;
  /** Poster-first video preparation package */
  videoPackage?: import("@/lib/ai-core/image-engine/video").VideoAssetPackage;
};

export type QualityCheckDimension = {
  name:
    | "structure"
    | "responsive"
    | "seo"
    | "content"
    | "brand"
    | "media"
    | "performance";
  passed: boolean;
  issues: string[];
};

export type QualityReport = {
  passed: boolean;
  dimensions: QualityCheckDimension[];
  weakSections: string[];
  improveApplied: boolean;
  improveNotes?: string[];
  issues: string[];
  /** Phase 8 Auto Quality extensions */
  score?: number;
  publishReady?: boolean;
  seoReadinessScore?: number;
  performanceScore?: number;
  designConsistencyPassed?: boolean;
};
