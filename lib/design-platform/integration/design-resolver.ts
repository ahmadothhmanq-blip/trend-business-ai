import { createHash } from "node:crypto";
import { TBDP_COMPONENT_CATALOG } from "@/lib/design-platform/components/catalog";
import {
  TBDP_INTEGRATION_PHASE,
  TBDP_INTEGRATION_VERSION,
} from "@/lib/design-platform/integration/constants";
import type {
  TbdpDesignContext,
  TbdpDesignResolverInput,
} from "@/lib/design-platform/integration/core/types";
import { resolveSectorId } from "@/lib/design-platform/integration/industry-map";
import { resolveLanguageContext } from "@/lib/design-platform/integration/language-bridge";
import { resolveTheme } from "@/lib/design-platform/integration/theme-resolver";
import { resolveTemplateDesign } from "@/lib/design-platform/integration/template-resolver";
import {
  getExperienceProfile,
  resolveSectorDna,
  selectSectorDesign,
} from "@/lib/design-platform/sector-dna";

function hashContext(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

function filterComponentRegistry(preferredIds: string[]) {
  const set = new Set(preferredIds);
  return TBDP_COMPONENT_CATALOG.filter((c) => set.has(c.id));
}

/**
 * Resolves foundations, components, experience, and sector DNA
 * into a unified Design Context.
 */
export function resolveDesignContext(input: TbdpDesignResolverInput): TbdpDesignContext {
  const sectorId = resolveSectorId({
    sectorId: input.sectorId,
    templateId: input.templateId,
  });
  const language = resolveLanguageContext({
    websiteLanguage: input.language,
    generationLanguage: input.generationLanguage,
    templateLanguage: input.templateLanguage,
    direction: input.direction,
  });

  const theme = resolveTheme({
    mode: input.themeMode,
    source: input.themeSource,
    sectorId,
    brandThemeId: input.brandThemeId,
    userThemeId: input.userThemeId,
  });

  const sectorResolved = resolveSectorDna(sectorId, {
    direction: language.direction,
    prefersReducedMotion: input.prefersReducedMotion,
  });

  const aiResult = selectSectorDesign({
    sectorId,
    direction: language.direction,
    goal: input.goal,
    locale: language.localeCode,
  });

  const experienceProfile =
    getExperienceProfile(aiResult.experienceProfile.id) ?? aiResult.experienceProfile;

  const preferred = sectorResolved.sector.components.preferredComponents;
  const registry = filterComponentRegistry(preferred);

  let template;
  if (input.templateId) {
    template = resolveTemplateDesign({
      templateId: input.templateId,
      sectorId,
      language: input.language,
      generationLanguage: input.generationLanguage,
      goal: input.goal,
      themeMode: input.themeMode,
      architectureVersion: input.architectureVersion,
      prefersReducedMotion: input.prefersReducedMotion,
    });
  }

  const contextHash = hashContext([
    sectorId,
    language.localeCode,
    language.direction,
    theme.resolvedMode,
    input.templateId ?? "",
    TBDP_INTEGRATION_VERSION,
  ]);

  return {
    meta: {
      integrationPhase: TBDP_INTEGRATION_PHASE,
      integrationVersion: TBDP_INTEGRATION_VERSION,
      resolvedAt: new Date().toISOString(),
      sectorDnaId: sectorId,
      contextHash,
    },
    sector: sectorResolved.sector,
    sectorResolved,
    experienceProfile,
    aiSelections: aiResult.selections,
    components: { preferred, registry },
    language,
    theme,
    template,
  };
}
