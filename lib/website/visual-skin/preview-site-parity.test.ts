import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { resolveGenerationTemplatePackageId } from "@/lib/website/template-v2/generation/v2-generation-bridge";
import { getVisualSkinV2ApplyPipelineOptions } from "@/lib/website/visual-skin/apply-pipeline-options";
import { buildComponentProps } from "@/lib/website/template-v2/composer/business-bindings";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

describe("preview-site parity — Signal Aura", () => {
  it("keeps generation package id on ai-startup-signal (never _generation-default)", () => {
    assert.equal(
      resolveGenerationTemplatePackageId({
        websiteStructureTemplateId: "ai-startup-signal",
      }),
      "ai-startup-signal",
    );
  });

  it("uses shared visual-skin apply pipeline flags", () => {
    assert.deepEqual(getVisualSkinV2ApplyPipelineOptions(), {
      directPackageId: true,
      forceBlueprintFallback: false,
      skinOnlyOverride: false,
    });
  });

  it("catalog preview HTML matches project apply package + hero identity", async () => {
    const catalogHtml = readFileSync(
      "scripts/benchmark-results/skin-previews/ai-startup-signal-preview.html",
      "utf8",
    );
    assert.ok(catalogHtml.includes('data-v2-package="ai-startup-signal"'));
    assert.ok(catalogHtml.includes("Ship intelligence that scales with your product"));
    assert.ok(catalogHtml.includes("--color-accent: #E8364E") || catalogHtml.includes("#E8364E"));
    assert.ok(catalogHtml.includes("--color-signal: #2EC8E0") || catalogHtml.includes("#2EC8E0"));
    assert.ok(!catalogHtml.includes("Built for scale"));
    assert.ok(!catalogHtml.includes("Glass surfaces, bento rhythm"));

    const project: GeneratedWebsiteProject = {
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
      ],
      businessProfile: {
        projectName: "Northline Systems",
        industry: "technology",
      } as GeneratedWebsiteProject["businessProfile"],
    };

    const applied = await applyStructureTemplateToProject({
      project,
      templatePackageId: "ai-startup-signal",
      language: "English",
    });
    const page =
      applied.project.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="ai-startup-signal"'));
    assert.ok(page.includes("AiStartupSignalHero"));
    assert.ok(page.includes("AiStartupSignalPricing"));

    const heroProps = buildComponentProps({
      componentId: "ai-startup-signal-hero",
      role: "hero",
      packageId: "ai-startup-signal",
      ctx: {
        brandName: "Northline Systems",
        usePackageDefaults: true,
        primaryCta: "Book demo",
      },
    });
    assert.equal(heroProps.brandName, "Northline Systems");
    assert.equal(heroProps.primaryCta, "Book demo");
    assert.equal(heroProps.title, undefined);
  });
});
