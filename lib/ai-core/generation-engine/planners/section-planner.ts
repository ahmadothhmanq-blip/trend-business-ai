import type {
  Tbge2IntentAnalysis,
  Tbge2PagePlan,
  Tbge2RequirementsAnalysis,
  Tbge2SectionPlan,
} from "@/lib/ai-core/generation-engine/core/types";
import { resolveSectionsForPage } from "@/lib/ai-core/generation-engine/registry/sections";

/**
 * Section Planner — generates sections for every page.
 */
export function planSections(
  pages: Tbge2PagePlan[],
  intent: Tbge2IntentAnalysis,
  requirements: Tbge2RequirementsAnalysis,
): Tbge2SectionPlan[] {
  const sections: Tbge2SectionPlan[] = [];

  for (const page of pages) {
    const templates = resolveSectionsForPage(page.kind, intent.category);
    let order = 0;

    for (const template of templates) {
      if (template.type === "pricing" && !requirements.required.includes("pricing")) continue;
      if (template.type === "faq" && !requirements.required.includes("faq")) continue;
      if (template.type === "newsletter" && !requirements.required.includes("newsletter")) continue;

      sections.push({
        id: `section-${page.id}-${template.type}`,
        pageId: page.id,
        type: template.type,
        label: template.label,
        order: order++,
        required: template.required,
      });
    }
  }

  return sections;
}
