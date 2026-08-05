import {
  TBDP_INTEGRATION_VERSION,
  TBDP_PROJECT_SETTING_DESIGN_CONTEXT_HASH,
  TBDP_PROJECT_SETTING_INTEGRATION_VERSION,
  TBDP_PROJECT_SETTING_SECTOR_DNA_ID,
} from "@/lib/design-platform/integration/constants";
import type {
  TbdpBuilderBridgeInput,
  TbdpBuilderBridgeOutput,
  TbdpBuilderLifecyclePhase,
  TbdpLifecycleEvent,
} from "@/lib/design-platform/integration/core/types";
import { resolveDesignContext } from "@/lib/design-platform/integration/design-resolver";
import { resolveSectorId } from "@/lib/design-platform/integration/industry-map";

/**
 * Enriches builder generation input with TBDP metadata.
 * Does not mutate or replace builder fields — enrichment is additive only.
 */
export function enrichBuilderInput(input: TbdpBuilderBridgeInput): TbdpBuilderBridgeOutput {
  const sectorDnaId = resolveSectorId({
    sectorId: input.sectorId,
    industryId: input.industryId,
    templateId: input.templateId ?? input.websiteStructureTemplateId,
  });

  const designContext = resolveDesignContext({
    sectorId: sectorDnaId,
    language: input.language,
    goal: input.goal,
    templateId: input.templateId ?? input.websiteStructureTemplateId,
    themeMode: input.theme === "dark" ? "dark" : input.theme === "light" ? "light" : "auto",
  });

  return {
    enrichment: {
      sectorDnaId,
      tbdpIntegrationVersion: TBDP_INTEGRATION_VERSION,
      tbdpDesignContextHash: designContext.meta.contextHash,
      suggestedComponents: designContext.aiSelections.pageFlow.length
        ? designContext.components.preferred
        : undefined,
      suggestedLayoutId: designContext.aiSelections.layoutId,
      suggestedPageFlow: designContext.aiSelections.pageFlow,
      typographyProfile: designContext.language.typographyProfile,
      direction: designContext.language.direction,
    },
    designContext,
    projectSettingsPatch: {
      [TBDP_PROJECT_SETTING_SECTOR_DNA_ID]: sectorDnaId,
      [TBDP_PROJECT_SETTING_DESIGN_CONTEXT_HASH]: designContext.meta.contextHash,
      [TBDP_PROJECT_SETTING_INTEGRATION_VERSION]: TBDP_INTEGRATION_VERSION,
    },
  };
}

/**
 * Lifecycle hook — records TBDP context at builder phases without changing behavior.
 */
export function createBuilderLifecycleEvent(
  phase: TbdpBuilderLifecyclePhase,
  input: TbdpBuilderBridgeInput,
): TbdpLifecycleEvent {
  const bridge = enrichBuilderInput(input);
  return {
    phase,
    timestamp: new Date().toISOString(),
    designContext: bridge.designContext!,
  };
}

/** Returns true when TBDP enrichment should be applied (opt-in safe default). */
export function isTbdpEnrichmentEnabled(input: TbdpBuilderBridgeInput): boolean {
  return Boolean(input.industryId || input.sectorId || input.templateId || input.websiteStructureTemplateId);
}
