import type { MasterPlan, MasterPlanSection } from "@/lib/ai-core/generation-engine/master-plan/types";
import type { Tbge2SectionType } from "@/lib/ai-core/generation-engine/core/types";

export type AwqeImprovedPlan = {
  sections: MasterPlanSection[];
  appliedImprovements: string[];
};

const TRUST_SECTION: Tbge2SectionType = "trust-badges";
const TESTIMONIALS: Tbge2SectionType = "testimonials";
const FAQ: Tbge2SectionType = "faq";

function cloneSections(sections: MasterPlanSection[]): MasterPlanSection[] {
  return sections.map((s) => ({ ...s }));
}

function findHomePageId(plan: MasterPlan): string {
  return plan.pages.find((p) => p.kind === "home")?.id ?? plan.pages[0]!.id;
}

function insertSection(
  sections: MasterPlanSection[],
  pageId: string,
  type: Tbge2SectionType,
  label: string,
  beforeType?: Tbge2SectionType,
): MasterPlanSection | null {
  if (sections.some((s) => s.pageId === pageId && s.type === type)) return null;

  const pageSections = sections
    .filter((s) => s.pageId === pageId)
    .sort((a, b) => a.order - b.order);

  let order = pageSections.length;
  if (beforeType) {
    const anchor = pageSections.find((s) => s.type === beforeType);
    if (anchor) order = anchor.order;
  }

  const id = `awqe-section-${type}-${pageId}`;
  const componentPaths: Record<string, string> = {
    testimonials: "components/sections/testimonials-carousel.tsx",
    "trust-badges": "components/sections/trust-badges.tsx",
    faq: "components/sections/faq-accordion.tsx",
    cta: "components/sections/cta-banner.tsx",
  };
  const section: MasterPlanSection = {
    id,
    pageId,
    type,
    label,
    order,
    required: false,
    componentId: componentPaths[type] ?? `components/sections/${type}.tsx`,
    contentBlocks: [`block-${id}-headline`, `block-${id}-body`],
  };

  for (const s of sections) {
    if (s.pageId === pageId && s.order >= order) s.order += 1;
  }
  sections.push(section);
  return section;
}

/** Apply deterministic quality improvements to Master Plan sections. */
export function applyQualityImprovements(plan: MasterPlan): AwqeImprovedPlan {
  const sections = cloneSections(plan.sections);
  const applied: string[] = [];
  const homePageId = findHomePageId(plan);

  const hero = sections.find((s) => s.pageId === homePageId && s.type === "hero");
  if (hero) {
    hero.required = true;
    if (hero.order !== 0) {
      for (const s of sections.filter((x) => x.pageId === homePageId)) {
        if (s.id === hero.id) s.order = 0;
        else if (s.order < hero.order) s.order += 1;
      }
      applied.push("Hero moved to first position on home page");
    }
  }

  if (insertSection(sections, homePageId, TESTIMONIALS, "Testimonials", "cta")) {
    applied.push("Added testimonials section before CTA");
  }

  if (
    plan.trustStrategy.trustBadges &&
    insertSection(sections, homePageId, TRUST_SECTION, "Trust Badges", "testimonials")
  ) {
    applied.push("Added trust badges section");
  }

  if (
    (plan.websiteType === "saas" || plan.businessFeatures.includes("faq")) &&
    !sections.some((s) => s.type === FAQ) &&
    plan.pages.find((p) => p.kind === "pricing" || p.kind === "faq")
  ) {
    const faqPage = plan.pages.find((p) => p.kind === "faq") ?? plan.pages.find((p) => p.kind === "pricing");
    if (faqPage && insertSection(sections, faqPage.id, FAQ, "FAQ")) {
      applied.push(`Added FAQ section to ${faqPage.name}`);
    }
  }

  const pricingPage = plan.pages.find((p) => p.kind === "pricing");
  if (pricingPage) {
    const pricingSections = sections
      .filter((s) => s.pageId === pricingPage.id)
      .sort((a, b) => a.order - b.order);
    const pricingIdx = pricingSections.findIndex((s) => s.type === "pricing");
    const faqIdx = pricingSections.findIndex((s) => s.type === "faq");
    if (pricingIdx >= 0 && faqIdx >= 0 && faqIdx < pricingIdx) {
      const faqSection = sections.find((s) => s.pageId === pricingPage.id && s.type === "faq")!;
      const pricingSection = sections.find((s) => s.pageId === pricingPage.id && s.type === "pricing")!;
      const tmp = faqSection.order;
      faqSection.order = pricingSection.order;
      pricingSection.order = tmp;
      applied.push("Reordered pricing before FAQ on pricing page");
    }
  }

  const footer = sections.find((s) => s.type === "footer");
  if (footer) {
    footer.required = true;
    const pageSections = sections.filter((s) => s.pageId === footer.pageId);
    const maxOrder = Math.max(...pageSections.map((s) => s.order));
    if (footer.order !== maxOrder) {
      footer.order = maxOrder + 1;
      applied.push("Footer moved to last position");
    }
    if (!footer.contentBlocks.includes("block-legal-links")) {
      footer.contentBlocks = [...footer.contentBlocks, "block-legal-links"];
      applied.push("Footer enriched with legal links block");
    }
  }

  const ctaSections = sections.filter((s) => s.type === "cta");
  if (ctaSections.length === 1 && hero) {
    insertSection(sections, homePageId, "cta", "Call to Action", "footer");
    applied.push("Added secondary CTA section on home page");
  }

  return { sections, appliedImprovements: applied };
}
