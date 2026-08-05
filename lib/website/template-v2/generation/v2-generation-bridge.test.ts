import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildStaticPreviewHtml } from "@/lib/website/build-static-preview.server";
import {
  applyV2StructureDuringGeneration,
  FLAGSHIP_V2_PACKAGE_IDS,
  projectContainsThemeComponents,
  projectUsesV2FlagshipComponents,
  resolveGenerationTemplatePackageId,
  shouldUseV2StructureDuringGeneration,
  stripLegacyThemeScaffoldFiles,
} from "@/lib/website/template-v2/generation/v2-generation-bridge";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

function baseProject(
  overrides: Partial<GeneratedWebsiteProject> = {},
): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Nexus Command",
    description: "Enterprise revenue platform",
    pages: ["home"],
    sections: [],
    colorPalette: [],
    typography: [],
    components: [],
    content: ["Scale revenue operations with confidence."],
    seo: [],
    roadmap: [],
    files: [
      {
        path: "app/page.tsx",
        content: `import { ThemeBoldHero } from "@/components/themes/bold/ThemeBoldHero";
export default function Page() { return <ThemeBoldHero />; }`,
        language: "tsx",
      },
      {
        path: "components/themes/bold/ThemeBoldHero.tsx",
        content: "export function ThemeBoldHero() { return null; }",
        language: "tsx",
      },
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
      {
        path: "app/globals.css",
        content: "@tailwind base;",
        language: "css",
      },
    ],
    businessProfile: {
      projectName: "Nexus Command",
      industry: "SaaS",
      targetAudience: "Enterprise GTM",
      businessGoals: ["Scale revenue"],
      offer: "Revenue platform",
      tone: "professional",
      geography: "Global",
      competitors: [],
      kpis: [],
      summary: "Enterprise GTM platform",
      requiredSections: ["hero", "pricing"],
    },
    settings: {},
    ...overrides,
  };
}

describe("v2-generation-bridge", () => {
  it("resolves structure package id from generation input", () => {
    assert.equal(
      resolveGenerationTemplatePackageId({
        websiteStructureTemplateId: "saas-enterprise",
      }),
      "saas-enterprise",
    );
    assert.equal(
      resolveGenerationTemplatePackageId({
        templateId: "modern-business",
      }),
      "corporate-business",
    );
  });

  it("detects V2 architecture for flagship packages", async () => {
    for (const id of FLAGSHIP_V2_PACKAGE_IDS) {
      assert.equal(await shouldUseV2StructureDuringGeneration(id), true);
    }
    assert.equal(await shouldUseV2StructureDuringGeneration("modern-business"), false);
  });

  it("strips Theme* scaffold files", () => {
    const stripped = stripLegacyThemeScaffoldFiles(baseProject().files ?? []);
    assert.equal(stripped.some((f) => f.path.includes("ThemeBold")), false);
    assert.equal(stripped.some((f) => f.path === "lib/site-images.ts"), true);
  });

  for (const packageId of FLAGSHIP_V2_PACKAGE_IDS) {
    it(`applies ${packageId} during generation without Theme* components`, async () => {
      const applied = await applyV2StructureDuringGeneration({
        project: baseProject({ title: `${packageId} QA` }),
        templatePackageId: packageId,
        language: "English",
      });

      const settings = applied.settings as Record<string, unknown>;
      assert.equal(settings.templateArchitectureVersion, "v2");
      assert.equal(settings.templatePackageId, packageId);
      assert.equal(settings.websiteStructureTemplateId, packageId);
      assert.ok(typeof settings.templatePresentationHash === "string");
      assert.ok((settings.templatePresentationHash as string).length > 0);

      assert.equal(projectContainsThemeComponents(applied.files ?? []), false);
      assert.equal(projectUsesV2FlagshipComponents(applied.files ?? [], packageId), true);

      const html = buildStaticPreviewHtml({
        title: applied.title,
        description: applied.description,
        pages: applied.pages,
        sections: applied.sections,
        colorPalette: applied.colorPalette,
        typography: applied.typography,
        content: applied.content,
        components: applied.components,
        files: applied.files,
        templateArchitectureVersion: "v2",
        templatePackageId: packageId,
        settings,
        language: "English",
      });

      assert.ok(html.includes('data-v2-render="v2-files"'));
      assert.ok(html.includes(`data-v2-package="${packageId}"`));
      assert.ok(!html.includes("ThemeBold"));
      assert.ok(!html.includes('data-ti-render="v5"'));
    });
  }
});
