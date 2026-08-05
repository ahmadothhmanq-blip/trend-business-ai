import type { AWQE_SPEC_VERSION } from "@/lib/ai-core/generation-engine/quality-engine/constants";
import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";
import type { Tbge2RequirementId, Tbge2SectionType } from "@/lib/ai-core/generation-engine/core/types";

export type AwqePipelineStage =
  | "evaluate"
  | "recommend"
  | "improve"
  | "optimize"
  | "score"
  | "build_spec"
  | "validate";

export type AwqeQualityDimension =
  | "business"
  | "conversion"
  | "content"
  | "ux"
  | "accessibility"
  | "seo"
  | "trust"
  | "visualHierarchy"
  | "performance";

export type AwqeQualityScores = {
  overall: number;
  seo: number;
  ux: number;
  conversion: number;
  accessibility: number;
  performance: number;
  business: number;
  content: number;
};

export type AwqeDimensionEvaluation = {
  dimension: AwqeQualityDimension;
  score: number;
  signals: string[];
  issues: string[];
};

export type AwqeEvaluationResult = {
  dimensions: AwqeDimensionEvaluation[];
  scores: AwqeQualityScores;
};

export type AwqeRecommendation = {
  id: string;
  dimension: AwqeQualityDimension;
  priority: "high" | "medium" | "low";
  message: string;
  actionable: boolean;
};

export type AwqeImprovementReport = {
  strengths: string[];
  weaknesses: string[];
  recommendations: AwqeRecommendation[];
  appliedImprovements: string[];
};

export type AwqeSpecSection = {
  id: string;
  pageId: string;
  type: Tbge2SectionType;
  label: string;
  order: number;
  required: boolean;
  componentId: string;
  contentBlocks: string[];
  aboveTheFold?: boolean;
  ariaLabel?: string;
};

export type AwqeSpecPage = {
  id: string;
  name: string;
  path: string;
  purpose: string;
  sections: string[];
  metaTitle: string;
  metaDescription: string;
  headingHierarchy: string[];
  internalLinks: Array<{ label: string; href: string }>;
  contentDepth: "shallow" | "medium" | "deep";
  seoPriority: "high" | "medium" | "low";
};

export type AwqeSeoSpec = {
  pageTitles: Record<string, string>;
  headingHierarchy: Record<string, string[]>;
  internalLinks: Array<{ from: string; to: string; label: string }>;
  schemaRecommendations: string[];
  metadataRequirements: string[];
  targetKeywords: string[];
  contentDepthPolicy: "minimum-300-words-per-page" | "hero-focused" | "comprehensive";
};

export type AwqeConversionSpec = {
  primaryCta: string;
  secondaryCta?: string;
  leadCaptureSections: string[];
  trustIndicators: string[];
  urgencySignals: string[];
  socialProofSections: string[];
  ctaPlacements: Array<{ pageId: string; sectionId: string; priority: number }>;
};

export type AwqeAccessibilitySpec = {
  wcagLevel: "AA" | "AAA";
  headingStructure: Record<string, string[]>;
  ariaRecommendations: Array<{ sectionId: string; recommendation: string }>;
  contrastRequirements: { minimumRatio: number; largeTextRatio: number };
  keyboardNavigationHints: string[];
};

export type AwqePerformanceSpec = {
  imageStrategy: "lazy-load-below-fold" | "eager-hero-only" | "progressive";
  lazyLoading: boolean;
  criticalContentSections: string[];
  aboveTheFoldSections: string[];
  targets: {
    lighthousePerformance: number;
    firstContentfulPaintMs: number;
    largestContentfulPaintMs: number;
  };
};

/**
 * AWQE Website Specification — world-class spec derived from Master Plan.
 * Master Plan is read-only input; AWQE produces an enriched builder contract.
 */
export type AwqeWebsiteSpecification = {
  id: string;
  version: number;
  schemaVersion: typeof AWQE_SPEC_VERSION;
  createdAt: string;
  masterPlanId: string;
  masterPlanVersion: number;
  providerIndependent: true;

  pages: AwqeSpecPage[];
  sections: AwqeSpecSection[];
  navigation: Array<{ label: string; href: string; order: number }>;
  businessFeatures: Tbge2RequirementId[];

  seo: AwqeSeoSpec;
  conversion: AwqeConversionSpec;
  accessibility: AwqeAccessibilitySpec;
  performance: AwqePerformanceSpec;

  scores: AwqeQualityScores;
  report: AwqeImprovementReport;
};

export type AwqePipelineInput = {
  masterPlan: MasterPlan;
};

export type AwqePipelineMeta = {
  phase: typeof import("@/lib/ai-core/generation-engine/quality-engine/constants").AWQE_PHASE;
  schemaVersion: typeof AWQE_SPEC_VERSION;
  resolvedAt: string;
  specHash: string;
  stagesCompleted: AwqePipelineStage[];
};

export type AwqePipelineResult =
  | { ok: true; specification: AwqeWebsiteSpecification; meta: AwqePipelineMeta }
  | { ok: false; errors: string[]; stage: AwqePipelineStage };

export type AwqeValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };
