import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getIndustryHomeComponentsForTheme } from "@/lib/website/builder/industry-home-compositions";
import { remapHomeComponentOrder } from "@/lib/website/visual-skin/remap-home-to-theme";
import { applyVisualSkinFrameRetheme } from "@/lib/website/visual-skin/frame-retheme";
import { isVisualSkinV1Enabled } from "@/lib/website/generation-flags";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

describe("remap home components to technology theme", () => {
  it("maps restaurant dining sections to ThemeTech while keeping industry TI", () => {
    const remapped = getIndustryHomeComponentsForTheme(
      "ti-restaurant-dining",
      "technology",
    );
    assert.ok(remapped.includes("ThemeTechNav"));
    assert.ok(remapped.includes("ThemeTechHero"));
    assert.ok(remapped.includes("ThemeTechFooter"));
    assert.ok(remapped.length >= 5);
    assert.ok(!remapped.some((id) => id.startsWith("ThemeLuxury")));
  });

  it("maps corporate trust contact to modern pricing or faq fallback", () => {
    const remapped = getIndustryHomeComponentsForTheme(
      "ti-corporate-trust",
      "modern",
    );
    assert.ok(remapped.includes("ThemeModernNav"));
    assert.ok(remapped.includes("ThemeModernHero"));
    assert.ok(remapped.includes("ThemeModernFooter"));
    assert.ok(remapped.length >= 5);
  });

  it("deduplicates body sections when multiple roles map to features", () => {
    const order = remapHomeComponentOrder(
      [
        "ThemeLuxuryNav",
        "ThemeLuxuryHero",
        "ThemeLuxuryCta",
        "ThemeLuxuryStory",
        "ThemeLuxuryFooter",
      ],
      "modern",
    );
    const features = order.filter((id) => id === "ThemeModernFeatures");
    assert.equal(features.length, 1);
  });
});

describe("visual skin generation flag", () => {
  it("is enabled when published skins exist", () => {
    assert.equal(isVisualSkinV1Enabled(), true);
  });
});

describe("sovereign frame retheme with industry TI", () => {
  it("uses project templateIntelligenceId for section order", () => {
    const project: GeneratedWebsiteProject = {
      projectKind: "website",
      title: "Bistro",
      description: "Fine dining",
      pages: [],
      sections: [],
      colorPalette: [],
      typography: [],
      components: [],
      content: [],
      seo: [],
      roadmap: [],
      files: [
        {
          path: "app/page.tsx",
          content: "export default function Page() { return null; }",
          language: "tsx",
        },
        {
          path: "app/globals.css",
          content: ":root {}",
          language: "css",
        },
      ],
      settings: { templateIntelligenceId: "ti-restaurant-dining" },
    };

    const { project: next } = applyVisualSkinFrameRetheme(
      project,
      "sovereign",
      "English",
    );
    const page = next.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes("ThemeTech"));
    assert.ok(page.split("ThemeTech").length >= 4);
    assert.equal(next.settings?.templateIntelligenceId, "ti-restaurant-dining");
  });
});
