/**
 * Website Builder — page/section structure resolution (Milestone 1).
 */

import { buildVisualDocument } from "@/lib/ai-core/visual-editor";
import {
  parseStructureFromFiles,
  resolveSiteStructureForProject,
} from "@/lib/ai-core/website-management/pages/site-structure";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type {
  BuilderPageView,
  BuilderSectionView,
  BuilderWorkspaceStructure,
} from "@/lib/website/builder/types";

const HOME_ROUTES = new Set(["/", "/home"]);

export function resolveBuilderPages(
  project: GeneratedWebsiteProject,
  promptHint?: string | null,
): BuilderPageView[] {
  const files = project.files ?? [];
  const industryId =
    project.businessProfile?.industry ||
    project.designSystem?.industryPattern ||
    "business";

  const structure =
    parseStructureFromFiles(files) ??
    resolveSiteStructureForProject(files, industryId, promptHint);

  return structure.pages.map((page) => ({
    route: page.route,
    label: page.label,
    path: page.path,
    purpose: page.purpose,
    isHome: HOME_ROUTES.has(page.route) || page.path === "app/page.tsx",
    editableInCanvas:
      HOME_ROUTES.has(page.route) || page.path === "app/page.tsx",
  }));
}

export function resolveBuilderSections(
  generationId: string,
  project: GeneratedWebsiteProject,
): BuilderSectionView[] {
  const doc = buildVisualDocument({
    generationId,
    files: project.files ?? [],
    project,
  });

  return doc.nodes.map((node) => ({
    id: node.id,
    exportName: node.exportName,
    label: node.label,
    kind: node.kind,
    locked: node.locked,
  }));
}

export function resolveBuilderWorkspaceStructure(params: {
  generationId: string;
  project: GeneratedWebsiteProject;
  promptHint?: string | null;
  selectedPageRoute?: string;
}): BuilderWorkspaceStructure {
  const pages = resolveBuilderPages(params.project, params.promptHint);
  const home =
    pages.find((p) => p.isHome)?.route ??
    pages[0]?.route ??
    "/";
  const selectedPageRoute = params.selectedPageRoute ?? home;

  return {
    pages,
    sections: resolveBuilderSections(params.generationId, params.project),
    selectedPageRoute,
  };
}

export function sectionToCopilotSelection(section: BuilderSectionView): {
  nodeId: string;
  nodeLabel: string;
  sectionKind?: string;
  componentExportName?: string;
} {
  return {
    nodeId: section.id,
    nodeLabel: section.label,
    sectionKind: section.kind,
    componentExportName: section.exportName,
  };
}
