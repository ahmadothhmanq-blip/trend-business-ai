import { resolveBuilderTemplatePackageId, resolveInstalledBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";
import { resolveStructureTemplateIntelligenceId } from "@/lib/website/builder/template-package-ti-mapping";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { applyTemplateV2ToProject } from "@/lib/website/template-v2/apply/apply-v2-template";
import { resolveTemplateArchitecture } from "@/lib/website/template-v2/router/resolve-template-architecture";
import { isStructureFirstEnabled } from "@/lib/website/generation-flags";
import {
  isVisualSkinV2PackageId,
  resolveVisualSkinV2PackageId,
} from "@/lib/website/visual-skin/theme-bridge";
import { getVisualSkinV2ApplyPipelineOptions } from "@/lib/website/visual-skin/apply-pipeline-options";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
} from "@/plugins/website/types";

/** Flagship V2 packages that must never use the legacy Theme* generation path. */
export const FLAGSHIP_V2_PACKAGE_IDS = [] as const;

export type FlagshipV2PackageId = (typeof FLAGSHIP_V2_PACKAGE_IDS)[number];

const THEME_SCAFFOLD_PATH_RE = /components\/themes\//i;
const THEME_COMPONENT_RE =
  /Theme(Bold|Corporate|Luxury|Tech|Creative|Editorial|Minimal|Modern)/;

export function resolveGenerationTemplatePackageId(
  input: Pick<
    WebsiteGenerationInput,
    | "websiteStructureTemplateId"
    | "templateId"
    | "marketplaceTemplateId"
  > & { visualSkinId?: string },
): string | null {
  const raw =
    input.websiteStructureTemplateId?.trim() ||
    input.templateId?.trim() ||
    input.marketplaceTemplateId?.trim() ||
    "";
  if (!raw) return null;
  // Prefer installed/visual-skin resolution so flagships never fall through
  // to `_generation-default`.
  const installed = resolveInstalledBuilderTemplatePackageId(raw);
  if (installed) return installed;
  const resolved = resolveBuilderTemplatePackageId(raw);
  return resolved || null;
}

/**
 * Post-generation template resolution — includes visual skin → V2 package mapping.
 * Visual skins must NOT affect file-generation routing (they apply once after TBGE).
 */
export function resolvePostGenerationTemplatePackageId(
  input: Pick<
    WebsiteGenerationInput,
    | "websiteStructureTemplateId"
    | "templateId"
    | "marketplaceTemplateId"
    | "visualSkinId"
  >,
): string | null {
  const skinPackage = input.visualSkinId?.trim()
    ? resolveVisualSkinV2PackageId(input.visualSkinId)
    : null;
  if (skinPackage) return skinPackage;
  return resolveGenerationTemplatePackageId(input);
}

export async function shouldUseV2StructureDuringGeneration(
  packageId: string | null,
): Promise<boolean> {
  if (!packageId) return false;
  if (isVisualSkinV2PackageId(packageId)) return true;
  const arch = await resolveTemplateArchitecture({ packageId });
  return arch.architectureVersion === "v2";
}

export function isFlagshipV2PackageId(
  packageId: string,
): packageId is FlagshipV2PackageId {
  return (FLAGSHIP_V2_PACKAGE_IDS as readonly string[]).includes(packageId);
}

export function resolveTemplateIntelligenceForStructurePackage(
  input: Pick<WebsiteGenerationInput, "templateIntelligenceId">,
  packageId: string,
): string {
  return (
    input.templateIntelligenceId?.trim() ||
    resolveStructureTemplateIntelligenceId(packageId)
  );
}

/** Remove legacy Theme* scaffold files so V2 components are the only presentation layer. */
export function stripLegacyThemeScaffoldFiles(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  return files.filter((file) => {
    const path = file.path.replaceAll("\\", "/");
    if (THEME_SCAFFOLD_PATH_RE.test(path)) return false;
    if (THEME_COMPONENT_RE.test(file.content) && path.endsWith(".tsx")) {
      return false;
    }
    return true;
  });
}

export function projectContainsThemeComponents(
  files: GeneratedProjectFile[],
): boolean {
  return files.some(
    (file) =>
      THEME_SCAFFOLD_PATH_RE.test(file.path.replaceAll("\\", "/")) ||
      THEME_COMPONENT_RE.test(file.content),
  );
}

export function projectUsesV2FlagshipComponents(
  files: GeneratedProjectFile[],
  packageId: string,
): boolean {
  const page = files.find(
    (f) => f.path.replaceAll("\\", "/") === "app/page.tsx",
  )?.content;
  if (!page) return false;
  return (
    page.includes(`data-v2-package="${packageId}"`) ||
    page.includes(`${packageId}-`)
  );
}

/**
 * Apply V2 structure template during generation — injects package scaffolds,
 * composes home from presentation.json, and stamps v2 settings.
 */
export async function applyV2StructureDuringGeneration(params: {
  project: GeneratedWebsiteProject;
  templatePackageId: string;
  language?: string | null;
  generationFastPath?: boolean;
  visualSkinId?: string | null;
}): Promise<GeneratedWebsiteProject> {
  const packageId = params.templatePackageId.trim();
  const directPackage = isVisualSkinV2PackageId(packageId);
  const structureFirst = isStructureFirstEnabled();
  const cleaned: GeneratedWebsiteProject = structureFirst
    ? params.project
    : {
        ...params.project,
        files: stripLegacyThemeScaffoldFiles(params.project.files ?? []),
      };

  if (directPackage) {
    const priorTi = cleaned.settings?.templateIntelligenceId?.trim() || null;
    const pipeline = getVisualSkinV2ApplyPipelineOptions();
    const result = await applyTemplateV2ToProject({
      project: cleaned,
      templatePackageId: packageId,
      language: params.language,
      ...pipeline,
    });
    return {
      ...result.project,
      settings: {
        ...result.project.settings,
        websiteStructureTemplateId: packageId,
        templatePackageId: packageId,
        ...(params.visualSkinId ? { visualSkinId: params.visualSkinId } : {}),
        ...(priorTi ? { templateIntelligenceId: priorTi } : {}),
      },
    };
  }

  const result = await applyStructureTemplateToProject({
    project: cleaned,
    templatePackageId: packageId,
    language: params.language,
  });

  return result.project;
}

export function isV2StructureApplied(
  project: GeneratedWebsiteProject,
  packageId: string,
): boolean {
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  return (
    settings.templateArchitectureVersion === "v2" &&
    settings.templatePackageId === packageId
  );
}

/**
 * Finalize generation output with V2 structure when a V2 template package was selected.
 * Safe to call from TBGE and legacy orchestrator paths (skips if already applied).
 */
export async function finalizeV2StructureAfterGeneration(
  project: GeneratedWebsiteProject,
  input: Pick<
    WebsiteGenerationInput,
    | "websiteStructureTemplateId"
    | "templateId"
    | "marketplaceTemplateId"
    | "visualSkinId"
    | "language"
  >,
  onProgress?: (message: string) => void,
): Promise<GeneratedWebsiteProject> {
  const packageId = resolvePostGenerationTemplatePackageId(input);
  if (!packageId) return project;
  if (!(await shouldUseV2StructureDuringGeneration(packageId))) return project;
  if (isV2StructureApplied(project, packageId)) return project;

  const fromVisualSkin = Boolean(
    input.visualSkinId?.trim() &&
      resolveVisualSkinV2PackageId(input.visualSkinId) === packageId,
  );

  onProgress?.(
    fromVisualSkin
      ? `[v2] Applying visual skin ${packageId}…`
      : isStructureFirstEnabled()
        ? `[v2] Applying template skin ${packageId}…`
        : `[v2] Applying structure template ${packageId}…`,
  );
  return applyV2StructureDuringGeneration({
    project,
    templatePackageId: packageId,
    language: input.language,
    generationFastPath: fromVisualSkin,
    visualSkinId: fromVisualSkin ? input.visualSkinId : undefined,
  });
}
