import {
  applyTemplateIntelligenceRetheme,
  type RethemeResult,
} from "@/lib/ai-core/template-intelligence/apply";
import { resolveStructureTemplateIntelligenceId } from "@/lib/website/builder/template-package-ti-mapping";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { applyTemplateV2ToProject } from "@/lib/website/template-v2/apply/apply-v2-template";
import { readTemplatePackageManifestRaw } from "@/lib/website/template-v2/loader/load-v2-package";
import {
  resolveTemplateArchitectureFromManifest,
  shouldUseV2Apply,
} from "@/lib/website/template-v2/router/resolve-template-architecture";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import {
  wireTemplateApply,
} from "@/lib/website/tbdp-wiring";
import {
  resolveInstalledBuilderTemplatePackageId,
} from "@/lib/website/builder/resolve-builder-template-package-id";
import { getVisualSkinV2ApplyPipelineOptions } from "@/lib/website/visual-skin/apply-pipeline-options";
import { isVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";
import path from "node:path";

export type ApplyStructureTemplateParams = {
  project: GeneratedWebsiteProject;
  templatePackageId: string;
  language?: string | null;
};

function stampStructureTemplateSettings(
  result: RethemeResult,
  templatePackageId: string,
  priorSettings: Record<string, unknown>,
  tbdpSettingsPatch?: Record<string, unknown>,
): GeneratedWebsiteProject {
  return {
    ...result.project,
    settings: {
      ...priorSettings,
      ...(result.project.settings as Record<string, unknown> | undefined),
      ...(tbdpSettingsPatch ?? {}),
      websiteStructureTemplateId: templatePackageId,
      templatePackageId,
      templateIntelligenceId: result.template.id,
      selectedTemplateId: templatePackageId,
      templateIntelligenceCategory: result.template.category,
    } as GeneratedWebsiteProject["settings"],
  };
}

/**
 * Apply an installed structure template package to an existing website project.
 * Routes V2 packages through the V2 presentation engine; V1 packages use TI retheme.
 */
export async function applyStructureTemplateToProject(
  params: ApplyStructureTemplateParams,
): Promise<RethemeResult> {
  const templatePackageId = resolveInstalledBuilderTemplatePackageId(
    params.templatePackageId.trim(),
  );
  if (!templatePackageId) {
    throw new Error("templatePackageId is required");
  }

  const priorSettings = (params.project.settings ?? {}) as Record<string, unknown>;
  const tbdpWire = wireTemplateApply({
    project: params.project,
    templatePackageId,
    language: params.language,
  });
  const packageDirectory = path.join(resolveWbTemplatesRoot(), templatePackageId);

  let manifest;
  try {
    manifest = await readTemplatePackageManifestRaw(packageDirectory);
  } catch {
    manifest = null;
  }

  const architecture = manifest
    ? resolveTemplateArchitectureFromManifest(manifest, priorSettings)
    : { architectureVersion: "v1" as const, packageId: templatePackageId, reason: "manifest unavailable" };

  if (shouldUseV2Apply(architecture.architectureVersion)) {
    const pipeline = isVisualSkinV2PackageId(templatePackageId)
      ? getVisualSkinV2ApplyPipelineOptions()
      : { directPackageId: true as const };
    const result = await applyTemplateV2ToProject({
      project: params.project,
      templatePackageId,
      language: params.language,
      ...pipeline,
    });

    return {
      ...result,
      project: stampStructureTemplateSettings(
        result,
        templatePackageId,
        priorSettings,
        tbdpWire.settingsPatch,
      ),
      notes: [
        ...result.notes,
        `Structure template package applied (V2): ${templatePackageId} → ${result.template.name}`,
      ],
    };
  }

  const templateIntelligenceId =
    resolveStructureTemplateIntelligenceId(templatePackageId);

  const result = applyTemplateIntelligenceRetheme({
    project: params.project,
    templateId: templateIntelligenceId,
    language: params.language,
  });

  return {
    ...result,
    project: stampStructureTemplateSettings(
      result,
      templatePackageId,
      priorSettings,
      tbdpWire.settingsPatch,
    ),
    notes: [
      ...result.notes,
      `Structure template package applied: ${templatePackageId} → ${result.template.name}`,
    ],
  };
}
