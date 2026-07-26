/**
 * Blueprint materialized-view sync — derived fields from files[].
 * Phase 1: called on every commitBlueprintRevision before persist.
 */

import {
  parseHomeComponentOrder,
  understandWebsite,
} from "@/lib/ai-core/website-editor/understand";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function findHomePage(files: GeneratedWebsiteProject["files"]) {
  return files.find((f) => {
    const p = normalizePath(f.path);
    return p === "app/page.tsx" || p.endsWith("/app/page.tsx");
  });
}

function listAppPages(files: GeneratedWebsiteProject["files"]): string[] {
  const pages: string[] = [];
  for (const file of files) {
    const p = normalizePath(file.path);
    if (/^app\/.*page\.tsx$/.test(p) || /\/app\/.*page\.tsx$/.test(p)) {
      pages.push(p);
    }
  }
  return pages;
}

/**
 * Updates derived blueprint fields from project files (never deletes strategy/designSystem/assetManifest).
 */
export function syncBlueprintMaterializedView(
  project: GeneratedWebsiteProject,
): GeneratedWebsiteProject {
  const files = project.files ?? [];
  if (!files.length) {
    throw new Error("Blueprint sync failed: no files.");
  }

  const home = findHomePage(files);
  if (!home) {
    throw new Error("Blueprint sync failed: app/page.tsx not found.");
  }

  if (!home.content.trim()) {
    throw new Error("Blueprint sync failed: app/page.tsx content is empty.");
  }

  const homeOrder = parseHomeComponentOrder(home.content);
  if (!homeOrder.length) {
    throw new Error("Blueprint sync failed: home page has no components.");
  }

  const pages = listAppPages(files);
  const understanding = understandWebsite({ files, project });
  const tokens = understanding.designTokens;
  const colorPalette = [
    tokens.primary,
    tokens.secondary,
    tokens.accent,
    tokens.background,
    tokens.foreground,
  ].filter((c): c is string => Boolean(c));

  return {
    ...project,
    pages: pages.length ? pages : project.pages,
    sections: homeOrder,
    components: homeOrder,
    colorPalette: colorPalette.length ? colorPalette : project.colorPalette,
  };
}
