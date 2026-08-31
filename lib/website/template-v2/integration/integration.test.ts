import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyV2StructureDuringGeneration } from "@/lib/website/template-v2/generation/v2-generation-bridge";
import {
  isProductionBlueprintEnabled,
  resolveBlueprintRegionPlan,
  resolveProductionBlueprint,
  runProductionDesignPipeline,
  WB_WEBSITE_BLUEPRINT_SETTING,
} from "@/lib/website/template-v2/integration";
import { composeRegionGridPage } from "@/lib/website/template-v2/composer/region-grid-composer";
import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import path from "node:path";

function baseProject(
  packageId: string,
  overrides: Partial<GeneratedWebsiteProject> = {},
): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Integration Test Co",
    description: "Premium digital presence",
    pages: ["home"],
    sections: [],
    colorPalette: [],
    typography: [],
    components: [],
    content: [],
    seo: [],
    roadmap: [],
    files: [
      {
        path: "app/globals.css",
        content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
        language: "css",
      },
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
    ],
    businessProfile: {
      projectName: "Integration Test Co",
      industry: packageId.replace(/-premium$/, ""),
      targetAudience: "Enterprise",
      businessGoals: ["Grow revenue"],
      offer: "Professional services",
      tone: "professional",
      geography: "Global",
      competitors: [],
      kpis: [],
      summary: "Test project",
      requiredSections: ["hero", "contact"],
    },
    settings: {},
    ...overrides,
  };
}

describe("Production Integration", () => {
  it("runs the full design pipeline for flagship packages", () => {
    const result = runProductionDesignPipeline({
      project: baseProject("saas-enterprise"),
      templatePackageId: "saas-enterprise",
      seed: "integration-saas",
    });

    assert.ok(result.optimizedBlueprint.meta.blueprintId);
    assert.ok(result.directorResult.finalScore > 0);
    assert.equal(result.integrationVersion, "1.0.0");
  });

  it("composes page.tsx from optimized blueprint", async () => {
    const packageId = "corporate-business";
    const pipeline = runProductionDesignPipeline({
      project: baseProject(packageId),
      templatePackageId: packageId,
      seed: "integration-compose",
    });

    const loaded = await loadTemplateV2Package(
      path.join(resolveWbTemplatesRoot(), packageId),
    );
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const plan = resolveBlueprintRegionPlan(
      pipeline.optimizedBlueprint,
      loaded.bundle,
    );
    assert.ok(plan.main.length > 0);
    assert.ok(plan.main[0]!.includes("hero"));

    const page = composeRegionGridPage({
      bundle: loaded.bundle,
      brandName: "Atlas Corp",
      websiteBlueprint: pipeline.optimizedBlueprint,
      blueprintRegionPlan: plan,
    });

    assert.ok(page.includes("data-v2-blueprint"));
    assert.ok(page.includes("data-v2-variant"));
    assert.ok(page.includes("data-v2-section"));
  });

  it("applies V2 structure with blueprint during generation", async () => {
    if (!isProductionBlueprintEnabled()) return;

    const applied = await applyV2StructureDuringGeneration({
      project: baseProject("corporate-business"),
      templatePackageId: "corporate-business",
      language: "English",
    });

    const settings = applied.settings as Record<string, unknown>;
    assert.equal(settings.templateArchitectureVersion, "v2");
    assert.ok(settings[WB_WEBSITE_BLUEPRINT_SETTING]);
    assert.ok(applied.files?.some((f) => f.path === "app/page.tsx"));
    const page = applied.files?.find((f) => f.path === "app/page.tsx")?.content;
    assert.ok(page?.includes("data-v2-package=\"corporate-business\""));
  });

  it("falls back when production blueprint is disabled", () => {
    const prev = process.env.WB_PRODUCTION_BLUEPRINT;
    process.env.WB_PRODUCTION_BLUEPRINT = "0";
    try {
      const result = resolveProductionBlueprint({
        project: baseProject("saas-enterprise"),
        templatePackageId: "saas-enterprise",
      });
      assert.equal(result, null);
    } finally {
      if (prev === undefined) delete process.env.WB_PRODUCTION_BLUEPRINT;
      else process.env.WB_PRODUCTION_BLUEPRINT = prev;
    }
  });

  it("supports RTL blueprint context", () => {
    const result = runProductionDesignPipeline({
      project: baseProject("hotel-resort-premium"),
      templatePackageId: "hotel-resort-premium",
      language: "Arabic",
      seed: "integration-rtl",
    });

    assert.equal(
      result.optimizedBlueprint.accessibilityProfile.rtlSupport,
      true,
    );
  });

  it("merges ai-startup-signal homeFlow with blueprint sections", async () => {
    const packageId = "ai-startup-signal";
    const pipeline = runProductionDesignPipeline({
      project: baseProject(packageId, {
        businessProfile: {
          projectName: "Aura Signal",
          industry: "saas",
          targetAudience: "Startups",
          businessGoals: ["Grow MRR"],
          offer: "AI operations platform",
          tone: "confident",
          geography: "Global",
          competitors: [],
          kpis: [],
          summary: "Signal-grade AI ops",
          requiredSections: ["hero", "pricing", "faq", "contact"],
        },
      }),
      templatePackageId: packageId,
      seed: "integration-aura-homeflow",
    });

    const loaded = await loadTemplateV2Package(
      path.join(resolveWbTemplatesRoot(), packageId),
    );
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const plan = resolveBlueprintRegionPlan(
      pipeline.optimizedBlueprint,
      loaded.bundle,
      { structureFirst: false },
    );

    const expectedMain = loaded.bundle.presentation.homeFlow.regions.main ?? [];
    for (const componentId of expectedMain) {
      assert.ok(
        plan.main.includes(componentId),
        `missing homeFlow main section: ${componentId}`,
      );
    }

    assert.ok(plan.utility.includes("ai-startup-signal-utility-band"));
    assert.ok(plan.overlay.includes("ai-startup-signal-floating-cta"));
  });

  it("keeps full presentation homeFlow for all templates when structure-first is enabled", async () => {
    const packageId = "real-estate-prestige";
    const pipeline = runProductionDesignPipeline({
      project: baseProject(packageId, {
        businessProfile: {
          projectName: "Monolith Demo",
          industry: "professional-services",
          targetAudience: "Clients",
          businessGoals: ["Grow"],
          offer: "Consulting",
          tone: "premium",
          geography: "Global",
          competitors: [],
          kpis: [],
          summary: "Premium services",
          requiredSections: ["hero", "features", "contact"],
        },
      }),
      templatePackageId: packageId,
      seed: "integration-monolith-full-home",
    });

    const loaded = await loadTemplateV2Package(
      path.join(resolveWbTemplatesRoot(), packageId),
    );
    assert.equal(loaded.ok, true);
    if (!loaded.ok) return;

    const plan = resolveBlueprintRegionPlan(
      pipeline.optimizedBlueprint,
      loaded.bundle,
      { structureFirst: true },
    );

    const expectedMain = loaded.bundle.presentation.homeFlow.regions.main ?? [];
    assert.equal(plan.main.length, expectedMain.length);
    for (const componentId of expectedMain) {
      assert.ok(
        plan.main.includes(componentId),
        `missing monolith homeFlow section: ${componentId}`,
      );
    }

    assert.ok(plan.utility.includes("real-estate-prestige-utility-band"));
    assert.ok(plan.overlay.includes("real-estate-prestige-floating-cta"));
  });
});
