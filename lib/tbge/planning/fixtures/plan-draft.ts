/**
 * Golden PlanDraft fixture for TBGE planner tests.
 */

import type { PlanDraft } from "@/lib/tbge/planning/plan-draft";

export function createTestPlanDraft(overrides: Partial<PlanDraft> = {}): PlanDraft {
  const base: PlanDraft = {
    business: {
      name: "Nova Games Studio",
      industry: "Gaming",
      industryId: "business",
      audience: ["Gamers", "Publishers"],
      goals: ["Acquire players", "Showcase portfolio"],
      tone: "Bold",
      offer: "Premium game development services",
    },
    locale: {
      language: "English",
      dir: "ltr",
      rtl: false,
      htmlLang: "en",
    },
    structure: {
      kind: "website",
      pages: [
        {
          name: "Home",
          path: "/",
          purpose: "Introduce the studio",
          sections: ["Hero", "Games", "Contact"],
          primaryCta: "View Games",
        },
        {
          name: "Games",
          path: "/games",
          purpose: "Showcase titles",
          sections: ["Catalog", "Featured"],
          primaryCta: "Play Demo",
        },
      ],
      navigation: {
        items: [
          { label: "Home", href: "/" },
          { label: "Games", href: "/games" },
        ],
      },
      footerSections: ["Contact", "Social"],
    },
    design: {
      templateId: "luxury-business",
      templateIntelligenceId: "luxury-business",
      tokens: {
        primary: "#111827",
        secondary: "#6B7280",
        accent: "#D4AF37",
        background: "#FFFFFF",
        foreground: "#111827",
      },
      componentPalette: [
        "components/sections/hero-split.tsx",
        "components/sections/feature-grid.tsx",
      ],
      layoutProfile: "marketing",
      imageStyle: "cinematic",
      headingFont: "Inter",
      bodyFont: "Inter",
    },
    capabilities: {
      auth: false,
      database: { provider: "none" },
      dashboard: false,
      ecommerce: false,
      saas: false,
    },
  };

  return { ...base, ...overrides };
}

export function createTestPlanDraftJson(overrides: Partial<PlanDraft> = {}): string {
  return JSON.stringify(createTestPlanDraft(overrides));
}
