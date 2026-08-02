/**
 * Lazy structure-template index access — breaks static import cycle between
 * Architecture Knowledge Base and the generated template package catalog.
 */

export type StructureTemplateIndex = Record<
  string,
  { id: string } | undefined
>;

let cachedIndex: StructureTemplateIndex | null = null;

export function getStructureTemplateIndex(): StructureTemplateIndex {
  if (cachedIndex) return cachedIndex;
  // Dynamic import at call time avoids AKB ↔ template-package-index init cycle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@/lib/website/builder/template-package-index") as {
    WEBSITE_STRUCTURE_TEMPLATE_INDEX: StructureTemplateIndex;
  };
  cachedIndex = mod.WEBSITE_STRUCTURE_TEMPLATE_INDEX;
  return cachedIndex;
}

export function isKnownStructureTemplateId(structureId: string): boolean {
  return Boolean(getStructureTemplateIndex()[structureId]);
}

export function resetStructureTemplateIndexForTests(): void {
  cachedIndex = null;
}
