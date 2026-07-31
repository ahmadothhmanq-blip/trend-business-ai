import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { AgencyContentPack } from "@/lib/ai-core/content-intelligence/generate";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

export const CONTENT_INTELLIGENCE_TRACE_KEY = "contentIntelligenceTrace";
export const CONTENT_INTELLIGENCE_VALIDATION_KEY = "contentIntelligenceValidation";
export const CONTENT_INTELLIGENCE_ENGINE_ID = "content-intelligence-engine";
export const CONTENT_INTELLIGENCE_ENGINE_VERSION = "1.0.0";

export type ContentIntelligencePhaseId =
  | "resolve"
  | "policy-check"
  | "anti-cliche"
  | "section-alignment"
  | "remediation"
  | "production-pack";

export type ContentTraceEntry = {
  id: string;
  phase: ContentIntelligencePhaseId;
  ruleId: string;
  passed: boolean;
  severity: "info" | "warning" | "error";
  message: string;
  knowledgeEntryId?: string;
  timestamp: string;
};

export type ContentIntelligenceTrace = {
  version: "1";
  engineId: typeof CONTENT_INTELLIGENCE_ENGINE_ID;
  engineVersion: typeof CONTENT_INTELLIGENCE_ENGINE_VERSION;
  createdAt: string;
  industryId: string;
  contentSource: "agency" | "static" | "none";
  phases: ContentIntelligencePhaseId[];
  entries: ContentTraceEntry[];
  summary: string;
};

export type ContentPolicy = {
  industryId: string;
  knowledgeEntryId: string;
  requiredSections: string[];
  forbiddenSubjects: string[];
  minServices: number;
  minTestimonials: number;
  minFaq: number;
  minSeoDescriptionLength: number;
  tone: string;
  toneKeywords: string[];
  primaryCta?: string;
  heroKeywords: string[];
};

export type ExplainableContentPolicyLookup = {
  value: ContentPolicy;
  entryId: string;
  entryVersion: string;
  resolvedFrom: string[];
};

export type ContentIntelligenceValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  trace: ContentTraceEntry[];
};

export type ContentIntelligenceEngineParams = {
  masterPlan?: MasterWebsitePlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  industryId?: string;
  agencyContent?: AgencyContentPack | null;
  brandName: string;
  language?: string;
};

export type ContentIntelligenceEngineResult = {
  validation: ContentIntelligenceValidation;
  trace: ContentIntelligenceTrace;
  policy: ContentPolicy;
  remediatedContent?: AgencyContentPack;
};

export type ProductionContentResolution = {
  pack: ProductionContentPack;
  trace: ContentIntelligenceTrace;
  validation: ContentIntelligenceValidation;
  source: "agency" | "static";
  policy: ContentPolicy;
};
