import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWebsiteBlueprint,
  deserializeWebsiteBlueprint,
  isWebsiteBlueprint,
  resolveBlueprintContext,
  resolveSectionOrder,
  serializeWebsiteBlueprint,
  validateBlueprintEngine,
  validateBlueprintInput,
  validateWebsiteBlueprint,
  BLUEPRINT_ENGINE_VERSION,
  websiteBlueprintSchema,
} from "@/lib/website/template-v2/blueprint";
import {
  getVariantDefinition,
  validateVariantRegistry,
} from "@/lib/website/template-v2/variants";

describe("Website Blueprint Engine", () => {
  it("validates the engine end-to-end", () => {
    const result = validateBlueprintEngine();
    assert.equal(result.valid, true, result.errors.join("; "));
  });

  it("produces a strongly typed blueprint with all required fields", () => {
    const blueprint = buildWebsiteBlueprint({
      industry: "saas",
      websiteGoal: "saas",
      targetAudience: "b2b",
      premiumLevel: "premium",
      seed: "blueprint-full",
    });

    assert.equal(blueprint.meta.version, BLUEPRINT_ENGINE_VERSION);
    assert.ok(blueprint.meta.blueprintId.startsWith("bp-"));
    assert.equal(blueprint.industry, "saas");
    assert.ok(blueprint.colorPalette.presetId);
    assert.ok(blueprint.typographyProfile.display);
    assert.ok(blueprint.sectionOrder.includes("hero"));
    assert.ok(blueprint.sectionOrder.includes("cta"));
    assert.ok(blueprint.sectionOrder.includes("footer"));
    assert.ok(blueprint.heroComposition.variantId);
    assert.ok(blueprint.ctaStrategy.variantId);
    assert.ok(blueprint.imageStrategy.availability);
    assert.ok(blueprint.motionStrategy.preset);
    assert.ok(blueprint.navigationStyle.layout);
    assert.ok(blueprint.footerStyle.variantId);
    assert.ok(blueprint.responsiveStrategy.breakpoints.length >= 4);
    assert.ok(blueprint.accessibilityProfile.level);
    assert.ok(blueprint.seoProfile.schemaTypes.length > 0);
    assert.ok(blueprint.decisionPlan.engineVersion);
  });

  it("is deterministic for the same context and seed", () => {
    const input = {
      industry: "corporate",
      websiteGoal: "trust" as const,
      targetAudience: "b2b" as const,
      premiumLevel: "premium" as const,
      seed: "deterministic-bp",
    };

    const a = buildWebsiteBlueprint(input);
    const b = buildWebsiteBlueprint(input);

    assert.equal(a.meta.blueprintId, b.meta.blueprintId);
    assert.deepEqual(a.sectionOrder, b.sectionOrder);
    assert.deepEqual(
      a.sectionVariants.map((s) => `${s.sectionKind}:${s.variantId}`),
      b.sectionVariants.map((s) => `${s.sectionKind}:${s.variantId}`),
    );
    assert.equal(a.colorPalette.presetId, b.colorPalette.presetId);
    assert.equal(a.typographyProfile.presetId, b.typographyProfile.presetId);
  });

  it("uses the Decision Engine for section variants", () => {
    const blueprint = buildWebsiteBlueprint({
      industry: "saas",
      websiteGoal: "saas",
      targetAudience: "startup",
      imageAvailability: "rich",
      seed: "decision-integration",
    });

    for (const section of blueprint.sectionVariants) {
      const def = getVariantDefinition(section.sectionKind, section.variantId);
      assert.ok(def, `Invalid variant ${section.variantId} for ${section.sectionKind}`);
      assert.equal(section.composition, def.composition);
    }

    assert.ok(blueprint.decisionPlan.selections.hero);
    assert.equal(
      blueprint.heroComposition.variantId,
      blueprint.decisionPlan.selections.hero!.variantId,
    );
  });

  it("orders sections by website goal", () => {
    const portfolio = resolveSectionOrder(
      resolveBlueprintContext({ websiteGoal: "portfolio" }),
    );
    const saas = resolveSectionOrder(
      resolveBlueprintContext({ websiteGoal: "saas" }),
    );

    assert.ok(portfolio.indexOf("portfolio") < portfolio.indexOf("footer"));
    assert.ok(saas.indexOf("pricing") < saas.indexOf("footer"));
    assert.notEqual(portfolio.join(","), saas.join(","));
  });

  it("selects luxury palette and typography for luxury context", () => {
    const blueprint = buildWebsiteBlueprint({
      industry: "hotel-resort",
      websiteGoal: "booking",
      targetAudience: "luxury",
      premiumLevel: "luxury",
      visualStyle: "luxury",
      seed: "luxury-hotel",
    });

    assert.equal(blueprint.colorPalette.presetId, "luxury-editorial");
    assert.equal(blueprint.typographyProfile.presetId, "editorial-luxury");
    assert.equal(blueprint.premiumLevel, "luxury");
  });

  it("adapts image strategy when images unavailable", () => {
    const blueprint = buildWebsiteBlueprint({
      imageAvailability: "none",
      accessibilityLevel: "strict",
      websiteGoal: "saas",
      seed: "no-images",
    });

    assert.equal(blueprint.imageStrategy.availability, "none");
    assert.equal(blueprint.imageStrategy.heroTreatment, "typography-only");
    assert.equal(blueprint.heroComposition.mediaPosition, "none");
    assert.equal(blueprint.motionStrategy.intensity, "none");
  });

  it("serializes and deserializes round-trip", () => {
    const original = buildWebsiteBlueprint({
      industry: "finance",
      websiteGoal: "trust",
      targetAudience: "enterprise",
      seed: "serialize-test",
    });

    const json = serializeWebsiteBlueprint(original);
    const restored = deserializeWebsiteBlueprint(json);

    assert.equal(restored.meta.blueprintId, original.meta.blueprintId);
    assert.equal(restored.websiteGoal, original.websiteGoal);
    assert.deepEqual(restored.sectionOrder, original.sectionOrder);
    assert.equal(
      restored.heroComposition.variantId,
      original.heroComposition.variantId,
    );
    assert.ok(isWebsiteBlueprint(restored));
  });

  it("passes zod schema validation", () => {
    const blueprint = buildWebsiteBlueprint({
      industry: "creative-agency",
      websiteGoal: "portfolio",
      seed: "schema-test",
    });

    const parsed = websiteBlueprintSchema.safeParse(blueprint);
    assert.equal(parsed.success, true, parsed.success ? "" : JSON.stringify(parsed.error.issues));
  });

  it("validates blueprint against registry", () => {
    const registry = validateVariantRegistry();
    assert.equal(registry.valid, true);

    const blueprint = buildWebsiteBlueprint({
      industry: "medical",
      websiteGoal: "trust",
      seed: "registry-validate",
    });

    const validation = validateWebsiteBlueprint(blueprint);
    assert.equal(validation.valid, true, validation.errors.join("; "));
  });

  it("validates blueprint input warnings", () => {
    const result = validateBlueprintInput({
      imageAvailability: "none",
      websiteGoal: "portfolio",
    });
    assert.equal(result.valid, true);
    assert.ok(result.warnings.some((w) => w.includes("Portfolio")));
  });

  it("includes SEO profile aligned with goal", () => {
    const saas = buildWebsiteBlueprint({
      websiteGoal: "saas",
      seed: "seo-saas",
    });
    assert.ok(saas.seoProfile.schemaTypes.includes("SoftwareApplication"));

    const booking = buildWebsiteBlueprint({
      websiteGoal: "booking",
      seed: "seo-booking",
    });
    assert.ok(booking.seoProfile.schemaTypes.includes("LocalBusiness"));
  });

  it("sets RTL accessibility when language is RTL", () => {
    const blueprint = buildWebsiteBlueprint({
      languageDirection: "rtl",
      industry: "finance",
      seed: "rtl-test",
    });

    assert.equal(blueprint.accessibilityProfile.rtlSupport, true);
    assert.ok(blueprint.typographyProfile.rtlDisplay);
  });

  it("does not produce HTML or component output", () => {
    const blueprint = buildWebsiteBlueprint({ seed: "no-render" });
    const json = JSON.stringify(blueprint);

    assert.ok(!json.includes("<div"));
    assert.ok(!json.includes("React"));
    assert.ok(!json.includes("jsx"));
  });
});
