/**
 * GenerationSpec — canonical TBGE contract between Cognitive and Assembly planes.
 * Sprint 1: types + validation only.
 */

import type { WebsiteStructure } from "@/lib/tbge/spec/website-structure";

export const GENERATION_SPEC_VERSION = "1.0" as const;

export type TbgeProductId =
  | "website-builder"
  | "landing-page-builder"
  | "app-builder"
  | "crm"
  | "erp"
  | "ai-agents";

export type TbgeRunMode = "generate" | "regenerate" | "continue" | "retry";

export type TbgeGenerationProfile = "professional" | "fast" | "ultra";

export type GenerationSpecLocale = {
  language: string;
  dir?: "ltr" | "rtl";
  rtl?: boolean;
  htmlLang?: string;
};

export type GenerationSpecBusiness = {
  name: string;
  industry: string;
  industryId: string;
  audience: string[];
  goals: string[];
  tone: string;
  offer: string;
  geography?: string;
};

export type DesignTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface?: string;
  neutral?: string;
};

export type GenerationSpecDesign = {
  templateId: string;
  templateIntelligenceId?: string;
  premiumTemplateId?: string;
  tokens: DesignTokens;
  componentPalette: string[];
  layoutProfile?: string;
  imageStyle?: string;
  headingFont?: string;
  bodyFont?: string;
};

export type SectionContent = {
  id: string;
  type: string;
  headline?: string;
  subheadline?: string;
  body?: string;
  cta?: string;
  items?: string[];
};

export type PageContent = {
  title: string;
  description?: string;
  seo?: string[];
  sections: SectionContent[];
};

export type ContentModel = {
  brand: {
    voice: string;
    tagline?: string;
    positioning?: string;
  };
  pages: Record<string, PageContent>;
  navigation: Array<{ label: string; href: string }>;
  ctas: string[];
  localized: boolean;
};

export type DatabaseCapability = {
  provider: "none" | "prisma" | "supabase";
  entities?: string[];
};

export type GenerationSpecCapabilities = {
  auth: boolean;
  database: DatabaseCapability;
  dashboard: boolean;
  ecommerce: boolean;
  saas: boolean;
};

export type GeneratorId =
  | "scaffold-static"
  | "scaffold-css"
  | "layout-root"
  | "ux-shells"
  | "ui-primitives"
  | "lib-seo"
  | "lib-utils"
  | "lib-site-images"
  | "page-secondary"
  | "page-home"
  | "feature-auth"
  | "feature-dashboard"
  | "feature-database"
  | "feature-api"
  | "package-sync"
  | "component-bind"
  | "custom-llm";

export type FileGraphWaveId =
  | "static-scaffold"
  | "foundation"
  | "components"
  | "hooks-api"
  | "pages"
  | "inject"
  | "configs-tail";

export type FileGraphNode = {
  path: string;
  generator: GeneratorId;
  deps: string[];
  wave: FileGraphWaveId;
  priority: number;
  optional?: boolean;
};

/** Product-shaped structure — website first; extended in future sprints. */
export type ProductStructure = WebsiteStructure;

export type GenerationSpecProvenance = {
  plannerModel?: string;
  contentModel?: string;
  lockedAt: string;
  promptHash: string;
};

export type GenerationSpec = {
  specVersion: typeof GENERATION_SPEC_VERSION;
  specId: string;
  promptHash: string;
  productId: TbgeProductId;
  profile: TbgeGenerationProfile;
  mode: TbgeRunMode;
  locale: GenerationSpecLocale;
  business: GenerationSpecBusiness;
  structure: ProductStructure;
  design: GenerationSpecDesign;
  content?: ContentModel;
  capabilities: GenerationSpecCapabilities;
  fileGraph: FileGraphNode[];
  provenance: GenerationSpecProvenance;
};

export type SpecValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };
