import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { PlanningReasoningTrace } from "@/lib/ai-core/planning-reasoning-engine/types";

export type UniversalServiceId =
  | "website-builder"
  | "app-builder"
  | "landing-page-builder"
  | "logo-designer"
  | "brand-designer"
  | "image-generator"
  | "video-studio"
  | "content-studio"
  | "marketing"
  | "social-media"
  | "crm"
  | "erp"
  | "business-manager"
  | "business-intelligence"
  | "future-service";

export type PlannerIntent = {
  summary: string;
  goals: string[];
  constraints: string[];
  requestedServices: UniversalServiceId[];
  requestedOutputs: string[];
};

export type ServiceCapabilityNeeds = {
  auth: { required: boolean; providerHint?: string };
  database: {
    required: boolean;
    provider: "prisma" | "none" | "external" | string;
    entities?: string[];
  };
  assets: {
    images?: boolean;
    video?: boolean;
    branding?: boolean;
  };
  integrations: string[];
};

export type RequirementAnalysisResult = {
  intent: PlannerIntent;
  capabilities: ServiceCapabilityNeeds;
  domainHints: string[];
  targetServices: UniversalServiceId[];
  missingRequirements: string[];
};

export type ClarificationQuestion = {
  id: string;
  question: string;
  why: string;
  expectedAnswerFormat: "text" | "choice" | "list" | "boolean";
  priority: "high" | "medium" | "low";
};

export type ClarificationResolution = {
  questionId: string;
  answerSummary: string;
};

export type UniversalBlueprintIndustry = {
  industryId: string;
  confidence: number;
  reason: string;
  routingProfile: string;
};

export type UniversalServiceBlueprint = {
  serviceId: UniversalServiceId;
  adapterVersion: "1";
  serviceBlueprint: Record<string, unknown>;
  supported: boolean;
  note?: string;
};

export type UniversalBlueprint = {
  version: "1";
  plannerId: string;
  createdAt: string;
  briefId: string;
  industry: UniversalBlueprintIndustry;
  intent: PlannerIntent;
  requirements: ServiceCapabilityNeeds;
  clarifications: {
    questions: ClarificationQuestion[];
    resolved: ClarificationResolution[];
  };
  servicePlans: UniversalServiceBlueprint[];
  selectedServiceId: UniversalServiceId;
  executionPlan: {
    mode: "single-service" | "multi-service";
    orderedServices: UniversalServiceId[];
    workflowId?: string;
  };
  trace: {
    planningTraceRef: string;
    orchestrationTraceRef?: string;
  };
};

/** Shared blueprint consumed by every service adapter before servicePlans are attached. */
export type UniversalBlueprintCore = Omit<
  UniversalBlueprint,
  "servicePlans" | "selectedServiceId" | "executionPlan"
>;

export type UniversalPlannerRunInput = {
  brief: CoreBrief;
  onProgress?: (message: string) => void;
  reuseExisting?: boolean;
  conversationTurns?: Array<{
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
  }>;
};

export type UniversalPlannerRunResult = {
  brief: CoreBrief;
  blueprint: UniversalBlueprint;
  industryDetection: IndustryDetectionResult;
  planningTrace: PlanningReasoningTrace;
  clarifications: ClarificationQuestion[];
  requirements: RequirementAnalysisResult;
};
