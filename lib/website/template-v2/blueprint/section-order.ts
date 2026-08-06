import { isSectionRelevantForGoal } from "@/lib/website/template-v2/variants/decision/compatibility";
import type { ResolvedBlueprintContext } from "@/lib/website/template-v2/blueprint/defaults";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";
import type { WebsiteGoal } from "@/lib/website/template-v2/variants/decision/types";

const BASE_ORDER: SectionKind[] = [
  "hero",
  "features",
  "about",
  "services",
  "portfolio",
  "pricing",
  "testimonials",
  "cta",
  "contact",
  "footer",
];

/** Goal-optimized section ordering — required sections always included. */
const GOAL_SECTION_ORDER: Partial<Record<WebsiteGoal, SectionKind[]>> = {
  saas: ["hero", "features", "pricing", "testimonials", "about", "cta", "contact", "footer"],
  portfolio: ["hero", "portfolio", "about", "testimonials", "cta", "contact", "footer"],
  booking: ["hero", "services", "testimonials", "about", "cta", "contact", "footer"],
  "lead-generation": ["hero", "features", "testimonials", "services", "cta", "contact", "footer"],
  sales: ["hero", "features", "pricing", "testimonials", "cta", "contact", "footer"],
  ecommerce: ["hero", "features", "pricing", "testimonials", "cta", "contact", "footer"],
  trust: ["hero", "about", "testimonials", "services", "features", "cta", "contact", "footer"],
  "brand-awareness": ["hero", "about", "portfolio", "testimonials", "cta", "contact", "footer"],
};

const ALWAYS_REQUIRED: SectionKind[] = ["hero", "cta", "footer"];

export function resolveSectionOrder(
  ctx: ResolvedBlueprintContext,
): SectionKind[] {
  if (ctx.sectionOrder?.length) {
    return dedupeSections([...ALWAYS_REQUIRED, ...ctx.sectionOrder]);
  }

  const goalOrder = GOAL_SECTION_ORDER[ctx.websiteGoal] ?? BASE_ORDER;
  const filtered = goalOrder.filter(
    (section) =>
      ALWAYS_REQUIRED.includes(section) ||
      isSectionRelevantForGoal(section, ctx.websiteGoal),
  );

  return dedupeSections(filtered);
}

function dedupeSections(sections: SectionKind[]): SectionKind[] {
  const seen = new Set<SectionKind>();
  const result: SectionKind[] = [];
  for (const section of sections) {
    if (!seen.has(section)) {
      seen.add(section);
      result.push(section);
    }
  }
  for (const required of ALWAYS_REQUIRED) {
    if (!seen.has(required)) {
      result.push(required);
    }
  }
  return result;
}

export function resolveSectionDensity(
  ctx: ResolvedBlueprintContext,
  sectionOrder: SectionKind[],
): Partial<Record<SectionKind, import("@/lib/website/template-v2/variants/decision/types").ContentDensity>> {
  const base = ctx.contentDensity;
  const density: Partial<Record<SectionKind, typeof base>> = {};

  for (const section of sectionOrder) {
    if (section === "hero" || section === "cta") {
      density[section] = base === "dense" ? "medium" : base;
    } else if (section === "footer") {
      density[section] = base === "sparse" ? "sparse" : "medium";
    } else if (section === "features" || section === "services" || section === "pricing") {
      density[section] = base === "sparse" ? "medium" : base;
    } else {
      density[section] = base;
    }
  }

  return density;
}
