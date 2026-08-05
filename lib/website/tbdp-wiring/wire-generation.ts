import {
  isTbdpEnrichmentEnabled,
  resolveAiWebsiteDesign,
  tbdpBuilderLifecycle,
} from "@/lib/design-platform/integration";
import {
  TBDP_BRIEF_META_KEY,
  TBDP_VISUAL_AUTHORITY_META_KEY,
} from "@/lib/website/tbdp-wiring/constants";
import {
  designContextToSettingsPatch,
  storedContextFromDesignContext,
} from "@/lib/website/tbdp-wiring/design-context-store";
import type { TbdpWiringInput, TbdpWiringResult } from "@/lib/website/tbdp-wiring/types";

/**
 * Pre-generation wiring — resolves sector DNA, experience, components, foundations.
 * Additive only; returns empty patch when TBDP signals are absent.
 */
export function wireWebsiteGenerationStart(
  input: TbdpWiringInput,
): TbdpWiringResult {
  if (!isTbdpEnrichmentEnabled(input)) {
    return { enabled: false, settingsPatch: {}, briefMetadataPatch: {} };
  }

  const bridge = tbdpBuilderLifecycle.preGeneration(input);
  const designContext = bridge.designContext;

  if (!designContext) {
    return { enabled: false, settingsPatch: {}, briefMetadataPatch: {} };
  }

  const settingsPatch = designContextToSettingsPatch(designContext);
  const stored = storedContextFromDesignContext(designContext);

  return {
    enabled: true,
    designContext,
    settingsPatch: { ...settingsPatch, ...(bridge.projectSettingsPatch ?? {}) },
    briefMetadataPatch: {
      [TBDP_BRIEF_META_KEY]: stored,
      [TBDP_VISUAL_AUTHORITY_META_KEY]: true,
      tbdpSectorDnaId: designContext.meta.sectorDnaId,
      tbdpLayoutId: designContext.aiSelections.layoutId,
      tbdpPageFlow: designContext.aiSelections.pageFlow,
      tbdpComponentIds: designContext.components.preferred,
      tbdpTypographyProfile: designContext.language.typographyProfile,
      tbdpDirection: designContext.language.direction,
      preferredComponents:
        input.components?.length
          ? input.components
          : designContext.components.preferred,
    },
    suggestedComponents: bridge.enrichment.suggestedComponents,
  };
}

/**
 * AI generation wiring — TBDP resolves visual; DeepSeek produces blueprint/content only.
 * Returns component/layout selections from sector DNA (never random).
 */
export function wireAiGeneration(input: TbdpWiringInput) {
  if (!isTbdpEnrichmentEnabled(input)) {
    return null;
  }
  return resolveAiWebsiteDesign({
    sectorId: undefined,
    industryId: input.industryId,
    prompt: input.prompt,
    language: input.language,
    goal: input.goal,
  });
}

/**
 * Enrich brief.metadata with TBDP design authority flags.
 */
export function wireBriefMetadata(
  metadata: Record<string, unknown>,
  input: TbdpWiringInput,
): Record<string, unknown> {
  const wired = wireWebsiteGenerationStart(input);
  if (!wired.enabled) return metadata;
  return { ...metadata, ...wired.briefMetadataPatch };
}
