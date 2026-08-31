import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FLAGSHIP_SEMANTIC_THEMES,
  PACKAGE_FLAGSHIP_UI,
  SAAS_FLAGSHIP_UI,
  CORPORATE_FLAGSHIP_UI,
  buildFlagshipSemanticThemeCss,
  resolveFlagshipSemanticTheme,
  resolveFlagshipUiForPackage,
} from "@/lib/website/template-v2/flagship/themes";

describe("flagship visual identity themes", () => {
  it("defines semantic themes for all published V2 packages", () => {
    for (const id of Object.keys(PACKAGE_FLAGSHIP_UI)) {
      assert.ok(FLAGSHIP_SEMANTIC_THEMES[id], `missing semantic theme for ${id}`);
    }
    assert.equal(Object.keys(PACKAGE_FLAGSHIP_UI).length, 20);
  });

  it("maps product and hospitality packages to dark mode", () => {
    for (const id of [
      "ai-startup-signal",
      "restaurant-premium",
      "creative-agency-premium",
      "obsidian-noir",
      "pulse-fintech",
      "citadel-trust",
      "restaurant-signature",
      "creative-portfolio",
      "real-estate-prestige",
    ]) {
      assert.equal(resolveFlagshipSemanticTheme(id).mode, "dark", id);
    }
  });

  it("maps trust and commerce packages to light mode", () => {
    for (const id of [
      "hotel-resort-premium",
      "saas-enterprise",
      "corporate-business",
      "finance-premium",
      "medical-premium",
      "real-estate-premium",
      "ecommerce-premium",
      "education-premium",
      "prism-aurora",
      "forge-industrial",
      "lumina-wellness",
    ]) {
      assert.equal(resolveFlagshipSemanticTheme(id).mode, "light", id);
    }
  });

  it("emits semantic CSS variables and color-scheme", () => {
    const darkCss = buildFlagshipSemanticThemeCss("ai-startup-signal");
    assert.ok(darkCss.includes("Flagship semantic theme"));
    assert.ok(darkCss.includes("--df-border-subtle"));
    assert.ok(darkCss.includes("--color-surface-elevated"));
    assert.ok(darkCss.includes("color-scheme: dark"));

    const lightCss = buildFlagshipSemanticThemeCss("corporate-business");
    assert.ok(lightCss.includes("color-scheme: light"));
  });

  it("extends flagship UI tokens with surface and card primitives", () => {
    assert.ok(SAAS_FLAGSHIP_UI.sectionGlow.includes("df-section-glow"));
    assert.ok(SAAS_FLAGSHIP_UI.card.includes("df-card"));
    assert.ok(CORPORATE_FLAGSHIP_UI.sectionAlt.includes("df-section-alt"));
    assert.ok(CORPORATE_FLAGSHIP_UI.cardFeatured.includes("df-card-featured"));
    assert.ok(resolveFlagshipUiForPackage("prism-aurora").btnPrimary.includes("pr-btn"));
  });
});
