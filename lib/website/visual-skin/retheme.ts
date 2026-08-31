import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { applyVisualSkinV2FrameRetheme } from "@/lib/website/visual-skin/apply-v2-frame";
import type { ApplyVisualSkinV2Options } from "@/lib/website/visual-skin/apply-v2-frame";
import { applyVisualSkinFrameRetheme } from "@/lib/website/visual-skin/frame-retheme";
import { resolveVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";

/**
 * Full visual skin apply — V2 Flagship when bridged, else legacy Theme* libraries.
 */
export async function applyVisualSkinFullRetheme(
  project: GeneratedWebsiteProject,
  skinId: string,
  language?: string | null,
  options?: ApplyVisualSkinV2Options,
): Promise<{ project: GeneratedWebsiteProject; notes: string[] }> {
  if (resolveVisualSkinV2PackageId(skinId)) {
    return applyVisualSkinV2FrameRetheme(project, skinId, language, options);
  }
  return applyVisualSkinFrameRetheme(project, skinId, language);
}

/** @deprecated Use applyVisualSkinFrameRetheme */
export function applyVisualSkinLegacyRetheme(
  project: GeneratedWebsiteProject,
  skinId: string,
  language?: string | null,
): { project: GeneratedWebsiteProject; notes: string[] } {
  return applyVisualSkinFrameRetheme(project, skinId, language);
}

export function projectUsesV2Architecture(
  project: GeneratedWebsiteProject,
): boolean {
  const settings = project.settings as Record<string, unknown> | undefined;
  if (settings?.templateArchitectureVersion === "v2") return true;
  const globals = project.files?.find((f) => f.path.endsWith("globals.css"));
  return Boolean(
    globals?.content.includes("Template Architecture V2") ||
      globals?.content.includes("--v2-package"),
  );
}
