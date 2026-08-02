import type { WebsiteThemePresetId } from "@/lib/website/contracts/theme";
import type { IndustryLayoutFamily } from "@/lib/website/contracts/layout";
import type { UnifiedTemplateRoute } from "@/lib/ai-core/template-router/types";

export const ARCHITECTURE_VALIDATION_KEY = "architectureValidation";
export const WEBSITE_GENERATION_PLAN_KEY = "websiteGenerationPlan";

/** Draft consumed by the validation layer — backward-compatible with MasterWebsitePlan fields. */
export type WebsiteGenerationPlan = {
  version: "1";
  industryId: string;
  industryLabel: string;
  routingIndustryId: string;
  layoutFamily: IndustryLayoutFamily;
  structureTemplateId: string;
  layoutTemplateIntelligenceId: string;
  layoutStructure: string;
  pageTopology: string;
  visualThemePresetId: WebsiteThemePresetId;
  visualThemeTemplateIntelligenceId: string;
  premiumTemplateId: string;
  sections: string[];
  components: string[];
  hero: string;
  imageKeywords: string[];
  imagePolicy: {
    routingIndustryId: string;
    forbiddenSubjects: string[];
    photographyStyle: string[];
  };
  businessRules: {
    primaryCta?: string;
    secondaryCta?: string;
    recommendedSections: string[];
    confidence: number;
    subcategory: string;
  };
  route: UnifiedTemplateRoute;
  reasoningChain: string[];
  confidence: number;
};

export type ArchitectureValidationStatus = "passed" | "failed" | "warning";

export type ArchitectureValidationCorrection = {
  field: keyof WebsiteGenerationPlan | "structureTemplateId" | "route";
  currentValue: string;
  recommendedValue: string;
  reason: string;
};

export type ArchitectureValidationTraceEntry = {
  ruleId: string;
  category:
    | "industry"
    | "layout"
    | "structure"
    | "template"
    | "theme"
    | "sections"
    | "components"
    | "image"
    | "business"
    | "reasoning";
  passed: boolean;
  severity: "error" | "warning";
  message: string;
  /** Architecture Knowledge Base entry used for this rule decision. */
  knowledgeEntryId?: string;
};

export type ArchitectureValidationResult = {
  status: ArchitectureValidationStatus;
  errors: string[];
  warnings: string[];
  confidence: number;
  reasoning: string[];
  recommendedCorrections: ArchitectureValidationCorrection[];
  trace: ArchitectureValidationTraceEntry[];
  plan?: WebsiteGenerationPlan;
  attempt: number;
  validatedAt: string;
};

export type ArchitectureValidationOptions = {
  maxRetries?: number;
  minConfidence?: number;
  /** Production escape hatch — logs warning, skips hard failures. */
  allowLegacyBypass?: boolean;
  onProgress?: (message: string) => void;
};
