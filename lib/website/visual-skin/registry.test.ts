import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listVisualSkins } from "@/lib/website/visual-skin/registry";
import {
  resolveVisualSkinThemeBridge,
  resolveVisualSkinV2PackageId,
} from "@/lib/website/visual-skin/theme-bridge";
import { applyVisualSkinFullRetheme } from "@/lib/website/visual-skin/retheme";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

function baseProject(
  tiId = "ti-corporate-trust",
): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Apex Services",
    description: "Professional business services",
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
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
    ],
    businessProfile: {
      projectName: "Apex Services",
      industry: "general",
      targetAudience: "Business owners",
      businessGoals: ["Grow revenue"],
      offer: "Professional services",
      tone: "professional",
      geography: "Global",
      competitors: [],
      kpis: [],
      summary: "Test project",
      requiredSections: ["hero", "contact"],
    },
    settings: { templateIntelligenceId: tiId },
  };
}

describe("Visual skin registry", () => {
  it("publishes twenty flagship visual skins", () => {
    const skins = listVisualSkins();
    assert.equal(skins.length, 20);
    assert.ok(skins.every((skin) => skin.flagship));
  });

  it("maps skins to distinct V2 flagship packages", () => {
    const ids = new Set(listVisualSkins().map((skin) => resolveVisualSkinV2PackageId(skin.id)));
    assert.equal(ids.size, 20);
  });

  it("resolves legacy sovereign/prestige aliases to new packages", () => {
    assert.equal(resolveVisualSkinV2PackageId("sovereign"), "ai-startup-signal");
    assert.equal(resolveVisualSkinV2PackageId("prestige"), "creative-agency-premium");
  });
});

describe("volt V2 frame retheme", () => {
  it("swaps home page to creative-agency-premium V2 components", async () => {
    const { project: next, notes } = await applyVisualSkinFullRetheme(
      baseProject(),
      "volt",
      "English",
    );
    const page = next.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="creative-agency-premium"'));
    assert.ok(page.includes("creative-agency-premium-hero"));
    assert.ok(!page.includes("ThemeModernHero"));
    assert.equal(next.settings?.visualSkinId, "volt");
    assert.ok(notes.some((n) => n.includes("V2 flagship")));
  });
});

describe("signal V2 frame retheme", () => {
  it("uses ai-startup-signal V2 package with industry TI preserved", async () => {
    const { project: next } = await applyVisualSkinFullRetheme(
      baseProject("ti-restaurant-dining"),
      "signal",
      "English",
    );
    const page = next.files?.find((f) => f.path === "app/page.tsx")?.content ?? "";
    assert.ok(page.includes('data-v2-package="ai-startup-signal"'));
    assert.ok(page.includes("AiStartupSignalHero"));
    assert.equal(next.settings?.templateIntelligenceId, "ti-restaurant-dining");
    assert.equal(next.settings?.visualSkinId, "signal");
  });
});
