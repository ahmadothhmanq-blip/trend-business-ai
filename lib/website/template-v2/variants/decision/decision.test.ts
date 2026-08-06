import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decideSectionVariant,
  decideVariantPlan,
  checkVariantCompatibility,
  getVariantDecisionProfile,
  scoreVariant,
  validateDecisionContext,
  validateDecisionEngine,
  validateDecisionPlan,
  VARIANT_DECISION_PROFILES,
  DIVERSITY_CONFIG,
} from "@/lib/website/template-v2/variants/decision";
import {
  getDefaultVariantId,
  listSectionVariants,
  validateVariantRegistry,
} from "@/lib/website/template-v2/variants";

describe("Variant Decision Engine", () => {
  it("has a decision profile for every registered variant", () => {
    const registry = validateVariantRegistry();
    assert.equal(registry.valid, true);
    assert.equal(Object.keys(VARIANT_DECISION_PROFILES).length, 77);
  });

  it("validates the engine end-to-end", () => {
    const result = validateDecisionEngine();
    assert.equal(result.valid, true, result.errors.join("; "));
  });

  it("scores variants deterministically for the same context and seed", () => {
    const ctx = {
      industry: "corporate",
      websiteGoal: "trust" as const,
      targetAudience: "b2b" as const,
      businessModel: "service" as const,
      premiumLevel: "premium" as const,
      seed: "corp-trust-001",
    };

    const a = decideVariantPlan(ctx);
    const b = decideVariantPlan(ctx);
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(a.selections).map(([k, v]) => [k, v?.variantId]),
      ),
      Object.fromEntries(
        Object.entries(b.selections).map(([k, v]) => [k, v?.variantId]),
      ),
    );
  });

  it("does not select randomly — higher-scored compatible variant wins", () => {
    const heroVariants = listSectionVariants("hero");
    const ctx = {
      websiteGoal: "saas" as const,
      targetAudience: "startup" as const,
      businessModel: "product" as const,
      visualStyle: "modern" as const,
      imageAvailability: "rich" as const,
      seed: "saas-test",
    };

    const scored = heroVariants
      .map((v) => {
        const profile = getVariantDecisionProfile("hero", v.id)!;
        const compat = checkVariantCompatibility(profile, ctx);
        const score = scoreVariant("hero", v.id, ctx)!;
        return { id: v.id, ...score, compatible: compat.compatible };
      })
      .filter((s) => s.compatible)
      .sort((a, b) => b.totalScore - a.totalScore);

    const selection = decideSectionVariant("hero", ctx);
    assert.equal(selection.variantId, scored[0]!.id);
    assert.ok(selection.score > 0);
  });

  it("blocks image-dependent variants when imageAvailability is none", () => {
    const profile = getVariantDecisionProfile("hero", "immersive-visual")!;
    const result = checkVariantCompatibility(profile, { imageAvailability: "none" });
    assert.equal(result.compatible, false);
    assert.ok(result.hardBlock);
  });

  it("prefers minimal hero when images unavailable", () => {
    const selection = decideSectionVariant("hero", {
      imageAvailability: "none",
      websiteGoal: "saas",
      seed: "no-images",
    });
    assert.equal(selection.variantId, "minimal-type");
  });

  it("selects portfolio variants for portfolio goal", () => {
    const selection = decideSectionVariant("portfolio", {
      websiteGoal: "portfolio",
      visualStyle: "editorial",
      imageAvailability: "rich",
      seed: "portfolio-goal",
    });
    assert.ok(["masonry-grid", "case-studies", "editorial-reel", "full-bleed-showcase"].includes(selection.variantId));
  });

  it("applies diversity across sections when scores are similar", () => {
    const plan = decideVariantPlan({
      industry: "saas",
      websiteGoal: "saas",
      targetAudience: "b2b",
      businessModel: "product",
      premiumLevel: "premium",
      imageAvailability: "rich",
      sections: ["hero", "features", "cta"],
      seed: "diversity-test",
    });

    const hero = plan.selections.hero!;
    const features = plan.selections.features!;
    assert.notEqual(hero.composition, features.composition);
    assert.ok(plan.diversityApplied || hero.composition !== features.composition);
  });

  it("selects strict-accessible hero when images unavailable", () => {
    const selection = decideSectionVariant("hero", {
      imageAvailability: "none",
      accessibilityLevel: "strict",
      websiteGoal: "saas",
      seed: "strict-fallback",
    });
    assert.equal(selection.variantId, "minimal-type");
    const profile = getVariantDecisionProfile("hero", selection.variantId)!;
    assert.ok(profile.traits.accessibility >= 0.9);
  });

  it("validates decision context warnings", () => {
    const v = validateDecisionContext({
      imageAvailability: "none",
      websiteGoal: "portfolio",
    });
    assert.equal(v.valid, true);
    assert.ok(v.warnings.length > 0);
  });

  it("validates completed decision plans", () => {
    const plan = decideVariantPlan({
      industry: "finance",
      websiteGoal: "trust",
      targetAudience: "enterprise",
      premiumLevel: "luxury",
      seed: "finance-lux",
    });
    const v = validateDecisionPlan(plan);
    assert.equal(v.valid, true, v.errors.join("; "));
    assert.equal(Object.keys(plan.selections).length, 10);
  });

  it("enterprise B2B SaaS selects credible hero and pricing", () => {
    const plan = decideVariantPlan({
      industry: "saas",
      websiteGoal: "saas",
      targetAudience: "enterprise",
      businessModel: "product",
      businessSize: "enterprise",
      premiumLevel: "premium",
      brandPersonality: "professional",
      imageAvailability: "moderate",
      seed: "enterprise-saas",
      sections: ["hero", "pricing", "testimonials"],
    });

    assert.ok(
      ["split-trust", "metrics-rail", "product-spotlight", "centered-statement"].includes(
        plan.selections.hero!.variantId,
      ),
    );
    assert.ok(
      ["tier-cards", "enterprise-callout", "comparison-table", "feature-matrix"].includes(
        plan.selections.pricing!.variantId,
      ),
    );
  });

  it("luxury hotel booking context favors immersive and editorial variants", () => {
    const hero = decideSectionVariant("hero", {
      industry: "hotel-resort",
      websiteGoal: "booking",
      targetAudience: "luxury",
      premiumLevel: "luxury",
      visualStyle: "cinematic",
      imageAvailability: "rich",
      seed: "hotel-lux",
    });
    assert.ok(
      ["immersive-visual", "editorial-stack", "centered-statement", "asymmetric-grid"].includes(
        hero.variantId,
      ),
    );
  });

  it("RTL context avoids low rtlFriendly variants", () => {
    const plan = decideVariantPlan({
      languageDirection: "rtl",
      websiteGoal: "trust",
      targetAudience: "b2b",
      seed: "rtl-test",
      sections: ["hero", "about", "contact"],
    });
    for (const kind of ["hero", "about", "contact"] as const) {
      const id = plan.selections[kind]!.variantId;
      const profile = getVariantDecisionProfile(kind, id)!;
      assert.ok(profile.traits.rtlFriendly >= 0.5, `${kind}:${id} rtl=${profile.traits.rtlFriendly}`);
    }
  });

  it("diversity config has expected thresholds", () => {
    assert.ok(DIVERSITY_CONFIG.similarityThreshold > 0);
    assert.ok(DIVERSITY_CONFIG.compositionRepeatPenalty > 0);
  });
});
