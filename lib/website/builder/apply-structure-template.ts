import {
  applyTemplateIntelligenceRetheme,
  type RethemeResult,
} from "@/lib/ai-core/template-intelligence/apply";
import { resolveStructureTemplateIntelligenceId } from "@/lib/website/builder/template-package-ti-mapping";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

export type ApplyStructureTemplateParams = {
  project: GeneratedWebsiteProject;
  templatePackageId: string;
  language?: string | null;
};

/**
 * Apply an installed structure template package to an existing website project.
 * Preserves business identity (content, SEO, images, pages) and rebuilds presentation.
 */
export function applyStructureTemplateToProject(
  params: ApplyStructureTemplateParams,
): RethemeResult {
  const templatePackageId = params.templatePackageId.trim();
  if (!templatePackageId) {
    throw new Error("templatePackageId is required");
  }

  const templateIntelligenceId =
    resolveStructureTemplateIntelligenceId(templatePackageId);

  const result = applyTemplateIntelligenceRetheme({
    project: params.project,
    templateId: templateIntelligenceId,
    language: params.language,
  });

  const priorSettings = (params.project.settings ?? {}) as Record<
    string,
    unknown
  >;

  const project: GeneratedWebsiteProject = {
    ...result.project,
    settings: {
      ...priorSettings,
      ...(result.project.settings as Record<string, unknown> | undefined),
      websiteStructureTemplateId: templatePackageId,
      templatePackageId,
      templateIntelligenceId: result.template.id,
      selectedTemplateId: templatePackageId,
      templateIntelligenceCategory: result.template.category,
    } as GeneratedWebsiteProject["settings"],
  };

  return {
    ...result,
    project,
    notes: [
      ...result.notes,
      `Structure template package applied: ${templatePackageId} → ${result.template.name}`,
    ],
  };
}
