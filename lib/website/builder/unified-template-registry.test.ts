import assert from "node:assert/strict";

import { describe, it } from "node:test";

import {
  ACTIVE_STRUCTURE_TEMPLATES,
  ALIAS_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATE_INDEX,
  listV2StructureTemplates,
} from "@/lib/website/builder/unified-template-registry";

import { getWebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";

import { resolveStructureTemplateForIndustry } from "@/lib/website/builder/industry-structure-routing";

describe("unified template registry", () => {
  it("exposes an empty user-facing structure catalog", () => {
    assert.equal(ACTIVE_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(ALIAS_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(WEBSITE_STRUCTURE_TEMPLATES.length, 0);
    assert.equal(Object.keys(WEBSITE_STRUCTURE_TEMPLATE_INDEX).length, 0);
    assert.equal(listV2StructureTemplates().length, 0);
  });

  it("does not resolve removed templates from the public index", () => {
    assert.equal(getWebsiteStructureTemplate("ai-startup-signal"), undefined);
    assert.equal(getWebsiteStructureTemplate("corporate-business"), undefined);
    assert.equal(getWebsiteStructureTemplate("ti-luxury-noir"), undefined);
  });

  it("falls back to internal generation routing when the catalog is empty", () => {
    const template = resolveStructureTemplateForIndustry("corporate");
    assert.equal(template.id, "_generation-default");
  });
});
