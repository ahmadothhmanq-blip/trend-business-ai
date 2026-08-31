import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { VisualSkin } from "@/lib/website/visual-skin/types";
import {
  applyVisualSkinToProjectFiles,
  buildVisualSkinLayerCss,
  patchGlobalsWithVisualSkin,
  VISUAL_SKIN_CSS_MARKER,
} from "@/lib/website/visual-skin/skin-css";

const mockSkin = (id: string, primary: string): VisualSkin => ({
  id,
  label: "Test",
  description: "Test skin",
  tokens: {
    primary,
    secondary: "#333",
    accent: "#06b",
    background: "#fff",
    foreground: "#111",
    radius: "0.5rem",
  },
  typography: { headingFont: "Inter", bodyFont: "Inter" },
  sectionShellVariant: "minimal-product",
  shadows: { sm: "none", md: "none", lg: "none" },
  imageTreatment: {
    radius: "0.5rem",
    aspectRatio: "16 / 9",
    frame: "none",
    shadow: "none",
  },
  motionIntensity: "balanced",
});

describe("visual skin CSS layer", () => {
  it("builds image + RTL rules", () => {
    const skin = mockSkin("signal", "#2563eb");
    const css = buildVisualSkinLayerCss(skin);
    assert.ok(css.includes(VISUAL_SKIN_CSS_MARKER));
    assert.ok(css.includes("--tb-img-radius"));
    assert.ok(css.includes('[dir="rtl"]'));
  });

  it("patches globals and injects section shell + layout marker", () => {
    const skin = mockSkin("vault", "#d4af37");
    const files = applyVisualSkinToProjectFiles(
      [
        {
          path: "app/globals.css",
          content: ":root { --color-primary: #000; }\n",
          language: "css",
        },
        {
          path: "app/layout.tsx",
          content: '<html lang="en"><body>{children}</body></html>',
          language: "tsx",
        },
        {
          path: "app/page.tsx",
          content: "export default function Page() { return null; }",
          language: "tsx",
        },
      ],
      skin,
    );
    const globals = files.find((f) => f.path === "app/globals.css")!;
    assert.ok(globals.content.includes("#d4af37"));
    assert.ok(globals.content.includes("--tb-img-radius"));
    assert.ok(
      globals.content.includes('data-tb-skin="vault"') ||
        globals.content.includes("html[data-tb-skin"),
    );
    const shell = files.find((f) => f.path === "components/ui/section-shell.tsx")!;
    assert.ok(shell.content.includes("SectionShell"));
    const layout = files.find((f) => f.path === "app/layout.tsx")!;
    assert.ok(layout.content.includes('data-tb-skin="vault"'));
  });

  it("replaces existing skin block on reapply", () => {
    const skin = mockSkin("horizon", "#0d9488");
    const first = patchGlobalsWithVisualSkin(":root {}", skin);
    const second = patchGlobalsWithVisualSkin(first, mockSkin("pulse", "#ec4899"));
    assert.equal((second.match(/tb-visual-skin/g) ?? []).length, 1);
    assert.ok(second.includes("#ec4899"));
  });
});
