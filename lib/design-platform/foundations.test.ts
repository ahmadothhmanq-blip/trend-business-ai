import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TBDP_COLOR_PRIMITIVES,
  TBDP_SEMANTIC_COLORS,
  resolveSemanticColors,
} from "@/lib/design-platform/foundations/color";
import { TBDP_ELEVATION_TOKENS } from "@/lib/design-platform/foundations/elevation";
import { TBDP_GRID_TOKENS } from "@/lib/design-platform/foundations/grid";
import { TBDP_ICON_TOKENS } from "@/lib/design-platform/foundations/icon";
import { TBDP_RADIUS_TOKENS } from "@/lib/design-platform/foundations/radius";
import { TBDP_SHADOW_TOKENS } from "@/lib/design-platform/foundations/shadow";
import { TBDP_SPACING_TOKENS } from "@/lib/design-platform/foundations/spacing";
import {
  resolveTypographyProfile,
  TBDP_TYPOGRAPHY_TOKENS,
} from "@/lib/design-platform/foundations/typography";
import {
  buildTbdpDesignTokens,
  emitTbdpCssVariables,
  serializeTbdpTokens,
} from "@/lib/design-platform/tokens";
import {
  validateElevationHierarchy,
  validateTbdpFoundation,
} from "@/lib/design-platform/validation";

describe("TBDP foundations", () => {
  it("defines semantic colors for light and dark without raw duplication in API", () => {
    const light = resolveSemanticColors("light");
    const dark = resolveSemanticColors("dark");
    assert.ok(light.primary.startsWith("#"));
    assert.ok(dark.primary.startsWith("#"));
    assert.notEqual(light.primary, dark.primary);
    assert.ok(light.surface.base);
    assert.ok(dark.text.primary);
  });

  it("exposes typography profiles for latin and arabic directions", () => {
    const latin = resolveTypographyProfile("latin-ltr");
    const arabic = resolveTypographyProfile("arabic-rtl");
    assert.equal(latin.direction, "ltr");
    assert.equal(arabic.direction, "rtl");
    assert.ok(arabic.body.fontFamily.includes("Noto Sans Arabic"));
    assert.equal(TBDP_TYPOGRAPHY_TOKENS.profiles["arabic-ltr"].localeFamily, "arabic");
  });

  it("defines complete spacing scale", () => {
    assert.equal(TBDP_SPACING_TOKENS.scale.micro, "0.125rem");
    assert.equal(TBDP_SPACING_TOKENS.scale["4xl"], "6rem");
    assert.ok(TBDP_SPACING_TOKENS.semantic.section.lg);
  });

  it("defines responsive grid breakpoints", () => {
    assert.equal(TBDP_GRID_TOKENS.columns.desktop, 12);
    assert.equal(TBDP_GRID_TOKENS.columns.mobile, 4);
    assert.ok(TBDP_GRID_TOKENS.safeAreas.top.includes("safe-area"));
  });

  it("defines radius, shadow, icon, and elevation scales", () => {
    assert.equal(TBDP_RADIUS_TOKENS.sharp, "0");
    assert.equal(TBDP_RADIUS_TOKENS.pill, "9999px");
    assert.notEqual(TBDP_SHADOW_TOKENS["0"], TBDP_SHADOW_TOKENS["5"]);
    assert.ok(TBDP_ICON_TOKENS.usage.minContrastRatio >= 3);
    assert.equal(TBDP_ELEVATION_TOKENS.layers.modal.zIndex, 400);
  });

  it("keeps primitives as single raw color source", () => {
    assert.ok(TBDP_COLOR_PRIMITIVES.brand[500]);
    assert.ok(TBDP_SEMANTIC_COLORS.light.primary);
  });
});

describe("TBDP token builder", () => {
  it("builds centralized token tree", () => {
    const tokens = buildTbdpDesignTokens({ mode: "dark", typographyProfile: "arabic-rtl" });
    assert.equal(tokens.mode, "dark");
    assert.equal(tokens.typographyProfile, "arabic-rtl");
    assert.ok(tokens.color.text.primary);
    assert.ok(tokens.spacing.scale.md);
    assert.ok(tokens.elevation.layers.tooltip);
  });

  it("emits CSS variables with tbdp prefix", () => {
    const css = emitTbdpCssVariables(buildTbdpDesignTokens());
    assert.ok(css.includes("--tbdp-color-primary"));
    assert.ok(css.includes("--tbdp-spacing-md"));
    assert.ok(css.includes("--tbdp-font-body"));
    assert.ok(!css.includes("TBDP_COLOR_PRIMITIVES"));
  });

  it("serializes and round-trips tokens", () => {
    const tokens = buildTbdpDesignTokens();
    const json = serializeTbdpTokens(tokens);
    const parsed = JSON.parse(json);
    assert.equal(parsed.meta.packageId, "trend-business-ai-design-platform");
  });
});

describe("TBDP validation", () => {
  it("validates default token tree", () => {
    const tokens = buildTbdpDesignTokens();
    const result = validateTbdpFoundation(tokens);
    assert.equal(result.valid, true, result.issues.map((i) => i.message).join("; "));
  });

  it("validates elevation hierarchy ordering", () => {
    const tokens = buildTbdpDesignTokens();
    const result = validateElevationHierarchy(tokens);
    assert.equal(result.valid, true);
  });
});

describe("TBDP backward compatibility", () => {
  it("does not export website builder or template v2 symbols", async () => {
    const mod = await import("@/lib/design-platform/components/catalog");
    const keys = Object.keys(mod);
    assert.ok(!keys.some((k) => k.includes("Theme")));
    assert.ok(!keys.some((k) => k.includes("V2")));
    assert.ok(!keys.some((k) => k.includes("WebsiteBuilder")));
  });

  it("is importable without side effects on global runtime", () => {
    assert.doesNotThrow(() => {
      buildTbdpDesignTokens();
    });
  });
});
