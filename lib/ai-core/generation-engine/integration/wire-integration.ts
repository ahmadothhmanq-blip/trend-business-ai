import { resolveGlsLanguageContext, contextToSettingsPatch } from "@/lib/language-platform";
import { masterPlanToSettingsPatch } from "@/lib/ai-core/generation-engine/master-plan/lifecycle";
import { buildMasterPlanContentLlmRequest } from "@/lib/ai-core/generation-engine/master-plan/llm-request-builder";
import { runMasterPlanPipeline } from "@/lib/ai-core/generation-engine/master-plan/pipeline/run-pipeline";
import {
  GLS_CONTEXT_META_KEY,
  INTEGRATION_SETTING_GLS_CONTEXT_HASH,
  INTEGRATION_SETTING_MASTER_PLAN_ID,
  INTEGRATION_SETTING_MASTER_PLAN_VERSION,
  MASTER_PLAN_AUTHORITY_KEY,
  MASTER_PLAN_META_HASH_KEY,
  MASTER_PLAN_META_KEY,
} from "@/lib/ai-core/generation-engine/integration/constants";
import { isMasterPlanIntegrationEnabled } from "@/lib/ai-core/generation-engine/integration/flags";
import { buildLockedSpecFromMasterPlan } from "@/lib/ai-core/generation-engine/integration/master-plan-to-spec";
import { masterPlanToLegacyWebsitePlan } from "@/lib/ai-core/generation-engine/integration/master-plan-to-legacy";
import type {
  MasterPlanIntegrationContext,
  MasterPlanIntegrationWireInput,
  MasterPlanIntegrationWireResult,
} from "@/lib/ai-core/generation-engine/integration/types";
import {
  assertIntegrationValid,
  validateBeforeBuilder,
  validateBeforeGeneration,
  validateContentTasks,
} from "@/lib/ai-core/generation-engine/integration/validate-integration";
import { mapWebsiteModeToTbge, mapWebsiteProfileToTbge } from "@/lib/tbge/integration/brief-mapper";
import { wireBriefMetadata } from "@/lib/website/tbdp-wiring";

/**
 * Wire Master Plan into Website Builder lifecycle.
 *
 * User Prompt → TBGE Analysis → Master Plan → Validation → enriched input
 */
export async function wireMasterPlanIntegration(
  input: MasterPlanIntegrationWireInput,
): Promise<MasterPlanIntegrationWireResult> {
  if (!isMasterPlanIntegrationEnabled()) {
    return { ok: false, errors: ["Master Plan integration disabled (set WB_MASTER_PLAN=1)"], stage: "master_plan" };
  }

  const emit = (msg: string) => input.onProgress?.(msg);
  emit("[master-plan] Running TBGE analysis and building Master Plan...");

  const pipelineResult = await runMasterPlanPipeline({
    userPrompt: input.pluginInput.prompt,
    language: input.pluginInput.language,
    industry: input.pluginInput.industryId,
    industryId: input.pluginInput.industryId,
    features: input.pluginInput.features,
    businessName: input.pluginInput.previousTitle,
    productId: "website-builder",
    projectName: input.pluginInput.previousTitle,
  });

  if (!pipelineResult.ok) {
    return { ok: false, errors: pipelineResult.errors, stage: "master_plan" };
  }

  const { masterPlan, meta } = pipelineResult;
  assertIntegrationValid(validateBeforeGeneration(masterPlan), "pre-generation");

  const contentRequest = buildMasterPlanContentLlmRequest(masterPlan);
  assertIntegrationValid(validateContentTasks(contentRequest), "content-tasks");

  const glsContext = resolveGlsLanguageContext({
    platformLocale: input.pluginInput.locale,
    websiteLanguage: masterPlan.localization.language,
    generationLanguage: masterPlan.localization.language,
    serviceId: "website-builder",
  });

  const legacyMasterWebsitePlan = masterPlanToLegacyWebsitePlan(masterPlan);
  assertIntegrationValid(validateBeforeBuilder(masterPlan), "pre-builder");

  const lockedSpec = buildLockedSpecFromMasterPlan({
    plan: masterPlan,
    prompt: input.pluginInput.prompt,
    profile: mapWebsiteProfileToTbge(input.pluginInput),
    mode: mapWebsiteModeToTbge(input.pluginInput.mode),
  });

  const settingsPatch: Record<string, string> = {
    ...masterPlanToSettingsPatch(meta),
    ...contextToSettingsPatch(glsContext),
    [INTEGRATION_SETTING_MASTER_PLAN_ID]: masterPlan.id,
    [INTEGRATION_SETTING_MASTER_PLAN_VERSION]: String(masterPlan.version),
    [INTEGRATION_SETTING_GLS_CONTEXT_HASH]: glsContext.meta.contextHash,
    [MASTER_PLAN_AUTHORITY_KEY]: "true",
  };

  const briefMetadataPatch: Record<string, unknown> = {
    [MASTER_PLAN_META_KEY]: masterPlan,
    [MASTER_PLAN_META_HASH_KEY]: meta.planHash,
    [GLS_CONTEXT_META_KEY]: glsContext,
    [MASTER_PLAN_AUTHORITY_KEY]: true,
    masterWebsitePlan: legacyMasterWebsitePlan,
    industryId: masterPlan.business.industryId,
    industry: masterPlan.business.industry,
    masterPlanLocked: true,
    ...wireBriefMetadata(
      {},
      {
        prompt: input.pluginInput.prompt,
        language: input.pluginInput.language,
        industryId: masterPlan.business.industryId,
        templateId: input.pluginInput.templateId,
        websiteStructureTemplateId: input.pluginInput.websiteStructureTemplateId,
        templateIntelligenceId: input.pluginInput.templateIntelligenceId,
        components: masterPlan.componentsNeeded.map((c) => c.componentPath),
        theme: input.pluginInput.theme,
      },
    ),
    ...(input.tbdpWiring?.briefMetadataPatch ?? {}),
  };

  const enrichedInput = {
    ...input.pluginInput,
    language: masterPlan.localization.language,
    industryId: masterPlan.business.industryId,
    components: masterPlan.componentsNeeded.map((c) => c.componentPath),
    masterWebsitePlan: legacyMasterWebsitePlan,
  };

  emit(`[master-plan] Plan ${masterPlan.id} validated — ${masterPlan.pages.length} pages, ${masterPlan.sections.length} sections`);

  const context: MasterPlanIntegrationContext = {
    enabled: true,
    masterPlan,
    meta,
    glsContext,
    contentRequest,
    lockedSpec,
    legacyMasterWebsitePlan,
    enrichedInput,
    settingsPatch,
    briefMetadataPatch,
  };

  return { ok: true, context };
}

export function mergeIntegrationSettings(
  base: Record<string, unknown> | undefined,
  patch: Record<string, string>,
): Record<string, unknown> {
  return { ...(base ?? {}), ...patch };
}
