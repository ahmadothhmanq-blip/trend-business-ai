import type {
  TbdpTemplateBridgeInput,
  TbdpTemplateBridgeOutput,
} from "@/lib/design-platform/integration/core/types";
import { resolveDesignContext } from "@/lib/design-platform/integration/design-resolver";
import { resolveTemplateDesign } from "@/lib/design-platform/integration/template-resolver";
import { resolveSectorId } from "@/lib/design-platform/integration/industry-map";

/**
 * Template bridge — V1 and V2 templates can read TBDP foundations,
 * components, experience, and sector DNA via this advisory layer.
 * Does not modify template files or apply paths.
 */
export function resolveTemplateBridge(
  input: TbdpTemplateBridgeInput,
): TbdpTemplateBridgeOutput {
  const sectorId = resolveSectorId({
    sectorId: input.sectorId,
    industryId: input.industryId,
    templateId: input.templateId,
  });

  const templateResolution = resolveTemplateDesign({
    templateId: input.templateId,
    sectorId,
    industryId: input.industryId,
    language: input.language,
    architectureVersion: input.architectureVersion,
    themeMode: input.themeMode,
  });

  const designContext = resolveDesignContext({
    sectorId,
    language: input.language,
    templateId: input.templateId,
    architectureVersion: input.architectureVersion,
    themeMode: input.themeMode,
  });

  const tbdpCssLayer = [
    "/* TBDP Integration Layer — advisory token layer */",
    templateResolution.cssVariables,
    templateResolution.experienceCss,
  ].join("\n\n");

  return {
    templateId: input.templateId,
    architectureVersion: templateResolution.architectureVersion,
    designContext,
    templateResolution,
    tbdpCssLayer,
    foundationsAvailable: true,
    experienceAvailable: true,
    sectorDnaAvailable: true,
  };
}
