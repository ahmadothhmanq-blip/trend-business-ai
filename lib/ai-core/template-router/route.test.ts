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
  it("maps furniture to modern-business structure package", () => {
    assert.equal(normalizeRoutingIndustryId("Furniture Showroom"), "furniture");
    assert.equal(
      resolveStructureTemplateIdForIndustry("furniture"),
      "modern-business",
    );
    const structure = resolveStructureTemplateForIndustry("furniture");
    assert.equal(structure.id, "modern-business");
    assert.equal(structure.templateIntelligenceId, "ti-corporate-trust");
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

  it("maps tourism to modern-business", () => {
    assert.equal(
      resolveStructureTemplateIdForIndustry("tourism"),
      "modern-business",
    );
  });

  it("maps technology to ai-startup-signal", () => {
    assert.equal(
      resolveStructureTemplateIdForIndustry("technology"),
      "ai-startup-signal",
    );
    const structure = resolveStructureTemplateForIndustry("technology");
    assert.equal(structure.id, "ai-startup-signal");
    assert.equal(structure.templateIntelligenceId, "ti-ai-company-signal");
  });
});
