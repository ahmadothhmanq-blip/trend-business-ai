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

export type WebsiteStrategy = {
  positioning: string;
  sitemap: string[];
  pages: StrategyPage[];
  sectionPlan: StrategySection[];
  conversionFunnel: string[];
  contentStructure: string[];
  ctas: string[];
  seoFocus: string[];
};

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
  industryPattern: string;
  colors: DesignColorTokens;
  typography: DesignTypography;
  layoutRules: string[];
  componentPalette: string[];
  spacingScale: string[];
  borderRadius: string;
  shadowStyle: string;
};

export type AssetRole =
  | "hero"
  | "product"
  | "background"
  | "brand"
  | "icon"
  | "section";

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
};

export type AssetManifest = {
  items: AssetItem[];
  provider?: string;
  generatedAt?: string;
};

export type QualityCheckDimension = {
  name: "structure" | "responsive" | "seo" | "content";
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
};
