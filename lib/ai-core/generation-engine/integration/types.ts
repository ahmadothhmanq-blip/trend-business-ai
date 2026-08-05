import type { GlsLanguageContext } from "@/lib/language-platform/core/types";
import type { MasterPlan, MasterPlanMeta } from "@/lib/ai-core/generation-engine/master-plan/types";
import type { MasterPlanContentLlmRequest } from "@/lib/ai-core/generation-engine/master-plan/llm-request-builder";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import type { WebsiteGenerationInput } from "@/lib/website/types";
import type { TbdpWiringResult } from "@/lib/website/tbdp-wiring/types";

export type MasterPlanIntegrationStage =
  | "master_plan"
  | "content_tasks"
  | "structured_content"
  | "builder"
  | "export";

export type StructuredContentResult = {
  masterPlanId: string;
  content: Array<{
    blockId: string;
    fields: Record<string, string>;
  }>;
};

export type MasterPlanIntegrationContext = {
  enabled: true;
  masterPlan: MasterPlan;
  meta: MasterPlanMeta;
  glsContext: GlsLanguageContext;
  contentRequest: MasterPlanContentLlmRequest;
  lockedSpec?: GenerationSpec;
  legacyMasterWebsitePlan: MasterWebsitePlan;
  enrichedInput: WebsiteGenerationInput;
  settingsPatch: Record<string, string>;
  briefMetadataPatch: Record<string, unknown>;
};

export type MasterPlanIntegrationWireInput = {
  pluginInput: WebsiteGenerationInput;
  tbdpWiring?: TbdpWiringResult;
  onProgress?: (message: string) => void;
};

export type MasterPlanIntegrationWireResult =
  | { ok: true; context: MasterPlanIntegrationContext }
  | { ok: false; errors: string[]; stage: MasterPlanIntegrationStage };

export type IntegrationValidationResult =
  | { valid: true }
  | { valid: false; errors: string[]; stage: MasterPlanIntegrationStage };
