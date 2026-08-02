import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WEBSITE_STRUCTURE_TEMPLATES } from "@/lib/website/builder/template-package-index";
import {
  extractAllowedComponentsFromRuntimeModel,
  isLegacyMarketplaceStructureTemplate,
  mapPackageManifestToStructureTemplate,
  toStructureTemplateChoice,
} from "@/lib/website/builder/template-catalog";
import {
  getWebsiteStructureTemplate,
  resolveStructureTemplateForIndustry,
} from "@/lib/website/builder/structure-templates";
import { resolveBuilderTemplateRuntimeModel } from "@/lib/website/builder/template-runtime.server";
import {
  STRUCTURE_TEMPLATE_INTELLIGENCE_MAP,
  resolveStructureTemplateIntelligenceId,
} from "@/lib/website/builder/template-package-ti-mapping";

describe("builder template catalog migration", () => {
  it("maps installed package manifests to structure templates", () => {
    const template = getWebsiteStructureTemplate("modern-business");
    assert.ok(template);
    assert.equal(template?.id, "modern-business");
    assert.equal(template?.label, "Corporate Command");
    assert.equal(template?.industry, "corporate");
    assert.equal(template?.marketplaceTemplateId, "");
    assert.equal(template?.premiumTemplateId, "modern-business");
    assert.ok(template?.sections.includes("header"));
    assert.ok(template?.sections.includes("main"));
    assert.ok(template?.sections.includes("footer"));
  });

  it("indexes both premium installed template packages", () => {
    assert.equal(WEBSITE_STRUCTURE_TEMPLATES.length, 2);
    const ids = WEBSITE_STRUCTURE_TEMPLATES.map((template) => template.id);
    assert.deepEqual(new Set(ids), new Set(["modern-business", "ai-startup-signal"]));
  });

  it("resolves installed packages from the sync structure index", () => {
    const template = getWebsiteStructureTemplate("modern-business");

    assert.ok(template);
    assert.equal(template?.id, "modern-business");
  });

  it("prefers installed template packages over the internal generation fallback", () => {
    const template = resolveStructureTemplateForIndustry("corporate");

    assert.equal(template.id, "modern-business");
  });

  it("treats installed packages as non-legacy marketplace templates", () => {
    const template = getWebsiteStructureTemplate("modern-business");
    assert.ok(template);
    const choice = toStructureTemplateChoice(template, ["hero", "features"]);

    assert.equal(choice.templatePackageId, "modern-business");
    assert.equal(isLegacyMarketplaceStructureTemplate(choice), false);
  });

  it("treats marketplace-backed templates as legacy", () => {
    assert.equal(
      isLegacyMarketplaceStructureTemplate({
        id: "restaurant",
        marketplaceTemplateId: "mp-restaurant",
      }),
      true,
    );
    assert.equal(
      isLegacyMarketplaceStructureTemplate({
        id: "_generation-default",
        marketplaceTemplateId: "",
      }),
      true,
    );
  });

  it("maps each installed package to a distinct Template Intelligence id", () => {
    const tiIds = WEBSITE_STRUCTURE_TEMPLATES.map(
      (template) => template.templateIntelligenceId,
    );
    assert.equal(new Set(tiIds).size, WEBSITE_STRUCTURE_TEMPLATES.length);
    assert.equal(
      resolveStructureTemplateIntelligenceId("modern-business"),
      "ti-corporate-trust",
    );
    assert.equal(
      resolveStructureTemplateIntelligenceId("ai-startup-signal"),
      "ti-ai-company-signal",
    );
    assert.equal(
      STRUCTURE_TEMPLATE_INTELLIGENCE_MAP["modern-business"],
      "ti-corporate-trust",
    );
    assert.equal(
      STRUCTURE_TEMPLATE_INTELLIGENCE_MAP["ai-startup-signal"],
      "ti-ai-company-signal",
    );
  });

  it("resolves every premium package from the sync structure index", () => {
    for (const template of WEBSITE_STRUCTURE_TEMPLATES) {
      const resolved = getWebsiteStructureTemplate(template.id);
      assert.ok(resolved, `missing template ${template.id}`);
      assert.equal(resolved?.id, template.id);
    }
  });

  it("extracts allowed component types from the runtime model main region", async () => {
    const result = await resolveBuilderTemplateRuntimeModel("modern-business");
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const components = extractAllowedComponentsFromRuntimeModel(result.model);
    assert.ok(components.length > 0);
    assert.ok(components.includes("hero"));
  });
});
