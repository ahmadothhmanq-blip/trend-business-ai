import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { buildDesignFoundationCss } from "@/lib/website/template-v2/foundation";
import { loadTemplateV2Package } from "@/lib/website/template-v2/loader/load-v2-package";
import { buildV2DesignTokenCss } from "@/lib/website/template-v2/tokens/emit-design-tokens";
import { resolveWbTemplatesRoot } from "@/lib/website/template-engine/constants.server";

const FLAGSHIP_PACKAGES = [
  "corporate-business",
  "saas-enterprise",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
  "ai-startup-signal",
];

describe("Design Foundation — shared layer", () => {
  it("emits token scale, primitives, motion, responsive, and compat aliases", () => {
    const css = buildDesignFoundationCss({
      packageId: "corporate-business",
      tokens: {
        colors: { primary: "#080E18", accent: "#C4A574", foreground: "#080E18" },
        typography: {
          display: "Cormorant Garamond",
          body: "Inter",
          scale: { sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "2.25rem", display: "clamp(3rem, 6vw, 5rem)" },
        },
        spacing: { unit: "0.25rem", scale: ["0", "2", "4", "8"] },
      },
      responsive: {
        containerMaxWidth: "88rem",
        breakpoints: [
          { name: "md", minWidth: 768 },
          { name: "lg", minWidth: 1024 },
        ],
      },
    });

    assert.ok(css.includes("Design Foundation — token scale"));
    assert.ok(css.includes("--df-text-display"));
    assert.ok(css.includes("--df-text-2xl"));
    assert.ok(css.includes("--df-radius-lg"));
    assert.ok(css.includes("--df-shadow-elevated"));
    assert.ok(css.includes("Flagship semantic theme"));
    assert.ok(css.includes("--df-border-subtle"));
    assert.ok(css.includes("--df-container-padding"));
    assert.ok(css.includes("--cb-section-y"));
    assert.ok(css.includes("--sv-section-y"));
    assert.ok(css.includes("--mp-section-y"));
    assert.ok(css.includes(".df-btn-primary"));
    assert.ok(css.includes(".df-card"));
    assert.ok(css.includes(".df-slot-empty"));
    assert.ok(css.includes(".df-hero-editorial"));
    assert.ok(css.includes(".df-hero-split-empty"));
    assert.ok(css.includes(".df-hero-bleed-empty-section"));
    assert.ok(css.includes(".df-hero-trust-empty"));
    assert.ok(css.includes("Hero collision guards"));
    assert.ok(css.includes("Typography collision guards"));
    assert.ok(css.includes("Design Foundation — RTL"));
    assert.ok(css.includes(".df-input"));
    assert.ok(css.includes(".df-nav"));
    assert.ok(css.includes(".df-footer"));
    assert.ok(css.includes("@keyframes df-reveal-up"));
    assert.ok(css.includes(".se-section-glow"));
    assert.ok(css.includes(".cb-container"));
    assert.ok(css.includes("prefers-reduced-motion"));
  });

  for (const packageId of FLAGSHIP_PACKAGES) {
    it(`injects foundation into ${packageId} token CSS`, async () => {
      const loaded = await loadTemplateV2Package(
        path.join(resolveWbTemplatesRoot(), packageId),
      );
      assert.equal(loaded.ok, true);
      if (!loaded.ok) return;

      const css = buildV2DesignTokenCss(loaded.bundle.tokens, loaded.bundle);
      assert.ok(css.includes("Design Foundation — token scale"));
      assert.ok(css.includes(".df-container"));
      assert.ok(css.includes(`--color-primary: ${loaded.bundle.tokens.colors.primary}`));
      assert.ok(css.includes(`Template Architecture V2 — ${packageId}`));
    });
  }
});
