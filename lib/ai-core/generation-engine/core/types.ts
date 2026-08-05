import type { TBGE2_PHASE, TBGE2_SPEC_VERSION } from "@/lib/ai-core/generation-engine/constants";

/** Pipeline stages — planning lifecycle order. */
export type Tbge2PipelineStage =
  | "intent"
  | "business"
  | "requirements"
  | "website"
  | "pages"
  | "sections"
  | "content"
  | "llm_request"
  | "structured_output"
  | "validate";

export type Tbge2IntentCategory =
  | "website"
  | "landing-page"
  | "portfolio"
  | "restaurant"
  | "medical"
  | "saas"
  | "ecommerce"
  | "real-estate"
  | "legal"
  | "education"
  | "agency"
  | "blog"
  | "app"
  | "nonprofit"
  | "unknown";

export type Tbge2RequirementId =
  | "booking"
  | "payments"
  | "crm"
  | "blog"
  | "gallery"
  | "multi-language"
  | "contact"
  | "forms"
  | "authentication"
  | "dashboard"
  | "ecommerce"
  | "newsletter"
  | "testimonials"
  | "faq"
  | "pricing"
  | "chat"
  | "analytics"
  | "seo"
  | "social";

export type Tbge2WebsiteType =
  | "marketing"
  | "landing"
  | "portfolio"
  | "ecommerce"
  | "saas"
  | "blog"
  | "corporate"
  | "local-business";

export type Tbge2SectionType =
  | "hero"
  | "features"
  | "services"
  | "testimonials"
  | "gallery"
  | "pricing"
  | "faq"
  | "cta"
  | "footer"
  | "about"
  | "team"
  | "stats"
  | "process"
  | "contact"
  | "blog-preview"
  | "menu"
  | "locations"
  | "portfolio-grid"
  | "integrations"
  | "comparison"
  | "trust-badges"
  | "newsletter";

export type Tbge2PageKind =
  | "home"
  | "about"
  | "services"
  | "pricing"
  | "faq"
  | "blog"
  | "contact"
  | "gallery"
  | "portfolio"
  | "menu"
  | "team"
  | "custom";

export type Tbge2IntentAnalysis = {
  category: Tbge2IntentCategory;
  goal: string;
  confidence: number;
  signals: string[];
  source: "explicit" | "keyword" | "default";
};

export type Tbge2BusinessAnalysis = {
  industry: string;
  industryId: string;
  businessType: string;
  audience: string[];
  country?: string;
  language: string;
  brandStyle: string;
  goals: string[];
  businessName?: string;
  offer?: string;
  confidence: number;
};

export type Tbge2RequirementsAnalysis = {
  required: Tbge2RequirementId[];
  optional: Tbge2RequirementId[];
  confidence: number;
  signals: string[];
};

export type Tbge2WebsitePlan = {
  websiteType: Tbge2WebsiteType;
  pageCount: number;
  navigation: Array<{ label: string; href: string }>;
  primaryCta: string;
  secondaryCta?: string;
  conversionStrategy: string;
};

export type Tbge2PagePlan = {
  id: string;
  kind: Tbge2PageKind;
  name: string;
  path: string;
  purpose: string;
  primaryCta?: string;
  inNavigation: boolean;
  seoPriority: "high" | "medium" | "low";
};

export type Tbge2SectionPlan = {
  id: string;
  pageId: string;
  type: Tbge2SectionType;
  label: string;
  order: number;
  required: boolean;
};

export type Tbge2ContentBlockPlan = {
  id: string;
  sectionId: string;
  blockType: "headline" | "subheadline" | "body" | "cta" | "list" | "quote" | "stat";
  tone: string;
  targetLength: "short" | "medium" | "long";
  seoPriority: "high" | "medium" | "low";
};

export type Tbge2ContentPlan = {
  tone: string;
  voice: string;
  blocks: Tbge2ContentBlockPlan[];
  localizationStrategy: "single" | "multi" | "rtl-aware";
  seoPriority: "high" | "medium" | "low";
};

export type Tbge2PlanningPlan = {
  intent: Tbge2IntentAnalysis;
  business: Tbge2BusinessAnalysis;
  requirements: Tbge2RequirementsAnalysis;
  website: Tbge2WebsitePlan;
  pages: Tbge2PagePlan[];
  sections: Tbge2SectionPlan[];
  content: Tbge2ContentPlan;
};

export type Tbge2PlanningInput = {
  /** Raw user prompt — never sent to LLM directly. */
  userPrompt: string;
  language?: string;
  country?: string;
  industry?: string;
  industryId?: string;
  features?: string[];
  brandStyle?: string;
  goals?: string[];
  businessName?: string;
  productId?: string;
  platformLocale?: string;
};

export type Tbge2PlanningMeta = {
  platformPhase: typeof TBGE2_PHASE;
  platformVersion: typeof TBGE2_SPEC_VERSION;
  resolvedAt: string;
  planHash: string;
  stagesCompleted: Tbge2PipelineStage[];
};

export type Tbge2StructuredPlan = {
  version: typeof TBGE2_SPEC_VERSION;
  intent: Tbge2IntentAnalysis;
  business: Tbge2BusinessAnalysis;
  requirements: Tbge2RequirementsAnalysis;
  website: Tbge2WebsitePlan;
  pages: Tbge2PagePlan[];
  sections: Tbge2SectionPlan[];
  content: Tbge2ContentPlan;
};

export type Tbge2PlanningResult =
  | {
      ok: true;
      plan: Tbge2PlanningPlan;
      structured: Tbge2StructuredPlan;
      llmRequest: import("@/lib/ai-core/generation-engine/llm/types").Tbge2LlmRequest;
      meta: Tbge2PlanningMeta;
      structuredOutput?: import("@/lib/ai-core/generation-engine/llm/types").Tbge2StructuredOutputResult;
    }
  | {
      ok: false;
      errors: string[];
      stage: Tbge2PipelineStage;
    };

export type Tbge2ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };
