import type {
  Tbge2IntentAnalysis,
  Tbge2PagePlan,
  Tbge2RequirementsAnalysis,
} from "@/lib/ai-core/generation-engine/core/types";
import { resolvePageTemplatesForIntent } from "@/lib/ai-core/generation-engine/registry/pages";

/**
 * Page Planner — generates page list from intent and requirements.
 */
export function planPages(
  intent: Tbge2IntentAnalysis,
  requirements: Tbge2RequirementsAnalysis,
  primaryCta: string,
): Tbge2PagePlan[] {
  const templates = resolvePageTemplatesForIntent(intent.category);
  const pages: Tbge2PagePlan[] = [];

  for (const template of templates) {
    if (template.kind === "pricing" && !requirements.required.includes("pricing")) continue;
    if (template.kind === "blog" && !requirements.required.includes("blog")) continue;
    if (template.kind === "gallery" && !requirements.required.includes("gallery")) continue;

    pages.push({
      id: `page-${template.kind}`,
      kind: template.kind,
      name: template.name,
      path: template.path,
      purpose: template.purpose,
      primaryCta: template.kind === "home" ? primaryCta : undefined,
      inNavigation: template.inNavigation,
      seoPriority: template.seoPriority,
    });
  }

  return pages;
}
