import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { DesignSystem } from "@/lib/website/types/layers";
import { isVisualSkinV1Enabled } from "@/lib/website/generation-flags";
import type { ApplyVisualSkinV2Options } from "@/lib/website/visual-skin/apply-v2-frame";
import type { VisualSkin } from "@/lib/website/visual-skin/types";
import { isV2StructureApplied } from "@/lib/website/template-v2/generation/v2-generation-bridge";
import { resolveVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";
import {
  applyVisualSkinToProject,
  applyVisualSkinToProjectAsync,
} from "@/lib/website/visual-skin/apply-project";
import { getVisualSkin } from "@/lib/website/visual-skin/registry";
import { resolveSkinSectionShellVariant } from "@/lib/website/visual-skin/resolve-section-shell";

export function applyVisualSkinToDesignSystem(
  design: DesignSystem | undefined,
  skin: VisualSkin,
): DesignSystem {
  const base = design ?? {
    style: skin.label,
    stylePreset: "modern",
    industryPattern: "general",
    colors: {
      primary: skin.tokens.primary,
      secondary: skin.tokens.secondary,
      accent: skin.tokens.accent,
      neutral: skin.tokens.secondary,
      surface: skin.tokens.background,
      background: skin.tokens.background,
      foreground: skin.tokens.foreground,
    },
    typography: {
      headingFont: skin.typography.headingFont,
      bodyFont: skin.typography.bodyFont,
      scale: ["0.875rem", "1rem", "1.25rem", "1.5rem", "2.25rem"],
      notes: skin.description,
    },
    layoutRules: [],
    layoutStyle: resolveSkinSectionShellVariant(skin),
    uiPatterns: [],
    componentPalette: [],
    spacingScale: ["4", "8", "16", "24", "32", "48"],
    borderRadius: skin.tokens.radius,
    shadowStyle: "soft",
    sectionShellVariant: resolveSkinSectionShellVariant(skin),
  };

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: skin.tokens.primary,
      secondary: skin.tokens.secondary,
      accent: skin.tokens.accent,
      background: skin.tokens.background,
      foreground: skin.tokens.foreground,
      surface: skin.tokens.background,
    },
    typography: {
      ...base.typography,
      headingFont: skin.typography.headingFont,
      bodyFont: skin.typography.bodyFont,
    },
    borderRadius: skin.tokens.radius,
    sectionShellVariant: resolveSkinSectionShellVariant(skin),
  };
}

/** Apply visual skin tokens — always available for explicit reapply (sync). */
export function reapplyVisualSkinToProject(
  project: GeneratedWebsiteProject,
  skinId: string,
): GeneratedWebsiteProject {
  return applyVisualSkinToProject(project, skinId);
}

/** Apply visual skin after SitePlan/content — only when explicitly chosen (WB_VISUAL_SKIN_V1). */
export function applyVisualSkinIfEnabled(
  project: GeneratedWebsiteProject,
  skinId?: string | null,
): GeneratedWebsiteProject {
  if (!isVisualSkinV1Enabled()) return project;
  const id = skinId ?? project.settings?.visualSkinId ?? null;
  if (!id || !getVisualSkin(id)) return project;
  return applyVisualSkinToProject(project, id);
}

export async function applyVisualSkinIfEnabledAsync(
  project: GeneratedWebsiteProject,
  skinId?: string | null,
  language?: string | null,
  options?: ApplyVisualSkinV2Options,
): Promise<GeneratedWebsiteProject> {
  if (!isVisualSkinV1Enabled()) return project;
  const id = skinId ?? project.settings?.visualSkinId ?? null;
  if (!id || !getVisualSkin(id)) return project;

  const skinPackage = resolveVisualSkinV2PackageId(id);
  if (
    options?.generationFastPath &&
    skinPackage &&
    isV2StructureApplied(project, skinPackage)
  ) {
    return {
      ...project,
      settings: {
        ...project.settings,
        visualSkinId: id,
        templatePackageId: skinPackage,
      },
    };
  }

  return applyVisualSkinToProjectAsync(project, id, language, options);
}
