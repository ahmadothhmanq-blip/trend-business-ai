import type { TemplateSectionSpec } from "@/lib/ai-core/template-intelligence/types";
import {
  getSectionLabelForIndustry,
  resolveVerticalPaletteId,
  type VerticalPaletteId,
} from "@/lib/ai-core/template-intelligence/industry-palettes";

function sectionRole(componentId: string): TemplateSectionSpec["role"] {
  if (/Header|Nav/i.test(componentId)) return "header";
  if (/Footer/i.test(componentId)) return "footer";
  if (/Hero/i.test(componentId)) return "hero";
  return "section";
}

function defaultLabel(componentId: string): string {
  return componentId
    .replace(/([A-Z])/g, " $1")
    .replace(/^ /, "")
    .trim();
}

/** Build ordered section specs from template component list. */
export function buildSectionSpecsFromComponents(
  componentIds: string[],
  options?: { industryId?: string | null; haystack?: string },
): TemplateSectionSpec[] {
  const paletteId: VerticalPaletteId = options?.industryId
    ? resolveVerticalPaletteId(options.industryId, options.haystack)
    : "generic";
  let contentSlot = 0;
  return componentIds.map((componentId) => {
    const role = sectionRole(componentId);
    const industryLabel = getSectionLabelForIndustry(componentId, paletteId);
    const spec: TemplateSectionSpec = {
      componentId,
      role,
      label: industryLabel || defaultLabel(componentId),
    };
    if (role === "section") {
      spec.contentSlot = contentSlot;
      contentSlot += 1;
    }
    return spec;
  });
}
