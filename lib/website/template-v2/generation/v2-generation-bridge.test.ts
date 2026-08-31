import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FLAGSHIP_V2_PACKAGE_IDS,
  projectContainsThemeComponents,
  resolveGenerationTemplatePackageId,
  resolvePostGenerationTemplatePackageId,
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
  it("does not route visual skin to file-generation template resolution", () => {
    assert.equal(
      resolveGenerationTemplatePackageId({
        visualSkinId: "sovereign",
      }),
      null,
    );
    assert.equal(
      resolvePostGenerationTemplatePackageId({
        visualSkinId: "sovereign",
      }),
      "saas-enterprise",
    );
    assert.equal(
      resolvePostGenerationTemplatePackageId({
        visualSkinId: "prestige",
      }),
      "corporate-business",
    );
  });

  it("treats visual skin V2 packages as v2 during generation", async () => {
    assert.equal(await shouldUseV2StructureDuringGeneration("saas-enterprise"), true);
    assert.equal(await shouldUseV2StructureDuringGeneration("corporate-business"), true);
  });

  it("resolves removed structure ids to internal generation fallback", () => {
    assert.equal(
      resolveGenerationTemplatePackageId({
        websiteStructureTemplateId: "ai-startup-signal",
      }),
      "_generation-default",
    );
    assert.equal(
      resolveGenerationTemplatePackageId({
        websiteStructureTemplateId: "saas-enterprise",
      }),
      "_generation-default",
    );
    assert.equal(
      resolveGenerationTemplatePackageId({
        templateId: "modern-business",
      }),
      "_generation-default",
    );
  });

  it("has no flagship V2 packages while catalog is empty", () => {
    assert.deepEqual([...FLAGSHIP_V2_PACKAGE_IDS], []);
  });

  it("does not use V2 structure path for legacy ids without installed packages", async () => {
    assert.equal(await shouldUseV2StructureDuringGeneration("modern-business"), false);
    assert.equal(await shouldUseV2StructureDuringGeneration("_generation-default"), false);
  });

  it("strips Theme* scaffold files", () => {
    const stripped = stripLegacyThemeScaffoldFiles(baseProject().files ?? []);
    assert.equal(stripped.some((f) => f.path.includes("ThemeBold")), false);
    assert.equal(stripped.some((f) => f.path === "lib/site-images.ts"), true);
    assert.equal(projectContainsThemeComponents(stripped), false);
  });
});
