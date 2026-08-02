import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DESIGN_INTELLIGENCE_ENGINE_ID,
  DESIGN_INTELLIGENCE_SPEC_KEY,
  DESIGN_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/design-intelligence/die-types";
import {
  runDesignIntelligenceEngine,
  persistDesignIntelligenceOnBrief,
  getDesignIntelligenceTraceFromBrief,
  getDesignSystemSpecFromBrief,
} from "@/lib/ai-core/design-intelligence/die-engine";
import { resolveDesignPolicy } from "@/lib/ai-core/design-intelligence/policies";
import {
  validateDesignIntelligence,
  applyDesignPolicyCorrections,
  resetDesignValidationTraceCounter,
} from "@/lib/ai-core/design-intelligence/validate-design";
import { buildDesignSystemSpec } from "@/lib/ai-core/design-intelligence/build-spec";
import {
  getDesignKnowledgeEntry,
  DESIGN_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/design-intelligence/knowledge-base/catalog";
import { analyzeDesignIntelligence } from "@/lib/ai-core/design-intelligence/analyze";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import type { CoreBrief } from "@/lib/ai-core/layers/types";

const furniturePlan: MasterWebsitePlan = {
  id: "test-plan",
  version: "1",
  createdAt: new Date().toISOString(),
  promptHash: "test",
  industry: "furniture",
  industryLabel: "Furniture",
  businessType: "Showroom",
  style: "Luxury",
  audience: "Homeowners",
  language: "en",
  tone: "luxury",
  template: "ti-ecommerce-atelier",
  theme: "luxury",
  layout: "commerce-grid",
  hero: "Premium furniture",
  navigation: "standard",
  colorPalette: {
    primary: "#2c1810",
    secondary: "#4a3728",
    accent: "#c9a96e",
    background: "#faf8f5",
    foreground: "#1a1410",
    surface: "#f0ebe3",
  },
  typography: { display: "Playfair Display", heading: "Playfair Display", body: "Inter" },
  imageStyle: "luxury",
  imageKeywords: ["luxury sofa", "living room"],
  sections: [
    { key: "hero", label: "Hero" },
    { key: "collections", label: "Collections" },
    { key: "contact", label: "Contact" },
  ],
  ctaStyle: "luxury",
  ctaPrimary: "Browse collections",
  features: [],
  components: ["Hero", "Grid", "Footer"],
  locked: {
    industry: true,
    template: true,
    theme: true,
    layout: true,
    sections: true,
    images: true,
    hero: true,
    navigation: true,
  },
  sources: {
    industry: "test",
    template: "test",
    theme: "test",
    design: "test",
    route: "test",
    reasoningChain: [],
    validation: "passed",
  },
};

const furnitureWebsitePlan: WebsiteGenerationPlan = {
  version: "1",
  industryId: "furniture",
  industryLabel: "Furniture",
  routingIndustryId: "furniture",
  layoutFamily: "commerce-grid",
  structureTemplateId: "modern-business",
  layoutTemplateIntelligenceId: "ti-ecommerce-atelier",
  layoutStructure: "commerce-grid",
  pageTopology: "single-page",
  visualThemePresetId: "luxury",
  visualThemeTemplateIntelligenceId: "ti-luxury",
  premiumTemplateId: "premium-furniture",
  sections: ["Hero", "Collections", "Contact"],
  components: ["Hero", "Grid", "Footer"],
  hero: "Premium furniture",
  imageKeywords: ["luxury sofa"],
  imagePolicy: {
    routingIndustryId: "furniture",
    forbiddenSubjects: ["fashion"],
    photographyStyle: ["luxury showroom"],
  },
  businessRules: {
    primaryCta: "Browse collections",
    recommendedSections: ["Hero", "Collections"],
    confidence: 0.9,
    subcategory: "Showroom",
  },
  route: {
    version: "1",
    industryId: "furniture",
    structureTemplateId: "modern-business",
    layoutTemplateIntelligenceId: "ti-ecommerce-atelier",
    visualThemePresetId: "luxury",
    visualThemeTemplateIntelligenceId: "ti-luxury",
    premiumTemplateId: "premium-furniture",
    layoutFamily: "commerce-grid",
    pageTopology: "single-page",
    reason: "furniture commerce routing",
    confidence: 0.9,
    reasoningChain: ["furniture → commerce-grid"],
  },
  reasoningChain: ["furniture → commerce-grid"],
  confidence: 0.9,
};

describe("EDS-004 Design Intelligence Engine", () => {
  it("exposes DKB catalog with industry policies", () => {
    assert.ok(DESIGN_KNOWLEDGE_ENTRIES.length >= 5);
    const furniture = getDesignKnowledgeEntry("furniture");
    assert.equal(furniture.id, "design-policy-furniture");
    assert.ok(furniture.forbiddenLayoutVariationIds.includes("editorial"));
    assert.equal(furniture.defaultLayoutVariationId, "product-showcase");
  });

  it("resolves design policy from DKB + master plan + WebsiteGenerationPlan", () => {
    const lookup = resolveDesignPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    });
    assert.equal(lookup.entryId, "design-policy-furniture");
    assert.equal(lookup.value.layoutFamily, "commerce-grid");
    assert.equal(lookup.value.lockedColors?.primary, "#2c1810");
    assert.equal(lookup.value.lockedTypography?.display, "Playfair Display");
    assert.ok(lookup.resolvedFrom.some((r) => r.startsWith("dkb:")));
  });

  it("validates forbidden editorial layout for non-editorial industries", () => {
    resetDesignValidationTraceCounter();
    const policy = resolveDesignPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    }).value;

    const badIntel: DesignIntelligenceBrief = {
      ...analyzeDesignIntelligence({ industryId: "furniture" }),
      layoutVariationId: "editorial",
      heroTreatment: "editorial-split",
      sectionLayout: "editorial-stack",
      premiumStyleId: "luxury",
    };

    const validation = validateDesignIntelligence(
      badIntel,
      policy,
      furnitureWebsitePlan,
    );
    assert.equal(validation.valid, false);
    assert.ok(
      validation.errors.some((e) => e.includes("forbidden") || e.includes("Editorial")),
    );
    assert.ok(validation.trace.some((t) => t.knowledgeEntryId === policy.knowledgeEntryId));
  });

  it("applies DKB corrections for forbidden layout variations", () => {
    const policy = resolveDesignPolicy({ industryId: "furniture" }).value;
    const badIntel: DesignIntelligenceBrief = {
      ...analyzeDesignIntelligence({ industryId: "furniture" }),
      layoutVariationId: "editorial",
      premiumStyleId: "dashboard" as DesignIntelligenceBrief["premiumStyleId"],
    };
    const corrected = applyDesignPolicyCorrections(badIntel, policy);
    assert.equal(corrected.layoutVariationId, policy.defaultLayoutVariationId);
    assert.equal(corrected.premiumStyleId, policy.defaultPremiumStyleId);
  });

  it("builds DesignSystemSpec with locked colors and accessibility policies", () => {
    const policy = resolveDesignPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
    }).value;
    const intelligence = analyzeDesignIntelligence({
      industryId: "furniture",
      preferredStyle: "luxury",
    });
    const spec = buildDesignSystemSpec({ intelligence, policy });
    assert.equal(spec.version, "1");
    assert.equal(spec.colorSystem.primary, "#2c1810");
    assert.equal(spec.typographySystem.displayFont, "Playfair Display");
    assert.equal(spec.accessibility.minContrastRatio, 4.5);
    assert.ok(spec.accessibility.policies.length > 0);
    assert.equal(spec.responsive.strategy, "mobile-first");
  });

  it("runs full DIE pipeline with structured trace", () => {
    const result = runDesignIntelligenceEngine({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
      preferredStyle: "luxury",
    });

    assert.equal(result.trace.engineId, DESIGN_INTELLIGENCE_ENGINE_ID);
    assert.ok(result.trace.entries.length >= 4);
    assert.ok(result.trace.phases.includes("policy-resolve"));
    assert.ok(result.trace.phases.includes("spec-lock"));
    assert.equal(result.spec.industryId, "furniture");
    assert.ok(
      !result.policy.forbiddenLayoutVariationIds.includes(
        result.spec.layoutVariationId,
      ),
    );
    assert.equal(result.spec.colorSystem.primary, "#2c1810");
  });

  it("persists trace and spec on brief metadata", () => {
    const result = runDesignIntelligenceEngine({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    });
    const brief: CoreBrief = {
      prompt: "Luxury furniture showroom",
      productId: "website",
      metadata: {},
    };
    const updated = persistDesignIntelligenceOnBrief(brief, result);
    assert.ok(updated.metadata?.[DESIGN_INTELLIGENCE_TRACE_KEY]);
    assert.ok(updated.metadata?.[DESIGN_INTELLIGENCE_SPEC_KEY]);
    assert.equal(
      getDesignIntelligenceTraceFromBrief(updated)?.engineId,
      DESIGN_INTELLIGENCE_ENGINE_ID,
    );
    assert.equal(
      getDesignSystemSpecFromBrief(updated)?.industryId,
      "furniture",
    );
  });
});
