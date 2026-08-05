import { resolveBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";
import { resolveStructureTemplateIntelligenceId } from "@/lib/website/builder/template-package-ti-mapping";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { resolveTemplateArchitecture } from "@/lib/website/template-v2/router/resolve-template-architecture";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
} from "@/plugins/website/types";

/** Flagship V2 packages that must never use the legacy Theme* generation path. */
export const FLAGSHIP_V2_PACKAGE_IDS = [
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
] as const;

export type FlagshipV2PackageId = (typeof FLAGSHIP_V2_PACKAGE_IDS)[number];

const THEME_SCAFFOLD_PATH_RE = /components\/themes\//i;
const THEME_COMPONENT_RE =
  /Theme(Bold|Corporate|Luxury|Tech|Creative|Editorial|Minimal|Modern)/;

export function resolveGenerationTemplatePackageId(
  input: Pick<
    WebsiteGenerationInput,
    "websiteStructureTemplateId" | "templateId" | "marketplaceTemplateId"
  >,
): string | null {
  const raw =
    input.websiteStructureTemplateId?.trim() ||
    input.templateId?.trim() ||
    input.marketplaceTemplateId?.trim() ||
    "";
  if (!raw) return null;
  const resolved = resolveBuilderTemplatePackageId(raw);
  return resolved || null;
}

export async function shouldUseV2StructureDuringGeneration(
  packageId: string | null,
): Promise<boolean> {
  if (!packageId) return false;
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
}): Promise<GeneratedWebsiteProject> {
  const cleaned: GeneratedWebsiteProject = {
    ...params.project,
    files: stripLegacyThemeScaffoldFiles(params.project.files ?? []),
  };

  const result = await applyStructureTemplateToProject({
    project: cleaned,
    templatePackageId: params.templatePackageId,
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
    "websiteStructureTemplateId" | "templateId" | "marketplaceTemplateId" | "language"
  >,
  onProgress?: (message: string) => void,
): Promise<GeneratedWebsiteProject> {
  const packageId = resolveGenerationTemplatePackageId(input);
  if (!packageId) return project;
  if (!(await shouldUseV2StructureDuringGeneration(packageId))) return project;
  if (isV2StructureApplied(project, packageId)) return project;

  onProgress?.(`[v2] Applying structure template ${packageId}…`);
  return applyV2StructureDuringGeneration({
    project,
    templatePackageId: packageId,
    language: input.language,
  });
}
