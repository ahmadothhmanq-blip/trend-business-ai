import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { THEME_COMPONENT_LIBRARIES } from "@/lib/website/builder/theme-component-registry";
import { buildEliteVisualSystemCss } from "@/lib/website/theme-preview/elite-visual-system";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const LIB_DIR = join(ROOT, "lib/ai-core/components/scaffolds/themes/libraries");

describe("phase 5 elite visual redesign", () => {
  it("exports elite visual system CSS with hero animations", () => {
    const css = buildEliteVisualSystemCss({
      primary: "#0F172A",
      accent: "#2563EB",
      foreground: "#0F172A",
      background: "#FFFFFF",
      surface: "#F8FAFC",
    });
    assert.match(css, /ti-elite-reveal/);
    assert.match(css, /data-theme-scaffold="hero"/);
  });

  it("every theme hero scaffold has data-theme-scaffold and layoutMode", () => {
    for (const [themeId, components] of Object.entries(THEME_COMPONENT_LIBRARIES)) {
      const hero = components.find((c) => c.role === "hero");
      assert.ok(hero, `missing hero for ${themeId}`);
      const file = join(LIB_DIR, `${themeId}.ts`);
      const source = readFileSync(file, "utf8");
      assert.match(
        source,
        new RegExp(`${hero!.id}[\\s\\S]*data-theme-scaffold="hero"`),
        `${hero!.id} missing data-theme-scaffold hero marker`,
      );
      assert.match(
        source,
        new RegExp(`${hero!.id}[\\s\\S]*layoutMode`),
        `${hero!.id} missing layoutMode prop`,
      );
    }
  });

  it("section shells include data-theme-scaffold marker", () => {
    const shells = readFileSync(
      join(ROOT, "lib/ai-core/components/scaffolds/themes/shells.ts"),
      "utf8",
    );
    assert.match(shells, /data-theme-scaffold="section"/);
  });
});
