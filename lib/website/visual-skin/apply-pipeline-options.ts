import type { ApplyV2TemplateParams } from "@/lib/website/template-v2/apply/apply-v2-template";

/**
 * Shared V2 apply flags for every visual-skin / flagship path
 * (catalog preview, project apply, generation finalize).
 */
export function getVisualSkinV2ApplyPipelineOptions(): Pick<
  ApplyV2TemplateParams,
  "directPackageId" | "forceBlueprintFallback" | "skinOnlyOverride"
> {
  return {
    directPackageId: true,
    forceBlueprintFallback: false,
    skinOnlyOverride: false,
  };
}
