import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { harmonizePalette, isDarkPalette } from "@/lib/website/template-v2/tokens/harmonize-palette";

describe("harmonizePalette", () => {
  it("detects dark backgrounds", () => {
    assert.equal(isDarkPalette("#030712"), true);
    assert.equal(isDarkPalette("#FAF7F2"), false);
  });

  it("derives consistent semantic tokens for light themes", () => {
    const result = harmonizePalette({
      primary: "#0A1628",
      secondary: "#152238",
      accent: "#B89B6E",
      background: "#F8F6F2",
      foreground: "#0A1628",
    });
    assert.equal(result.colors.surface, "#FFFFFF");
    assert.match(result.borders.default, /^rgba\(/);
    assert.match(result.shadows.glow, /184,155,110/);
  });

  it("derives consistent semantic tokens for dark themes", () => {
    const result = harmonizePalette({
      primary: "#020617",
      secondary: "#0F172A",
      accent: "#22D3EE",
      background: "#030712",
      foreground: "#F0F9FF",
    });
    assert.notEqual(result.colors.surface, "#FFFFFF");
    assert.match(result.colors.grid, /rgba\(34,211,238/);
  });

  it("adds package-specific accent aliases", () => {
    const result = harmonizePalette(
      {
        primary: "#0A0A0B",
        secondary: "#121214",
        accent: "#D4FF00",
        background: "#0A0A0B",
        foreground: "#F4F4F0",
      },
      "creative-agency-premium",
    );
    assert.equal(result.colors.volt, "#D4FF00");
    assert.equal(result.colors.ghost, "#F4F4F0");
  });
});
