import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { WEBSITE_STRUCTURE_TEMPLATES, WEBSITE_STRUCTURE_TEMPLATE_INDEX } from "@/lib/website/builder/template-package-index";
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

const FLAGSHIP_IDS = ["saas-enterprise", "corporate-business", "restaurant-premium"] as const;

describe("builder template catalog migration", () => {
  it("maps corporate-business manifest to structure template", () => {
    const template = getWebsiteStructureTemplate("corporate-business");
    assert.ok(template);
    assert.equal(template?.id, "corporate-business");
    assert.equal(template?.label, "Corporate Business");
    assert.equal(template?.industry, "corporate");
    assert.equal(template?.marketplaceTemplateId, "");
    assert.equal(template?.premiumTemplateId, "corporate-business");
    assert.ok(template?.sections.includes("header"));
    assert.ok(template?.sections.includes("main"));
    assert.ok(template?.sections.includes("footer"));
  });

  it("indexes all nine premium installed template packages including flagships", () => {
    assert.equal(WEBSITE_STRUCTURE_TEMPLATES.length, 9);
    const ids = WEBSITE_STRUCTURE_TEMPLATES.map((template) => template.id);
    for (const flagshipId of FLAGSHIP_IDS) {
      assert.ok(ids.includes(flagshipId), `missing flagship ${flagshipId}`);
    }
    assert.ok(ids.includes("modern-business"));
    assert.ok(ids.includes("ai-startup-signal"));
    assert.ok(ids.includes("restaurant-signature"));
    assert.ok(ids.includes("real-estate-prestige"));
    assert.ok(ids.includes("medical-premium"));
    assert.ok(ids.includes("creative-portfolio"));
    assert.equal(new Set(ids).size, 9);
  });

  it("resolves installed packages from the sync structure index", () => {
    const template = getWebsiteStructureTemplate("corporate-business");

    assert.ok(template);
    assert.equal(template?.id, "corporate-business");
  });

  it("prefers corporate-business for corporate industry routing", () => {
    const template = resolveStructureTemplateForIndustry("corporate");

    assert.equal(template.id, "corporate-business");
  });

  it("treats installed packages as non-legacy marketplace templates", () => {
    const template = getWebsiteStructureTemplate("corporate-business");
    assert.ok(template);
    const choice = toStructureTemplateChoice(template, ["hero", "features"]);

    assert.equal(choice.templatePackageId, "corporate-business");
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

  it("maps each installed package to a Template Intelligence profile", () => {
    for (const template of WEBSITE_STRUCTURE_TEMPLATES) {
      const tiId = STRUCTURE_TEMPLATE_INTELLIGENCE_MAP[template.id];
      assert.ok(tiId, `missing TI map for "${template.id}"`);
      assert.equal(template.templateIntelligenceId, tiId);
    }

    const flagshipTiIds = FLAGSHIP_IDS.map(
      (id) => STRUCTURE_TEMPLATE_INTELLIGENCE_MAP[id],
    );
    assert.equal(new Set(flagshipTiIds).size, FLAGSHIP_IDS.length);
  });

  it("resolves every premium package from the sync structure index", () => {
    for (const template of WEBSITE_STRUCTURE_TEMPLATES) {
      const resolved = WEBSITE_STRUCTURE_TEMPLATE_INDEX[template.id];
      assert.ok(resolved, `missing template ${template.id}`);
      assert.equal(resolved?.id, template.id);
    }
  });

  it("extracts allowed component types from the runtime model main region", async () => {
    const result = await resolveBuilderTemplateRuntimeModel("corporate-business");
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const components = extractAllowedComponentsFromRuntimeModel(result.model);
    assert.ok(components.length > 0);
    assert.ok(components.includes("hero"));
  });
});
