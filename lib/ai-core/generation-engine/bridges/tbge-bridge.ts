import type { Tbge2PlanningPlan } from "@/lib/ai-core/generation-engine/core/types";

/**
 * Bridge to TBGE v1 — maps TBGE2 plan to PlanDraft-compatible metadata.
 * Does not modify lib/tbge.
 */
export function bridgeToTbgePlanDraft(plan: Tbge2PlanningPlan) {
  return {
    business: {
      name: plan.business.businessName ?? "Business",
      industry: plan.business.industry,
      industryId: plan.business.industryId,
      audience: plan.business.audience,
      goals: plan.business.goals,
      tone: plan.content.tone,
      offer: plan.business.offer ?? plan.business.goals[0] ?? "",
      geography: plan.business.country,
    },
    locale: {
      language: plan.business.language,
      dir: plan.business.language.toLowerCase().includes("arabic") ? "rtl" as const : "ltr" as const,
      rtl: plan.business.language.toLowerCase().includes("arabic"),
      htmlLang: plan.business.language.toLowerCase().slice(0, 2),
    },
    structure: {
      kind: "website" as const,
      pages: plan.pages.map((page) => ({
        name: page.name,
        path: page.path,
        purpose: page.purpose,
        sections: plan.sections
          .filter((s) => s.pageId === page.id)
          .sort((a, b) => a.order - b.order)
          .map((s) => s.label),
        primaryCta: page.primaryCta,
      })),
      navigation: { items: plan.website.navigation },
      footerSections: ["Contact", "Legal"],
    },
    capabilities: {
      auth: plan.requirements.required.includes("authentication"),
      database: { provider: "none" as const },
      dashboard: plan.requirements.required.includes("dashboard"),
      ecommerce: plan.requirements.required.includes("ecommerce"),
      saas: plan.intent.category === "saas",
    },
  };
}
