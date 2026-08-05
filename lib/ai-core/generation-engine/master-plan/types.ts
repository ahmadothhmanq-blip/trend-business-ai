import type { MASTER_PLAN_SCHEMA_VERSION } from "@/lib/ai-core/generation-engine/master-plan/constants";
import type {
  Tbge2PagePlan,
  Tbge2PlanningInput,
  Tbge2RequirementId,
  Tbge2SectionPlan,
  Tbge2SectionType,
  Tbge2WebsiteType,
} from "@/lib/ai-core/generation-engine/core/types";

/** Master Plan pipeline stages. */
export type MasterPlanPipelineStage =
  | "tbge_analysis"
  | "master_plan_build"
  | "master_plan_validate"
  | "llm_request"
  | "structured_content";

export type MasterPlanProject = {
  id: string;
  name: string;
  productId: string;
  sourcePromptHash: string;
};

export type MasterPlanBusiness = {
  name: string;
  industry: string;
  industryId: string;
  businessType: string;
  offer?: string;
  confidence: number;
};

export type MasterPlanBrand = {
  style: string;
  tone: string;
  voice: string;
};

export type MasterPlanLocalization = {
  language: string;
  country?: string;
  strategy: "single" | "multi" | "rtl-aware";
  direction: "ltr" | "rtl";
  htmlLang: string;
  localeCode: string;
};

export type MasterPlanNavigationItem = {
  label: string;
  href: string;
  order: number;
};

export type MasterPlanPage = Tbge2PagePlan & {
  sections: string[];
  metaTitle?: string;
  metaDescription?: string;
};

export type MasterPlanSection = Tbge2SectionPlan & {
  componentId: string;
  contentBlocks: string[];
};

export type MasterPlanComponent = {
  id: string;
  sectionType: Tbge2SectionType;
  componentPath: string;
  required: boolean;
};

export type MasterPlanSeoStrategy = {
  priority: "high" | "medium" | "low";
  targetKeywords: string[];
  structuredData: string[];
  hreflang: boolean;
  sitemap: boolean;
  localizedSlugs: boolean;
};

export type MasterPlanContentStrategy = {
  tone: string;
  voice: string;
  blockCount: number;
  llmOwnedFields: readonly string[];
  forbiddenLlmFields: readonly string[];
};

export type MasterPlanMediaStrategy = {
  heroImage: boolean;
  gallery: boolean;
  teamPhotos: boolean;
  productImages: boolean;
  imageStyle: string;
  altTextRequired: boolean;
};

export type MasterPlanCtaStrategy = {
  primary: string;
  secondary?: string;
  placement: Array<{ pageId: string; sectionId: string }>;
  conversionGoal: string;
};

export type MasterPlanTrustStrategy = {
  testimonials: boolean;
  trustBadges: boolean;
  stats: boolean;
  team: boolean;
  caseStudies: boolean;
  certifications: boolean;
};

export type MasterPlanLegalPage = {
  id: string;
  kind: "privacy" | "terms" | "cookies" | "imprint";
  path: string;
  required: boolean;
};

export type MasterPlanPerformanceTargets = {
  lighthousePerformance: number;
  lighthouseSeo: number;
  lighthouseAccessibility: number;
  firstContentfulPaintMs: number;
  largestContentfulPaintMs: number;
};

export type MasterPlanAccessibilityTargets = {
  wcagLevel: "AA" | "AAA";
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  colorContrastRatio: number;
  reducedMotionSupport: boolean;
};

export type MasterPlanFutureExpansion = {
  phases: Array<{
    id: string;
    label: string;
    description: string;
    enabled: boolean;
  }>;
  supportedProviders: readonly string[];
};

/**
 * Master Plan — Single Source of Truth for every AI provider.
 * LLMs execute copy only; they never make planning decisions.
 */
export type MasterPlan = {
  id: string;
  version: number;
  createdAt: string;
  schemaVersion: typeof MASTER_PLAN_SCHEMA_VERSION;
  providerIndependent: true;

  project: MasterPlanProject;
  business: MasterPlanBusiness;
  audience: string[];
  goals: string[];
  brand: MasterPlanBrand;
  localization: MasterPlanLocalization;
  websiteType: Tbge2WebsiteType;
  conversionStrategy: string;

  pages: MasterPlanPage[];
  navigation: MasterPlanNavigationItem[];
  sections: MasterPlanSection[];
  componentsNeeded: MasterPlanComponent[];
  businessFeatures: Tbge2RequirementId[];

  seoStrategy: MasterPlanSeoStrategy;
  contentStrategy: MasterPlanContentStrategy;
  mediaStrategy: MasterPlanMediaStrategy;
  ctaStrategy: MasterPlanCtaStrategy;
  trustStrategy: MasterPlanTrustStrategy;
  legalPages: MasterPlanLegalPage[];
  performanceTargets: MasterPlanPerformanceTargets;
  accessibilityTargets: MasterPlanAccessibilityTargets;
  futureExpansion: MasterPlanFutureExpansion;
};

export type MasterPlanInput = Tbge2PlanningInput & {
  projectName?: string;
};

export type MasterPlanMeta = {
  phase: typeof import("@/lib/ai-core/generation-engine/master-plan/constants").MASTER_PLAN_PHASE;
  schemaVersion: typeof MASTER_PLAN_SCHEMA_VERSION;
  resolvedAt: string;
  planHash: string;
  stagesCompleted: MasterPlanPipelineStage[];
};

export type MasterPlanResult =
  | {
      ok: true;
      masterPlan: MasterPlan;
      llmRequest: import("@/lib/ai-core/generation-engine/master-plan/llm-request-builder").MasterPlanContentLlmRequest;
      meta: MasterPlanMeta;
    }
  | {
      ok: false;
      errors: string[];
      stage: MasterPlanPipelineStage;
    };

export type MasterPlanValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };
