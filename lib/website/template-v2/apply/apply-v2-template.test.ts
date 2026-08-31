import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { resolveTemplateArchitecture } from "@/lib/website/template-v2/router/resolve-template-architecture";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

const baseProject: GeneratedWebsiteProject = {
  projectKind: "website",
  title: "Northline Systems",
  description: "Enterprise revenue platform",
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
      path: "app/page.tsx",
      content: "export default function Page(){return <main/>}",
      language: "tsx",
    },
    {
      path: "app/globals.css",
      content: ":root { --color-primary: #000; }",
      language: "css",
    },
    {
      path: "app/about/page.tsx",
      content: "export default function About(){return <main>About</main>}",
      language: "tsx",
    },
  ],
};

describe("applyStructureTemplateToProject V2 routing", () => {
  it("detects saas-enterprise as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "saas-enterprise",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects corporate-business as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "corporate-business",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects restaurant-premium as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "restaurant-premium",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects restaurant-signature as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "restaurant-signature",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects real-estate-prestige as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "real-estate-prestige",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects medical-premium as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "medical-premium",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects creative-portfolio as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "creative-portfolio",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects ecommerce-premium as V2 architecture", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "ecommerce-premium",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
  });

  it("detects modern-business as V2 via supersession to corporate-business", async () => {
    const result = await resolveTemplateArchitecture({
      packageId: "modern-business",
      templatesRoot: resolveWbTemplatesRoot(),
    });
    assert.equal(result.architectureVersion, "v2");
    assert.equal(result.packageId, "corporate-business");
  });

  it("applies saas-enterprise via V2 pipeline with independent components", async () => {
    const result = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "saas-enterprise",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="saas-enterprise"'));
    assert.ok(page.includes("SaasEnterpriseNav"));
    assert.ok(page.includes("SaasEnterpriseHero"));
    assert.ok(!page.includes("ThemeBold"));
    assert.ok(!page.includes("ThemeCorporate"));

    const settings = result.project.settings as Record<string, unknown>;
    assert.equal(settings.templateArchitectureVersion, "v2");
    assert.equal(settings.templatePackageId, "saas-enterprise");

    const componentPaths =
      result.project.files
        ?.filter((f) => f.path.startsWith("components/saas-enterprise"))
        .map((f) => f.path) ?? [];
    assert.ok(componentPaths.length >= 8);
  });

  it("applies modern-business via supersession to corporate-business V2", async () => {
    const result = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "modern-business",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="corporate-business"'));
    assert.ok(page.includes("CorporateBusinessNav"));
    assert.ok(page.includes("CorporateBusinessHero"));
    assert.ok(!page.includes("ThemeCorporate"));

    const settings = result.project.settings as Record<string, unknown>;
    assert.equal(settings.templateArchitectureVersion, "v2");
    assert.equal(settings.templatePackageId, "corporate-business");
  });

  it("applies ai-startup-signal (Aura) as standalone V2 flagship", async () => {
    const result = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "ai-startup-signal",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="ai-startup-signal"'));
    assert.ok(page.includes("AiStartupSignalHero"));
    assert.ok(page.includes("AiStartupSignalNav"));
    assert.ok(page.includes("AiStartupSignalPricing"));
    assert.ok(!page.includes("SaasEnterpriseHero"));
    assert.ok(!page.includes("Theme"));

    const globals =
      result.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
    assert.ok(globals.includes("Aura Signal") || globals.includes(".as-"));

    const settings = result.project.settings as Record<string, unknown>;
    assert.equal(settings.templateArchitectureVersion, "v2");
    assert.equal(settings.templatePackageId, "ai-startup-signal");
    assert.ok(
      (result.project.components ?? []).includes("ai-startup-signal-pricing"),
      "expected pricing component in V2 registry",
    );
  });

  it("applies ai-startup-signal with secondary page flows", async () => {
    const result = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "ai-startup-signal",
      language: "English",
    });

    const platform = result.project.files?.find((f) => f.path === "app/platform/page.tsx");
    const pricing = result.project.files?.find((f) => f.path === "app/pricing/page.tsx");
    const customers = result.project.files?.find((f) => f.path === "app/customers/page.tsx");
    assert.ok(platform?.content.includes("AiStartupSignalFeatures"));
    assert.ok(pricing?.content.includes("AiStartupSignalPricing"));
    assert.ok(customers?.content.includes("AiStartupSignalPortfolio"));
  });

  it("applies ai-startup-signal with RTL language profile tokens", async () => {
    const result = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "ai-startup-signal",
      language: "Arabic",
    });

    const layout = result.project.files?.find((f) => f.path === "app/layout.tsx");
    const globals =
      result.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
    const hasRtl =
      layout?.content.includes('dir="rtl"') ||
      layout?.content.includes("dir='rtl'") ||
      globals.includes('[dir="rtl"]');
    assert.ok(hasRtl || result.notes.some((n) => n.includes("RTL")));
    assert.ok(globals.includes("Noto Sans Arabic") || globals.includes("Alexandria"));
  });

  it("preserves secondary routes on V2 apply", async () => {
    const result = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "saas-enterprise",
      language: "English",
    });

    const about = result.project.files?.find((f) => f.path === "app/about/page.tsx");
    assert.ok(about);
    assert.match(about!.content, /About/);
  });

  it("applies restaurant-signature as its own visual-skin V2 package", async () => {
    const result = await applyStructureTemplateToProject({
      project: {
        ...baseProject,
        title: "Maison Verdant",
        description: "Michelin-starred fine dining",
      },
      templatePackageId: "restaurant-signature",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="restaurant-signature"'));
    assert.ok(page.includes("RestaurantSignatureHero") || page.includes("restaurant-signature"));
    assert.ok(!page.includes("ThemeBold"));
    assert.ok(!page.includes("SaasEnterprise"));

    const settings = result.project.settings as Record<string, unknown>;
    assert.equal(settings.templatePackageId, "restaurant-signature");
  });

  it("applies real-estate-prestige as its own visual-skin V2 package", async () => {
    const result = await applyStructureTemplateToProject({
      project: {
        ...baseProject,
        title: "Monolith Estate",
        description: "Ultra-premium luxury real estate",
      },
      templatePackageId: "real-estate-prestige",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="real-estate-prestige"'));
    assert.ok(page.includes("RealEstatePrestigeHero") || page.includes("real-estate-prestige"));
    assert.ok(!page.includes("ThemeCorporate"));
    assert.ok(!page.includes("ThemeLuxury"));

    const settings = result.project.settings as Record<string, unknown>;
    assert.equal(settings.templatePackageId, "real-estate-prestige");
  });

  it("applies medical-premium via V2 with independent components", async () => {
    const result = await applyStructureTemplateToProject({
      project: {
        ...baseProject,
        title: "Aether Medical",
        description: "Private healthcare network",
      },
      templatePackageId: "medical-premium",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="medical-premium"'));
    assert.ok(page.includes("MedicalPremiumTrustHero") || page.includes("MedicalPremium"));
    assert.ok(!page.includes("ThemeMinimal"));
    assert.ok(!page.includes("ThemeCorporate"));

    const globals =
      result.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
    assert.ok(globals.includes("--color-primary:"));

    const componentFiles =
      result.project.files?.filter((f) =>
        f.path.startsWith("components/medical-premium"),
      ) ?? [];
    assert.ok(componentFiles.length >= 10);
  });

  it("applies creative-portfolio as its own visual-skin V2 package", async () => {
    const result = await applyStructureTemplateToProject({
      project: {
        ...baseProject,
        title: "Kinetic Atelier",
        description: "Elite creative studio",
      },
      templatePackageId: "creative-portfolio",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="creative-portfolio"'));
    assert.ok(page.includes("CreativePortfolioHero") || page.includes("creative-portfolio"));
    assert.ok(!page.includes("ThemeCreative"));
    assert.ok(!page.includes("ThemeMinimal"));

    const settings = result.project.settings as Record<string, unknown>;
    assert.equal(settings.templatePackageId, "creative-portfolio");
  });

  it("applies corporate-business via V2 with full flagship sections", async () => {
    const result = await applyStructureTemplateToProject({
      project: {
        ...baseProject,
        title: "Meridian Advisory",
        description: "Executive corporate advisory",
      },
      templatePackageId: "corporate-business",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="corporate-business"'));
    assert.ok(page.includes("CorporateBusinessHero"));
    assert.ok(page.includes("CorporateBusinessFeatures"));
    assert.ok(page.includes("CorporateBusinessAbout"));
    assert.ok(page.includes("CorporateBusinessContact"));

    const globals =
      result.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
    assert.ok(globals.includes("--color-primary:") || globals.includes("Executive Atlas"));

    const componentFiles =
      result.project.files?.filter((f) =>
        f.path.startsWith("components/corporate-business"),
      ) ?? [];
    assert.ok(componentFiles.length >= 10);
  });

  it("applies restaurant-premium via V2 with flagship sections", async () => {
    const result = await applyStructureTemplateToProject({
      project: {
        ...baseProject,
        title: "Ember Table",
        description: "Fine dining experience",
      },
      templatePackageId: "restaurant-premium",
      language: "English",
    });

    const page = result.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="restaurant-premium"'));
    assert.ok(page.includes("RestaurantPremiumHero"));
    assert.ok(page.includes("RestaurantPremiumContact"));

    const globals =
      result.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
    assert.ok(globals.includes("Ember Table") || globals.includes(".rp-"));

    const componentFiles =
      result.project.files?.filter((f) =>
        f.path.startsWith("components/restaurant-premium"),
      ) ?? [];
    assert.ok(componentFiles.length >= 12);
  });

  it("applies restaurant-signature with RTL language profile tokens", async () => {
    const result = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "restaurant-signature",
      language: "Arabic",
    });

    const layout = result.project.files?.find((f) => f.path === "app/layout.tsx");
    const globals =
      result.project.files?.find((f) => f.path === "app/globals.css")?.content ?? "";
    const hasRtl =
      layout?.content.includes('dir="rtl"') ||
      layout?.content.includes("dir='rtl'") ||
      globals.includes('[dir="rtl"]');
    assert.ok(hasRtl || result.notes.some((n) => n.includes("RTL")));
  });
});
