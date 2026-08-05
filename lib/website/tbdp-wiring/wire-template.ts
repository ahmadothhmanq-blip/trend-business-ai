import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { tbdpBuilderLifecycle } from "@/lib/design-platform/integration";
import { wireWebsiteGenerationStart } from "@/lib/website/tbdp-wiring/wire-generation";

export type WireTemplateApplyParams = {
  project: GeneratedWebsiteProject;
  templatePackageId: string;
  language?: string | null;
};

export type WireTemplateApplyResult = {
  settingsPatch: Record<string, unknown>;
  tbdpCssLayer?: string;
};

/**
 * Template selection wiring — resolves sector DNA, experience, components,
 * foundations, theme, and language before rendering.
 */
export function wireTemplateApply(
  params: WireTemplateApplyParams,
): WireTemplateApplyResult {
  const priorSettings = (params.project.settings ?? {}) as Record<string, unknown>;
  const industryId =
    typeof priorSettings.industryId === "string"
      ? priorSettings.industryId
      : undefined;

  const bridge = tbdpBuilderLifecycle.templateSelected({
    templateId: params.templatePackageId,
    language: params.language ?? undefined,
    industryId,
  });

  tbdpBuilderLifecycle.postApply({
    templateId: params.templatePackageId,
    language: params.language ?? undefined,
    industryId,
  });

  const wired = wireWebsiteGenerationStart({
    templateId: params.templatePackageId,
    language: params.language ?? undefined,
    industryId,
  });

  return {
    settingsPatch: wired.settingsPatch,
    tbdpCssLayer: bridge.templateResolution
      ? [
          "/* TBDP Integration Layer */",
          bridge.templateResolution.cssVariables,
          bridge.templateResolution.experienceCss,
        ].join("\n\n")
      : undefined,
  };
}

export function applyTbdpSettingsToProject(
  project: GeneratedWebsiteProject,
  settingsPatch: Record<string, unknown>,
): GeneratedWebsiteProject {
  return {
    ...project,
    settings: {
      ...(project.settings as Record<string, unknown> | undefined),
      ...settingsPatch,
    } as GeneratedWebsiteProject["settings"],
  };
}
