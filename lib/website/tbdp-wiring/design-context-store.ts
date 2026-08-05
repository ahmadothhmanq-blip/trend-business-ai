import type { TbdpDesignContext } from "@/lib/design-platform/integration";
import {
  isTbdpEnrichmentEnabled,
  resolveDesignContext,
  resolveTemplateBridge,
  tbdpBuilderLifecycle,
} from "@/lib/design-platform/integration";
import {
  TBDP_SETTINGS_COMPONENT_IDS,
  TBDP_SETTINGS_CONTEXT_HASH,
  TBDP_SETTINGS_DIRECTION,
  TBDP_SETTINGS_INTEGRATION_VERSION,
  TBDP_SETTINGS_LAYOUT_ID,
  TBDP_SETTINGS_PAGE_FLOW,
  TBDP_SETTINGS_SECTOR_DNA_ID,
  TBDP_SETTINGS_THEME_MODE,
  TBDP_SETTINGS_TYPOGRAPHY_PROFILE,
  TBDP_SETTINGS_WIRING_VERSION,
  TBDP_WIRING_VERSION,
} from "@/lib/website/tbdp-wiring/constants";
import type { TbdpStoredDesignContext, TbdpWiringInput } from "@/lib/website/tbdp-wiring/types";
import { resolveSectorId } from "@/lib/design-platform/integration";

export function designContextToSettingsPatch(
  ctx: TbdpDesignContext,
): Record<string, unknown> {
  return {
    [TBDP_SETTINGS_SECTOR_DNA_ID]: ctx.meta.sectorDnaId,
    [TBDP_SETTINGS_CONTEXT_HASH]: ctx.meta.contextHash,
    [TBDP_SETTINGS_INTEGRATION_VERSION]: ctx.meta.integrationVersion,
    [TBDP_SETTINGS_WIRING_VERSION]: TBDP_WIRING_VERSION,
    [TBDP_SETTINGS_COMPONENT_IDS]: ctx.components.preferred,
    [TBDP_SETTINGS_LAYOUT_ID]: ctx.aiSelections.layoutId,
    [TBDP_SETTINGS_PAGE_FLOW]: ctx.aiSelections.pageFlow,
    [TBDP_SETTINGS_TYPOGRAPHY_PROFILE]: ctx.language.typographyProfile,
    [TBDP_SETTINGS_DIRECTION]: ctx.language.direction,
    [TBDP_SETTINGS_THEME_MODE]: ctx.theme.resolvedMode,
    tbdpExperienceProfileId: ctx.experienceProfile.id,
    tbdpMotionPresets: ctx.aiSelections.motionPresets,
    tbdpResolvedAt: ctx.meta.resolvedAt,
  };
}

export function storedContextFromDesignContext(
  ctx: TbdpDesignContext,
): TbdpStoredDesignContext {
  return {
    sectorDnaId: ctx.meta.sectorDnaId,
    contextHash: ctx.meta.contextHash,
    integrationVersion: ctx.meta.integrationVersion,
    wiringVersion: TBDP_WIRING_VERSION,
    componentIds: ctx.components.preferred,
    layoutId: ctx.aiSelections.layoutId,
    pageFlow: ctx.aiSelections.pageFlow,
    typographyProfile: ctx.language.typographyProfile,
    direction: ctx.language.direction,
    themeMode: ctx.theme.resolvedMode,
    experienceProfileId: ctx.experienceProfile.id,
    motionPresets: ctx.aiSelections.motionPresets,
    resolvedAt: ctx.meta.resolvedAt,
  };
}

export function readStoredContextFromSettings(
  settings?: Record<string, unknown> | null,
): TbdpStoredDesignContext | null {
  if (!settings) return null;
  const sectorDnaId = settings[TBDP_SETTINGS_SECTOR_DNA_ID];
  const contextHash = settings[TBDP_SETTINGS_CONTEXT_HASH];
  if (typeof sectorDnaId !== "string" || typeof contextHash !== "string") {
    return null;
  }
  return {
    sectorDnaId,
    contextHash,
    integrationVersion:
      typeof settings[TBDP_SETTINGS_INTEGRATION_VERSION] === "string"
        ? settings[TBDP_SETTINGS_INTEGRATION_VERSION]
        : "",
    wiringVersion:
      typeof settings[TBDP_SETTINGS_WIRING_VERSION] === "string"
        ? settings[TBDP_SETTINGS_WIRING_VERSION]
        : "",
    componentIds: Array.isArray(settings[TBDP_SETTINGS_COMPONENT_IDS])
      ? (settings[TBDP_SETTINGS_COMPONENT_IDS] as string[])
      : [],
    layoutId:
      typeof settings[TBDP_SETTINGS_LAYOUT_ID] === "string"
        ? settings[TBDP_SETTINGS_LAYOUT_ID]
        : "",
    pageFlow: Array.isArray(settings[TBDP_SETTINGS_PAGE_FLOW])
      ? (settings[TBDP_SETTINGS_PAGE_FLOW] as string[])
      : [],
    typographyProfile:
      typeof settings[TBDP_SETTINGS_TYPOGRAPHY_PROFILE] === "string"
        ? settings[TBDP_SETTINGS_TYPOGRAPHY_PROFILE]
        : "latin-ltr",
    direction:
      settings[TBDP_SETTINGS_DIRECTION] === "rtl" ? "rtl" : "ltr",
    themeMode:
      typeof settings[TBDP_SETTINGS_THEME_MODE] === "string"
        ? settings[TBDP_SETTINGS_THEME_MODE]
        : "light",
    experienceProfileId:
      typeof settings.tbdpExperienceProfileId === "string"
        ? settings.tbdpExperienceProfileId
        : "",
    motionPresets: Array.isArray(settings.tbdpMotionPresets)
      ? (settings.tbdpMotionPresets as string[])
      : [],
    resolvedAt:
      typeof settings.tbdpResolvedAt === "string" ? settings.tbdpResolvedAt : "",
  };
}

export function resolveDesignContextFromSettings(
  settings?: Record<string, unknown> | null,
  overrides?: TbdpWiringInput,
): TbdpDesignContext | undefined {
  const stored = readStoredContextFromSettings(settings);
  const sectorId = resolveSectorId({
    sectorId: stored?.sectorDnaId as import("@/lib/design-platform/sector-dna").TbdpSectorId | undefined,
    industryId: overrides?.industryId,
    templateId: overrides?.templateId ?? overrides?.websiteStructureTemplateId,
  });

  if (!stored && !isTbdpEnrichmentEnabled(overrides ?? {})) {
    return undefined;
  }

  return resolveDesignContext({
    sectorId,
    language: overrides?.language,
    goal: overrides?.goal,
    templateId: overrides?.templateId ?? overrides?.websiteStructureTemplateId,
    themeMode:
      overrides?.theme === "dark"
        ? "dark"
        : overrides?.theme === "light"
          ? "light"
          : "auto",
  });
}

export function resolveDesignContextForTemplate(
  templateId: string,
  options?: { language?: string | null; industryId?: string | null; settings?: Record<string, unknown> | null },
): TbdpDesignContext {
  tbdpBuilderLifecycle.templateSelected({
    templateId,
    language: options?.language ?? undefined,
    industryId: options?.industryId ?? undefined,
  });

  const bridge = resolveTemplateBridge({
    templateId,
    industryId: options?.industryId ?? undefined,
    language: options?.language ?? undefined,
  });

  return bridge.designContext;
}

export function mergeTbdpSettings(
  prior: Record<string, unknown> | undefined,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return { ...prior, ...patch };
}
