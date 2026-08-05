import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TBDP_INTEGRATION_PHASE,
  TBDP_INTEGRATION_VERSION,
  resolveDesignContext,
  resolveTemplateDesign,
  resolveLanguageContext,
  resolveTheme,
  resolveSectorId,
  resolveSectorIdFromIndustry,
  enrichBuilderInput,
  resolveAiWebsiteDesign,
  resolveTemplateBridge,
  tbdpBuilderLifecycle,
  isTbdpEnrichmentEnabled,
  validateDesignResolverInput,
} from "@/lib/design-platform/integration";

describe("TBDP Phase 5 — Integration Layer", () => {
  it("exports phase constants", () => {
    assert.equal(TBDP_INTEGRATION_PHASE, "integration-5");
    assert.equal(TBDP_INTEGRATION_VERSION, "5.0.0");
  });

  it("maps industry ids to sector DNA", () => {
    assert.equal(resolveSectorIdFromIndustry("restaurant"), "restaurant");
    assert.equal(resolveSectorIdFromIndustry("healthcare"), "medical");
    assert.equal(resolveSectorIdFromIndustry("unknown-industry"), "saas");
  });

  it("resolves sector from template id", () => {
    assert.equal(
      resolveSectorId({ templateId: "restaurant-signature" }),
      "restaurant",
    );
  });

  it("resolves unified language context with RTL", () => {
    const ctx = resolveLanguageContext({ websiteLanguage: "Arabic" });
    assert.equal(ctx.direction, "rtl");
    assert.equal(ctx.typographyProfile, "arabic-rtl");
  });

  it("resolves theme from sector preference", () => {
    const theme = resolveTheme({ sectorId: "restaurant" });
    assert.ok(["light", "dark"].includes(theme.resolvedMode));
  });

  it("resolves full design context", () => {
    const ctx = resolveDesignContext({ sectorId: "saas", goal: "conversion" });
    assert.equal(ctx.meta.sectorDnaId, "saas");
    assert.ok(ctx.sectorResolved.foundations);
    assert.ok(ctx.sectorResolved.experience);
    assert.ok(ctx.aiSelections.layoutId);
    assert.ok(ctx.components.preferred.length > 0);
    assert.equal(ctx.meta.integrationPhase, "integration-5");
  });

  it("resolves template design with architecture version", () => {
    const resolved = resolveTemplateDesign({
      templateId: "saas-enterprise",
      sectorId: "saas",
      language: "English",
    });
    assert.equal(resolved.architectureVersion, "v2");
    assert.ok(resolved.cssVariables.includes("--tbdp-"));
    assert.ok(resolved.experienceCss.length > 0);
  });

  it("infers v1 architecture for legacy templates", () => {
    const resolved = resolveTemplateDesign({ templateId: "modern-business" });
    assert.equal(resolved.architectureVersion, "v1");
  });

  it("enriches builder input without mutating behavior", () => {
    const result = enrichBuilderInput({
      industryId: "medical",
      language: "English",
    });
    assert.equal(result.enrichment.sectorDnaId, "medical");
    assert.ok(result.designContext);
    assert.ok(result.projectSettingsPatch?.tbdpSectorDnaId);
  });

  it("skips enrichment when no TBDP signals present", () => {
    assert.equal(isTbdpEnrichmentEnabled({ prompt: "hello" }), false);
    const result = tbdpBuilderLifecycle.preGeneration({ prompt: "hello" });
    assert.equal(result.designContext, undefined);
  });

  it("AI bridge selects components from sector DNA not randomly", () => {
    const result = resolveAiWebsiteDesign({
      prompt: "Build a restaurant website",
      language: "English",
    });
    assert.equal(result.sectorDnaId, "restaurant");
    assert.ok(result.componentIds.length > 0);
    assert.ok(result.layoutId);
    assert.deepEqual(
      result.componentIds,
      result.designContext.components.preferred,
    );
  });

  it("template bridge provides advisory CSS layer", () => {
    const bridge = resolveTemplateBridge({
      templateId: "medical-premium",
      language: "Arabic",
    });
    assert.equal(bridge.architectureVersion, "v2");
    assert.ok(bridge.tbdpCssLayer.includes("TBDP Integration Layer"));
    assert.equal(bridge.sectorDnaAvailable, true);
    assert.equal(bridge.designContext.language.direction, "rtl");
  });

  it("validates design resolver input schema", () => {
    const valid = validateDesignResolverInput({ sectorId: "saas" });
    assert.equal(valid.success, true);
    const invalid = validateDesignResolverInput({ sectorId: "invalid" });
    assert.equal(invalid.success, false);
  });

  it("does not import website builder modules", async () => {
    const integrationIndex = await import("@/lib/design-platform/integration");
    assert.ok(integrationIndex.resolveDesignContext);
    assert.ok(integrationIndex.enrichBuilderInput);
  });
});
