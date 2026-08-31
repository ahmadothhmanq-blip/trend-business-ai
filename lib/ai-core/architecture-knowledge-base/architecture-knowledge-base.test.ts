import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertKnowledgeBaseIntegrity,
  getAllowedLayoutFamilies,
  getIndustryKnowledge,
  isForbiddenStructureTemplate,
  isLayoutFamilyAllowed,
  normalizeRoutingIndustryId,
  resetKnowledgeRegistryForTests,
  resolveIndustryKnowledge,
  resolveStructureTemplateIdForIndustry,
  resolveVisualThemePresetForIndustry,
  validateKnowledgeBaseIntegrity,
} from "@/lib/ai-core/architecture-knowledge-base";
import { mergeIndustryEntry, buildKnowledgeRegistry } from "@/lib/ai-core/architecture-knowledge-base/registry";
import { ARCHITECTURE_KNOWLEDGE_ENTRIES } from "@/lib/ai-core/architecture-knowledge-base/catalog";
import { validateWebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/validate";
import { buildWebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/build-plan";
import type { UnifiedTemplateRoute } from "@/lib/ai-core/template-router/types";

describe("Architecture Knowledge Base", () => {
  it("passes integrity validation on the default catalog", () => {
    const report = assertKnowledgeBaseIntegrity();
    assert.equal(report.valid, true);
    assert.ok(report.entryCount > 40);
  });

  it("resolves industry aliases and inheritance", () => {
    resetKnowledgeRegistryForTests();
    assert.equal(normalizeRoutingIndustryId("retail"), "ecommerce");
    assert.equal(normalizeRoutingIndustryId("home-furniture-store"), "furniture");

    const cafe = resolveIndustryKnowledge("cafe");
    assert.equal(cafe.value.defaultStructureTemplateId, "_generation-default");
    assert.ok(cafe.inheritanceChain.includes("restaurant"));
    assert.ok(cafe.resolvedFrom.some((r) => r.startsWith("industry:cafe")));
  });

  it("merges overrides through inheritance chain", () => {
    const registry = buildKnowledgeRegistry();
    const dental = registry.byId.get("dental")!;
    const merged = mergeIndustryEntry(dental as never, registry);
    assert.equal(merged.defaultStructureTemplateId, "_generation-default");
    assert.ok(merged.forbiddenPremiumTemplateIds?.includes("ecommerce"));
  });

  it("provides explainable structure routing for furniture", () => {
    const lookup = resolveStructureTemplateIdForIndustry("furniture");
    assert.equal(lookup.value, "_generation-default");
    assert.equal(lookup.entryId, "furniture");
    assert.ok(lookup.resolvedFrom.length > 0);
  });

  it("routes visual theme via style policy without editorial for furniture", () => {
    const theme = resolveVisualThemePresetForIndustry(
      "furniture",
      "premium luxury editorial magazine",
    );
    assert.equal(theme.value, "luxury");
    assert.notEqual(theme.value, "editorial");
  });

  it("detects forbidden structure templates from KB", () => {
    assert.equal(isForbiddenStructureTemplate("furniture", "modern-business"), false);
  });

  it("enforces layout family rules from KB", () => {
    assert.equal(isLayoutFamilyAllowed("furniture", "commerce-grid"), true);
    assert.equal(isLayoutFamilyAllowed("furniture", "editorial-magazine"), false);
    assert.deepEqual(getAllowedLayoutFamilies("law"), [
      "corporate-trust",
      "classic-stack",
    ]);
  });

  it("detects duplicate ids in integrity validation", () => {
    const broken = [...ARCHITECTURE_KNOWLEDGE_ENTRIES];
    broken.push({ ...broken[0] });
    const report = validateKnowledgeBaseIntegrity(broken);
    assert.equal(report.valid, false);
    assert.ok(report.issues.some((i) => i.code === "DUPLICATE_ID"));
  });

  it("detects circular industry inheritance", () => {
    const broken = ARCHITECTURE_KNOWLEDGE_ENTRIES.map((entry) => ({ ...entry }));
    const alpha = broken.find((e) => e.id === "saas")!;
    const beta = broken.find((e) => e.id === "technology")!;
    (alpha as { extends?: string }).extends = "technology";
    (beta as { extends?: string }).extends = "saas";
    const report = validateKnowledgeBaseIntegrity(broken);
    assert.equal(report.valid, false);
    assert.ok(
      report.issues.some((i) => i.code === "INHERITANCE_MERGE_FAILED"),
    );
  });
});

describe("AKB routing and validation consistency", () => {
  const furnitureRoute: UnifiedTemplateRoute = {
    version: "1",
    industryId: "furniture",
    structureTemplateId: "_generation-default",
    layoutTemplateIntelligenceId: "ti-ecommerce-atelier",
    visualThemePresetId: "luxury",
    visualThemeTemplateIntelligenceId: "ti-luxury-noir",
    premiumTemplateId: "ecommerce",
    layoutFamily: "commerce-grid",
    pageTopology: "card-first-masonry",
    reason: "test",
    confidence: 0.9,
    reasoningChain: [],
  };

  const furnitureProfile = {
    industry: "Furniture",
    subcategory: "Showroom",
    audience: ["Homeowners"],
    tone: "Premium",
    visualStyle: ["Luxury"],
    colorPalette: [],
    typography: [],
    photographyStyle: ["Luxury sofa"],
    forbiddenSubjects: ["fashion"],
    heroMessaging: ["Premium furniture"],
    recommendedSections: ["Hero", "Collections", "Living Room", "Contact"],
    primaryCta: "Browse collections",
    navigationStyle: "standard",
    designSystemHints: { mood: "Premium", layoutApproach: "showroom" },
    routingIndustryId: "furniture",
    confidence: 0.9,
    reason: "test",
  };

  const furnitureDetection = {
    industryId: "furniture" as const,
    confidence: 0.9,
    reason: "test",
    source: "analysis" as const,
    profile: getIndustryKnowledge("furniture") as never,
  };

  it("validates routing-consistent furniture plan", () => {
    const plan = buildWebsiteGenerationPlan({
      route: furnitureRoute,
      industryDetection: furnitureDetection,
      businessProfile: furnitureProfile,
      sectionLabels: ["Hero", "Collections", "Living Room", "Contact"],
      components: ["Nav", "Hero", "Grid", "Footer"],
      hero: "Premium furniture",
      imageKeywords: ["Luxury sofa", "Living room"],
    });
    const result = validateWebsiteGenerationPlan(plan);
    assert.equal(result.status, "passed");
    assert.ok(result.trace.every((t) => t.knowledgeEntryId));
  });

  it("rejects editorial layout inconsistent with AKB furniture rules", () => {
    const plan = buildWebsiteGenerationPlan({
      route: { ...furnitureRoute, layoutFamily: "editorial-magazine" },
      industryDetection: furnitureDetection,
      businessProfile: furnitureProfile,
      sectionLabels: ["Hero", "Collections", "Living Room", "Contact"],
      components: ["Nav", "Hero", "Grid", "Footer"],
      hero: "Premium furniture",
      imageKeywords: ["Luxury sofa", "Living room"],
    });
    const invalid = {
      ...plan,
      layoutFamily: "editorial-magazine" as const,
      layoutStructure: "editorial-hero",
      pageTopology: "fullscreen-editorial",
    };
    const result = validateWebsiteGenerationPlan(invalid);
    assert.equal(result.status, "failed");
    assert.ok(
      result.trace.some((t) => t.ruleId === "editorial-layout-guard"),
    );
  });

  it("routing structure matches AKB industry default", () => {
    const akbStructure = resolveStructureTemplateIdForIndustry("furniture").value;
    assert.equal(furnitureRoute.structureTemplateId, akbStructure);
  });
});
