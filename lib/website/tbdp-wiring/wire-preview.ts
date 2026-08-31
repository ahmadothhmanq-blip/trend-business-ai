import type { StaticPreviewInput } from "@/lib/website/preview-input";
import { tbdpBuilderLifecycle } from "@/lib/design-platform/integration";
import {
  resolveInstalledBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import {
  hasExplicitPreviewTemplateChoice,
} from "@/lib/website/template-v2/preview/v2-preview-input";
import {
  readStoredContextFromSettings,
  resolveDesignContextFromSettings,
} from "@/lib/website/tbdp-wiring/design-context-store";
import type { TbdpPreviewWiringInput, TbdpPreviewWiringResult } from "@/lib/website/tbdp-wiring/types";
import { resolveTemplateBridge } from "@/lib/design-platform/integration";

/**
 * Unified preview wiring — static, live, and visual editor previews
 * resolve the same Design Context from project settings.
 */
export function wirePreviewContext(
  input: TbdpPreviewWiringInput,
): TbdpPreviewWiringResult {
  const rawTemplateId =
    input.templatePackageId ??
    (typeof input.settings?.templatePackageId === "string"
      ? input.settings.templatePackageId
      : "");
  const templateId = rawTemplateId
    ? resolveInstalledBuilderTemplatePackageId(rawTemplateId)
    : undefined;

  tbdpBuilderLifecycle.preview({
    templateId,
    language: input.language ?? undefined,
    industryId: input.industryId ?? undefined,
  });

  const designContext = resolveDesignContextFromSettings(input.settings, {
    language: input.language ?? undefined,
    industryId: input.industryId ?? undefined,
    templateId,
  });

  if (!designContext && !templateId) {
    return {};
  }

  let tbdpCssLayer: string | undefined;
  if (templateId) {
    const bridge = resolveTemplateBridge({
      templateId,
      language: input.language ?? undefined,
      industryId: input.industryId ?? undefined,
    });
    tbdpCssLayer = bridge.tbdpCssLayer;
  } else if (designContext?.template) {
    tbdpCssLayer = [
      designContext.template.cssVariables,
      designContext.template.experienceCss,
    ].join("\n\n");
  }

  return { designContext, tbdpCssLayer };
}

export function previewInputFromTbdpSettings(
  input: StaticPreviewInput,
): StaticPreviewInput {
  const stored = readStoredContextFromSettings(input.settings);
  if (!stored) return input;

  return {
    ...input,
    industryId: input.industryId ?? stored.sectorDnaId,
    components:
      hasExplicitPreviewTemplateChoice(input) && !input.components?.length
        ? stored.componentIds
        : input.components,
  };
}

export function appendTbdpPreviewCss(html: string, tbdpCssLayer?: string): string {
  if (!tbdpCssLayer?.trim()) return html;
  const marker = "/* TBDP Integration Layer";
  if (html.includes(marker)) return html;
  const injection = `<style id="tbdp-wiring-layer">\n${tbdpCssLayer}\n</style>`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${injection}\n</head>`);
  }
  return `${injection}\n${html}`;
}
