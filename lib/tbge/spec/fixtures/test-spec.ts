/**
 * Golden GenerationSpec fixture for TBGE unit tests.
 */

import { GENERATION_SPEC_VERSION, type GenerationSpec } from "@/lib/tbge/spec/types";

export function createTestGenerationSpec(
  overrides: Partial<GenerationSpec> = {},
): GenerationSpec {
  const base: GenerationSpec = {
    specVersion: GENERATION_SPEC_VERSION,
    specId: "spec-test-001",
    promptHash: "abc123prompthash",
    productId: "website-builder",
    profile: "professional",
    mode: "generate",
    locale: { language: "English", dir: "ltr", rtl: false, htmlLang: "en" },
    business: {
      name: "Nova Games Studio",
      industry: "Gaming",
      industryId: "business",
      audience: ["Gamers", "Publishers"],
      goals: ["Acquire players", "Showcase portfolio"],
      tone: "Bold",
      offer: "Premium game development services",
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
      ],
      navigation: {
        items: [
          { label: "Home", href: "/" },
          { label: "Games", href: "/games" },
        ],
      },
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
      componentPalette: ["components/sections/hero-split.tsx"],
    },
    capabilities: {
      auth: false,
      database: { provider: "none" },
      dashboard: false,
      ecommerce: false,
      saas: false,
    },
    fileGraph: [
      {
        path: "package.json",
        generator: "scaffold-static",
        deps: [],
        wave: "static-scaffold",
        priority: 0,
      },
    ],
    provenance: {
      lockedAt: "2026-08-02T00:00:00.000Z",
      promptHash: "abc123prompthash",
    },
  };

  return { ...base, ...overrides };
}
