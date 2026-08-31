import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { ApplyVisualSkinV2Options } from "@/lib/website/visual-skin/apply-v2-frame";
import { applyVisualSkinFullRetheme } from "@/lib/website/visual-skin/retheme";
import { applyVisualSkinFrameRetheme } from "@/lib/website/visual-skin/frame-retheme";
import { getVisualSkin } from "@/lib/website/visual-skin/registry";
import { resolveVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";

export type VisualSkinApplyResult = {
  project: GeneratedWebsiteProject;
  notes: string[];
};

/** Apply visual skin — full frame swap (sync). */
export function applyVisualSkinToProject(
  project: GeneratedWebsiteProject,
  skinId?: string | null,
): GeneratedWebsiteProject {
  const id = skinId ?? project.settings?.visualSkinId ?? null;
  if (!id) return project;
  const skin = getVisualSkin(id);
  if (!skin) return project;
  if (resolveVisualSkinV2PackageId(id)) {
    throw new Error(
      `Visual skin "${id}" uses the V2 flagship pipeline — call applyVisualSkinToProjectAsync instead`,
    );
  }
  return applyVisualSkinFrameRetheme(project, id, project.language).project;
}

export async function applyVisualSkinToProjectAsync(
  project: GeneratedWebsiteProject,
  skinId: string,
  language?: string | null,
  options?: ApplyVisualSkinV2Options,
): Promise<GeneratedWebsiteProject> {
  const result = await applyVisualSkinToProjectAsyncWithNotes(
    project,
    skinId,
    language,
    options,
  );
  return result.project;
}

/** Full frame retheme — components, topology, typography, colors. */
export async function applyVisualSkinToProjectAsyncWithNotes(
  project: GeneratedWebsiteProject,
  skinId: string,
  language?: string | null,
  options?: ApplyVisualSkinV2Options,
): Promise<VisualSkinApplyResult> {
  return applyVisualSkinFullRetheme(project, skinId, language, options);
}