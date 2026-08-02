import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { validateWebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/validate";
import { applyArchitectureCorrectionsToBrief } from "@/lib/ai-core/architecture-validation/replan";
import { ArchitectureValidationFailure } from "@/lib/ai-core/architecture-validation/errors";
import type { UnifiedTemplateRoute } from "@/lib/ai-core/template-router/types";
import { buildWebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/build-plan";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";

const furnitureProfile: BusinessIntelligenceProfile = {
  industry: "Furniture",
  subcategory: "Showroom",
  audience: ["Homeowners"],
  tone: "Premium",
  visualStyle: ["Luxury", "Warm"],
  colorPalette: ["Wood"],
  typography: ["Modern"],
  photographyStyle: ["Luxury sofa in living room"],
  forbiddenSubjects: ["fashion", "water"],
  heroMessaging: ["Premium furniture for modern living"],
  recommendedSections: ["Hero", "Collections", "Living Room", "Contact"],
  primaryCta: "Browse collections",
  navigationStyle: "standard",
  designSystemHints: {
    mood: "Warm premium",
    layoutApproach: "showroom catalog",
  },
  routingIndustryId: "furniture",
  confidence: 0.9,
  reason: "Furniture showroom",
};

const furnitureDetection: IndustryDetectionResult = {
  industryId: "furniture",
  confidence: 0.9,
  reason: "Furniture",
  source: "analysis",
  profile: {
    id: "furniture",
    label: "Furniture",
    description: "Furniture",
    keywords: ["furniture"],
    recommendedPages: [],
    requiredSections: ["Hero", "Collections", "Contact"],
    ctaTypes: ["Browse"],
    contentStyle: "warm",
    designStyle: "premium",
    designPreset: "luxury",
    layoutStyle: "commerce-grid",
    industryPattern: "furniture-showroom",
    imageRequirements: [],
    requiredFeatures: [],
    preferredSmartTemplateId: "ecommerce-store",
    preferredPremiumTemplateId: "ecommerce",
  },
};

function baseRoute(overrides: Partial<UnifiedTemplateRoute> = {}): UnifiedTemplateRoute {
  return {
    version: "1",
    industryId: "furniture",
    structureTemplateId: "modern-business",
    layoutTemplateIntelligenceId: "ti-corporate-trust",
    visualThemePresetId: "luxury",
    visualThemeTemplateIntelligenceId: "ti-luxury-noir",
    premiumTemplateId: "ecommerce",
    layoutFamily: "commerce-grid",
    pageTopology: "card-first-masonry",
    reason: "test route",
    confidence: 0.9,
    reasoningChain: ["test"],
    ...overrides,
  };
}

function planFromRoute(
  route: UnifiedTemplateRoute,
  extra?: Partial<WebsiteGenerationPlan>,
): WebsiteGenerationPlan {
  const draft = buildWebsiteGenerationPlan({
    route,
    industryDetection: furnitureDetection,
    businessProfile: furnitureProfile,
    sectionLabels: ["Hero", "Collections", "Living Room", "Contact"],
    components: ["ThemeModernNav", "HeroSplit", "FeatureGrid", "Footer"],
    hero: "Premium furniture",
    imageKeywords: ["Luxury sofa", "Living room interior"],
  });
  return { ...draft, ...extra };
}

describe("architecture validation layer", () => {
  it("passes valid furniture commerce-grid combination", () => {
    const result = validateWebsiteGenerationPlan(planFromRoute(baseRoute()));
    assert.equal(result.status, "passed");
    assert.equal(result.errors.length, 0);
    assert.ok(result.plan);
    assert.ok(result.trace.length > 0);
  });

  it("rejects furniture with editorial layout structure", () => {
    const result = validateWebsiteGenerationPlan(
      planFromRoute(
        baseRoute({
          layoutTemplateIntelligenceId: "ti-luxury-noir",
          layoutFamily: "editorial-magazine",
        }),
        {
          layoutStructure: "editorial-hero",
          pageTopology: "fullscreen-editorial",
          layoutFamily: "editorial-magazine",
        },
      ),
    );
    assert.equal(result.status, "failed");
    assert.ok(
      result.errors.some((e) => e.includes("editorial")),
      `expected editorial error, got: ${result.errors.join("; ")}`,
    );
    assert.ok(result.recommendedCorrections.length > 0);
  });

  it("rejects restaurant with portfolio structure", () => {
    const restaurantDetection: IndustryDetectionResult = {
      ...furnitureDetection,
      industryId: "restaurant",
      profile: { ...furnitureDetection.profile, id: "restaurant", label: "Restaurant" },
    };
    const route = baseRoute({
      industryId: "restaurant",
      structureTemplateId: "ai-startup-signal",
      layoutTemplateIntelligenceId: "ti-ai-company-signal",
      layoutFamily: "editorial-magazine",
      pageTopology: "fullscreen-editorial",
    });
    const plan = buildWebsiteGenerationPlan({
      route,
      industryDetection: restaurantDetection,
      businessProfile: {
        ...furnitureProfile,
        industry: "Restaurant",
        routingIndustryId: "restaurant",
      },
      sectionLabels: ["Hero", "Menu", "Reservations", "Gallery"],
      components: ["Nav", "Hero", "Gallery", "Footer"],
      hero: "Fine dining",
      imageKeywords: ["Restaurant interior", "Chef plating"],
    });
    const result = validateWebsiteGenerationPlan({
      ...plan,
      layoutStructure: "studio-portfolio",
      layoutFamily: "editorial-magazine",
    });
    assert.equal(result.status, "failed");
    assert.ok(
      result.errors.some(
        (e) =>
          e.includes("portfolio") ||
          e.includes("editorial") ||
          e.includes("layout family"),
      ),
    );
  });

  it("rejects law firm with ecommerce structure", () => {
    const lawDetection: IndustryDetectionResult = {
      ...furnitureDetection,
      industryId: "law",
      profile: { ...furnitureDetection.profile, id: "law", label: "Law Firm" },
    };
    const route = baseRoute({
      industryId: "law",
      structureTemplateId: "ai-startup-signal",
      layoutTemplateIntelligenceId: "ti-ai-company-signal",
      layoutFamily: "commerce-grid",
      premiumTemplateId: "ecommerce",
    });
    const plan = buildWebsiteGenerationPlan({
      route,
      industryDetection: lawDetection,
      businessProfile: {
        ...furnitureProfile,
        industry: "Law Firm",
        routingIndustryId: "law",
      },
      sectionLabels: ["Hero", "Practice Areas", "Attorneys", "Contact"],
      components: ["Nav", "Hero", "Grid", "Footer"],
      hero: "Trusted legal counsel",
      imageKeywords: ["Law office", "Legal team"],
    });
    const result = validateWebsiteGenerationPlan(plan);
    assert.equal(result.status, "failed");
    assert.ok(
      result.errors.some(
        (e) =>
          e.includes("ecommerce") ||
          e.includes("incompatible") ||
          e.includes("layout family"),
      ),
    );
  });

  it("applies corrections to brief metadata for re-planning", () => {
    const invalid = validateWebsiteGenerationPlan(
      planFromRoute(
        baseRoute({
          structureTemplateId: "ai-startup-signal",
          layoutTemplateIntelligenceId: "ti-luxury-noir",
        }),
        { layoutStructure: "editorial-hero", layoutFamily: "editorial-magazine" },
      ),
    );
    assert.equal(invalid.status, "failed");
    const brief = applyArchitectureCorrectionsToBrief(
      { prompt: "Furniture", productId: "website-builder", metadata: {} },
      invalid.recommendedCorrections,
    );
    assert.equal(brief.metadata?.websiteStructureTemplateId, "modern-business");
    assert.equal(
      brief.metadata?.templateIntelligenceId,
      "ti-corporate-trust",
    );
    assert.equal(brief.metadata?.architectureReplanAttempt, 1);
  });

  it("returns explainable failure payload", () => {
    const validation = validateWebsiteGenerationPlan(
      planFromRoute(baseRoute({ structureTemplateId: "ai-startup-signal" }), {
        layoutStructure: "legal-trust",
      }),
    );
    const failure = new ArchitectureValidationFailure(validation);
    const payload = failure.toExplainablePayload();
    assert.equal(payload.code, "ARCHITECTURE_VALIDATION_FAILED");
    assert.ok(payload.errors.length > 0);
    assert.ok(payload.trace.length > 0);
    assert.ok(payload.reasoning.length > 0);
  });

  it("maintains backward-compatible WebsiteGenerationPlan contract fields", () => {
    const plan = planFromRoute(baseRoute());
    for (const field of [
      "industryId",
      "layoutFamily",
      "structureTemplateId",
      "layoutTemplateIntelligenceId",
      "visualThemePresetId",
      "premiumTemplateId",
      "sections",
      "components",
      "imageKeywords",
      "route",
    ] as const) {
      assert.ok(field in plan, `missing ${field}`);
    }
    assert.equal(plan.version, "1");
  });

  it("regression: furniture premium luxury must not use editorial topology", () => {
    const result = validateWebsiteGenerationPlan(
      planFromRoute(
        baseRoute({
          pageTopology: "fullscreen-editorial",
          layoutTemplateIntelligenceId: "ti-blog-editorial",
        }),
        {
          layoutStructure: "editorial-blog",
          layoutFamily: "editorial-magazine",
        },
      ),
    );
    assert.equal(result.status, "failed");
    assert.ok(result.trace.some((t) => t.ruleId === "editorial-layout-guard"));
  });

  it("warns on low business confidence without hard failure", () => {
    const lowConfidence = planFromRoute(baseRoute(), {
      businessRules: {
        primaryCta: furnitureProfile.primaryCta,
        secondaryCta: furnitureProfile.secondaryCta,
        recommendedSections: furnitureProfile.recommendedSections,
        confidence: 0.3,
        subcategory: "Showroom",
      },
      confidence: 0.3,
    });
    const result = validateWebsiteGenerationPlan(lowConfidence);
    assert.notEqual(result.status, "failed");
    assert.ok(
      result.warnings.some((w) => w.toLowerCase().includes("confidence")),
    );
  });
});

describe("architecture validation re-planning metadata", () => {
  it("clears unified route on correction for fresh routing", () => {
    const brief = applyArchitectureCorrectionsToBrief(
      {
        prompt: "test",
        productId: "website-builder",
        metadata: { unifiedTemplateRoute: { version: "1" } },
      },
      [
        {
          field: "structureTemplateId",
          currentValue: "ai-startup-signal",
          recommendedValue: "modern-business",
          reason: "test",
        },
      ],
    );
    assert.equal(brief.metadata?.unifiedTemplateRoute, undefined);
  });
});
