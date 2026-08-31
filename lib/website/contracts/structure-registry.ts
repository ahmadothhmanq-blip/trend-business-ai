/**
 * Lazy structure-template index access — breaks static import cycle between
 * Architecture Knowledge Base and the generated template package catalog.
 */

import { isKnownStructureTemplatePackage } from "@/lib/website/builder/template-package-ti-mapping";

export type StructureTemplateIndex = Record<
  string,
  { id: string } | undefined
>;

let cachedIndex: StructureTemplateIndex | null = null;

export function getStructureTemplateIndex(): StructureTemplateIndex {
  if (cachedIndex) return cachedIndex;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@/lib/website/builder/unified-template-registry") as {
    WEBSITE_STRUCTURE_TEMPLATE_INDEX: StructureTemplateIndex;
  };
  cachedIndex = mod.WEBSITE_STRUCTURE_TEMPLATE_INDEX;
  return cachedIndex;
}

export function isKnownStructureTemplateId(structureId: string): boolean {
  if (structureId === "_generation-default") {
    return true;
  }
  if (getStructureTemplateIndex()[structureId]) {
    return true;
  }
  return isKnownStructureTemplatePackage(structureId);
}

export function resetStructureTemplateIndexForTests(): void {
  cachedIndex = null;
}
