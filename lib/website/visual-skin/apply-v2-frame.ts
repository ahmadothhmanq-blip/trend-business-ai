import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { applyTemplateV2ToProject } from "@/lib/website/template-v2/apply/apply-v2-template";
import { isV2StructureApplied } from "@/lib/website/template-v2/generation/v2-generation-bridge";
import { getVisualSkin } from "@/lib/website/visual-skin/registry";
import { getVisualSkinV2ApplyPipelineOptions } from "@/lib/website/visual-skin/apply-pipeline-options";
import {
  resolveVisualSkinThemeBridge,
  resolveVisualSkinV2PackageId,
} from "@/lib/website/visual-skin/theme-bridge";

export type ApplyVisualSkinV2Options = {
  /**
   * Generation hot path — skip duplicate apply when the V2 package is
   * already on the project. Pipeline flags stay identical to catalog preview.
   */
  generationFastPath?: boolean;
};

export { getVisualSkinV2ApplyPipelineOptions } from "@/lib/website/visual-skin/apply-pipeline-options";

/**
 * Apply a visual skin via the V2 Flagship pipeline (95+ QA templates).
 * Preserves SitePlan / business identity; rebuilds presentation layer only.
 */
export async function applyVisualSkinV2FrameRetheme(
  project: GeneratedWebsiteProject,
  skinId: string,
  language?: string | null,
  options?: ApplyVisualSkinV2Options,
): Promise<{ project: GeneratedWebsiteProject; notes: string[] }> {
  const skin = getVisualSkin(skinId);
  if (!skin) {
    return {
      project,
      notes: ["No published visual skin — V2 frame retheme skipped"],
    };
  }

  const bridge = resolveVisualSkinThemeBridge(skinId);
  const packageId = resolveVisualSkinV2PackageId(skinId);
  if (!bridge || !packageId) {
    return {
      project,
      notes: [`Visual skin "${skinId}" has no V2 package bridge — skipped`],
    };
  }

  if (options?.generationFastPath && isV2StructureApplied(project, packageId)) {
    return {
      project: {
        ...project,
        settings: {
          ...project.settings,
          visualSkinId: skin.id,
          templatePackageId: packageId,
        },
      },
      notes: [`V2 flagship skin already applied (${packageId}) — skipped duplicate`],
    };
  }

  const priorTi = project.settings?.templateIntelligenceId?.trim() || null;
  const pipeline = getVisualSkinV2ApplyPipelineOptions();

  const result = await applyTemplateV2ToProject({
    project,
    templatePackageId: packageId,
    language,
    ...pipeline,
  });

  const notes = [
    `Visual skin V2 flagship: ${skin.label} → ${packageId}`,
    ...(bridge.tbdpTemplateIdentity
      ? [`TBDP identity: ${bridge.tbdpTemplateIdentity}`]
      : []),
    ...result.notes,
  ];

  return {
    project: {
      ...result.project,
      settings: {
        ...result.project.settings,
        visualSkinId: skin.id,
        websiteStructureTemplateId: packageId,
        templatePackageId: packageId,
        ...(priorTi ? { templateIntelligenceId: priorTi } : {}),
      },
    },
    notes,
  };
}
