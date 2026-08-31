import { isSitePlanV1Enabled, isStructureFirstEnabled } from "@/lib/website/generation-flags";
import type { SitePlan } from "@/lib/website/site-plan/types";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

export function shouldUseSitePlanAsStructureSource(): boolean {
  return isSitePlanV1Enabled() && isStructureFirstEnabled();
}

/** Apply SitePlan pages/sections onto strategy — templates/skins must not override. */
export function mergeStrategyWithSitePlan(
  strategy: WebsiteStrategy,
  plan: SitePlan,
): WebsiteStrategy {
  const pages = plan.pages.map((p) => ({
    name: p.name,
    path: p.path,
    purpose: p.purpose ?? "",
    keySections: plan.sections
      .filter((s) => s.pagePath === p.path)
      .map((s) => s.name),
  }));

  const sectionPlan = plan.sections.map((s) => ({
    id: s.id,
    page: pages.find((p) => p.path === s.pagePath)?.name ?? s.pagePath,
    name: s.name,
    goal: s.goal ?? "",
    contentNotes: s.contentNotes ?? "",
  }));

  return {
    ...strategy,
    sitemap: pages.map((p) => p.path),
    pages: pages.length ? pages : strategy.pages,
    sectionPlan: sectionPlan.length ? sectionPlan : strategy.sectionPlan,
    positioning: strategy.positioning || plan.archetypeId,
  };
}
