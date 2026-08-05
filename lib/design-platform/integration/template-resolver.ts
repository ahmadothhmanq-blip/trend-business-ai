import { buildTbdpExperience, emitTbdpExperienceCss } from "@/lib/design-platform/experience";
import { buildTbdpDesignTokens, emitTbdpCssVariables } from "@/lib/design-platform/tokens";
import type {
  TbdpTemplateResolution,
  TbdpTemplateResolverInput,
} from "@/lib/design-platform/integration/core/types";
import { resolveSectorId } from "@/lib/design-platform/integration/industry-map";
import { resolveLanguageContext } from "@/lib/design-platform/integration/language-bridge";
import { resolveTheme } from "@/lib/design-platform/integration/theme-resolver";
import { getExperienceProfile, selectSectorDesign } from "@/lib/design-platform/sector-dna";

const V2_TEMPLATE_IDS = new Set([
  "saas-enterprise",
  "restaurant-signature",
  "real-estate-prestige",
  "medical-premium",
  "creative-portfolio",
]);

function inferArchitectureVersion(
  templateId: string,
  explicit?: TbdpTemplateResolverInput["architectureVersion"],
): "v1" | "v2" {
  if (explicit) return explicit;
  return V2_TEMPLATE_IDS.has(templateId) ? "v2" : "v1";
}

/**
 * When a template is selected, resolves design tokens, component preferences,
 * experience profile, sector DNA, language, RTL/LTR, and responsive rules.
 */
export function resolveTemplateDesign(
  input: TbdpTemplateResolverInput,
): TbdpTemplateResolution {
  const sectorId = resolveSectorId({
    sectorId: input.sectorId,
    industryId: input.industryId,
    templateId: input.templateId,
  });

  const language = resolveLanguageContext({
    websiteLanguage: input.language,
    generationLanguage: input.generationLanguage,
    direction: undefined,
  });

  const theme = resolveTheme({
    mode: input.themeMode,
    sectorId,
  });

  const aiResult = selectSectorDesign({
    sectorId,
    direction: language.direction,
    goal: input.goal,
    locale: language.localeCode,
  });

  const experienceProfile =
    getExperienceProfile(aiResult.experienceProfile.id) ?? aiResult.experienceProfile;

  const designTokens = buildTbdpDesignTokens({
    mode: theme.resolvedMode,
    typographyProfile: language.typographyProfile,
  });

  const experience = buildTbdpExperience({
    direction: language.direction,
    prefersReducedMotion: input.prefersReducedMotion,
    viewport: language.rtl ? "mobile" : "desktop",
  });

  const sector = aiResult.sector;

  return {
    templateId: input.templateId,
    architectureVersion: inferArchitectureVersion(input.templateId, input.architectureVersion),
    sectorDnaId: sectorId,
    designTokens,
    experience,
    componentPreferences: sector.components.preferredComponents,
    experienceProfileId: experienceProfile.id,
    language,
    theme,
    layoutId: aiResult.selections.layoutId,
    pageFlow: aiResult.selections.pageFlow,
    motionPresets: aiResult.selections.motionPresets,
    cssVariables: emitTbdpCssVariables(designTokens),
    experienceCss: emitTbdpExperienceCss(),
  };
}
