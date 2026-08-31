import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIVE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATE_INDEX,
} from "@/lib/website/builder/template-package-index";
import {
  isLegacyMarketplaceStructureTemplate,
} from "@/lib/website/builder/template-catalog";
import {
  getWebsiteStructureTemplate,
  resolveStructureTemplateForIndustry,
} from "@/lib/website/builder/structure-templates";
import { STRUCTURE_TEMPLATE_INTELLIGENCE_MAP } from "@/lib/website/builder/template-package-ti-mapping";

describe("builder template catalog migration", () => {
  it("keeps the user-facing catalog empty", () => {
    assert.equal(ACTIVE_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(WEBSITE_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(Object.keys(WEBSITE_STRUCTURE_TEMPLATE_INDEX).length, 0);
  });

  it("does not expose removed templates in the public structure index", () => {
    assert.equal(getWebsiteStructureTemplate("ai-startup-signal"), undefined);
    assert.equal(getWebsiteStructureTemplate("corporate-business"), undefined);
  });

  it("uses internal fallback for industry routing when catalog is empty", () => {
    const template = resolveStructureTemplateForIndustry("corporate");
    assert.equal(template.id, "_generation-default");
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

  it("keeps structure package TI map empty", () => {
    assert.deepEqual(STRUCTURE_TEMPLATE_INTELLIGENCE_MAP, {});
  });
});
