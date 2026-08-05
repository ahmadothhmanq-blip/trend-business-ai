/**
 * TBGE2 + Master Plan + Website Builder integration.
 *
 * Master Plan is the ONLY planning authority when WB_MASTER_PLAN=1.
 */

export {
  MASTER_PLAN_META_KEY,
  MASTER_PLAN_META_HASH_KEY,
  GLS_CONTEXT_META_KEY,
  MASTER_PLAN_AUTHORITY_KEY,
  INTEGRATION_SETTING_MASTER_PLAN_ID,
  INTEGRATION_SETTING_MASTER_PLAN_VERSION,
  INTEGRATION_SETTING_GLS_CONTEXT_HASH,
} from "@/lib/ai-core/generation-engine/integration/constants";

export { isMasterPlanIntegrationEnabled } from "@/lib/ai-core/generation-engine/integration/flags";
export type {
  MasterPlanIntegrationContext,
  MasterPlanIntegrationWireInput,
  MasterPlanIntegrationWireResult,
  StructuredContentResult,
} from "@/lib/ai-core/generation-engine/integration/types";
export type {
  ContentProvider,
  ContentProviderRequest,
  ContentProviderResponse,
} from "@/lib/ai-core/generation-engine/integration/content-provider";
export {
  wireMasterPlanIntegration,
  mergeIntegrationSettings,
} from "@/lib/ai-core/generation-engine/integration/wire-integration";
export {
  validateBeforeGeneration,
  validateContentTasks,
  validateStructuredContent,
  validateBeforeBuilder,
  validateBeforeExport,
  assertIntegrationValid,
} from "@/lib/ai-core/generation-engine/integration/validate-integration";
export {
  createContentProviderFromAiProvider,
  parseStructuredContent,
} from "@/lib/ai-core/generation-engine/integration/content-provider";
export { masterPlanToLegacyWebsitePlan } from "@/lib/ai-core/generation-engine/integration/master-plan-to-legacy";
export {
  masterPlanToPlanDraft,
  buildLockedSpecFromMasterPlan,
} from "@/lib/ai-core/generation-engine/integration/master-plan-to-spec";
