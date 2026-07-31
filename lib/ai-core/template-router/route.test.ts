import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeRoutingIndustryId,
  resolveStructureTemplateIdForIndustry,
} from "@/lib/website/builder/industry-structure-routing";
import {
  isEditorialLayoutIndustry,
  resolveIndustryLayoutFamily,
  resolveVisualThemePresetForIndustry,
} from "@/lib/website/builder/industry-layout-policy";
import { resolveStructureTemplateForIndustry } from "@/lib/website/builder/structure-templates";

describe("EDS-001 industry structure routing", () => {
  it("maps furniture to ecommerce-atelier structure package", () => {
    assert.equal(normalizeRoutingIndustryId("Furniture Showroom"), "furniture");
    assert.equal(
      resolveStructureTemplateIdForIndustry("furniture"),
      "ecommerce-atelier",
    );
    const structure = resolveStructureTemplateForIndustry("furniture");
    assert.equal(structure.id, "ecommerce-atelier");
    assert.equal(structure.templateIntelligenceId, "ti-ecommerce-atelier");
  });

  it("does not treat furniture as generic retail store", () => {
    assert.equal(normalizeRoutingIndustryId("home-furniture-store"), "furniture");
  });

  it("uses commerce-grid layout family for furniture", () => {
    assert.equal(resolveIndustryLayoutFamily("furniture"), "commerce-grid");
    assert.equal(isEditorialLayoutIndustry("furniture"), false);
  });

  it("selects luxury visual tokens for premium furniture without editorial theme", () => {
    const preset = resolveVisualThemePresetForIndustry(
      "furniture",
      "Furniture showroom premium luxury",
    );
    assert.equal(preset, "luxury");
    assert.notEqual(preset, "editorial");
  });

  it("allows editorial visual theme only for editorial industries", () => {
    assert.equal(
      resolveVisualThemePresetForIndustry("blog", "editorial magazine"),
      "editorial",
    );
    assert.equal(
      resolveVisualThemePresetForIndustry(
        "furniture",
        "editorial magazine premium",
      ),
      "luxury",
    );
  });

  it("maps tourism to travel-horizon", () => {
    assert.equal(
      resolveStructureTemplateIdForIndustry("tourism"),
      "travel-horizon",
    );
  });
});
