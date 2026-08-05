import { resolveTbgeProductAdapter } from "@/lib/tbge/adapters/registry";
import { buildGenerationSpecFromDraft } from "@/lib/tbge/planning/build-spec";
import type { PlanDraft } from "@/lib/tbge/planning/plan-draft";
import { lockSpec } from "@/lib/tbge/spec/lock";
import type { GenerationSpec, TbgeGenerationProfile, TbgeRunMode } from "@/lib/tbge/spec/types";
import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";

export function masterPlanToPlanDraft(plan: MasterPlan): PlanDraft {
  return {
    business: {
      name: plan.business.name,
      industry: plan.business.industry,
      industryId: plan.business.industryId,
      audience: plan.audience,
      goals: plan.goals,
      tone: plan.brand.tone,
      offer: plan.business.offer ?? plan.goals[0] ?? "",
      geography: plan.localization.country,
    },
    locale: {
      language: plan.localization.language,
      dir: plan.localization.direction,
      rtl: plan.localization.direction === "rtl",
      htmlLang: plan.localization.htmlLang,
    },
    structure: {
      kind: "website",
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
      navigation: {
        items: plan.navigation.map((n) => ({ label: n.label, href: n.href })),
      },
      footerSections: ["Contact", "Legal"],
    },
    design: {
      templateId: plan.business.industryId,
      templateIntelligenceId: plan.business.industryId,
      tokens: {
        primary: "#111827",
        secondary: "#6B7280",
        accent: "#D4AF37",
        background: "#FFFFFF",
        foreground: "#111827",
      },
      componentPalette: plan.componentsNeeded.map((c) => c.componentPath),
      layoutProfile: plan.websiteType,
      imageStyle: plan.mediaStrategy.imageStyle,
      headingFont: "Inter",
      bodyFont: "Inter",
    },
    capabilities: {
      auth: plan.businessFeatures.includes("authentication"),
      database: { provider: "none" },
      dashboard: plan.businessFeatures.includes("dashboard"),
      ecommerce: plan.businessFeatures.includes("ecommerce"),
      saas: plan.websiteType === "saas",
    },
  };
}

export function buildLockedSpecFromMasterPlan(input: {
  plan: MasterPlan;
  prompt: string;
  profile: TbgeGenerationProfile;
  mode: TbgeRunMode;
}): GenerationSpec {
  const adapter = resolveTbgeProductAdapter("website-builder");
  if (!adapter) {
    throw new Error("No TBGE adapter for website-builder");
  }

  const draft = masterPlanToPlanDraft(input.plan);
  const spec = buildGenerationSpecFromDraft({
    draft,
    adapter,
    productId: "website-builder",
    profile: input.profile,
    mode: input.mode,
    prompt: input.prompt,
    plannerModel: "master-plan-engine",
  });

  const extended = adapter.extendSpec?.(spec) ?? spec;
  const locked = lockSpec(extended, input.prompt);
  return locked.spec;
}
