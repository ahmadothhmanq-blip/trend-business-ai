import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyVisualSkinLegacyRetheme,
  projectUsesV2Architecture,
} from "@/lib/website/visual-skin/retheme";
import { applyVisualSkinFrameRetheme } from "@/lib/website/visual-skin/frame-retheme";
import {
  resolveVisualSkinThemeBridge,
  VISUAL_SKIN_THEME_BRIDGE,
} from "@/lib/website/visual-skin/theme-bridge";
import type { BusinessProfile, WebsiteStrategy } from "@/lib/website/types/layers";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

function minimalProject(): GeneratedWebsiteProject {
  return {
    projectKind: "website",
    title: "Test Brand",
    description: "A test business",
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
        content: `import { ThemeMinimalNav } from "@/components/themes/minimal/nav";
import { ThemeMinimalHero } from "@/components/themes/minimal/hero";
export default function Page() {
  return (<><ThemeMinimalNav brandName="Test" /><ThemeMinimalHero title="Hello" /></>);
}`,
        language: "tsx",
      },
      {
        path: "app/globals.css",
        content: ":root { --color-primary: #000; }\n",
        language: "css",
      },
      {
        path: "lib/site-images.ts",
        content: "export const HERO_IMAGE = null;",
        language: "typescript",
      },
    ],
    businessProfile: {
      projectName: "Test Brand",
      industry: "saas",
      targetAudience: "developers",
      businessGoals: ["grow"],
      offer: "SaaS platform",
      tone: "professional",
      geography: "global",
      competitors: [],
      kpis: [],
      summary: "Test business",
      requiredSections: ["hero", "features"],
    } satisfies BusinessProfile,
    strategy: {
      sectionPlan: [
        { id: "home-hero", page: "home", name: "hero", kind: "hero", goal: "Welcome", contentNotes: "" },
        { id: "home-features", page: "home", name: "features", kind: "features", goal: "Show value", contentNotes: "" },
      ],
    } as WebsiteStrategy,
    settings: {},
  };
}

describe("visual skin theme bridge", () => {
  it("maps sovereign alias to signal technology bridge", () => {
    const bridge = resolveVisualSkinThemeBridge("sovereign");
    assert.ok(bridge);
    assert.equal(bridge?.websiteThemeId, "technology");
    assert.equal(bridge?.templateV2PackageId, "ai-startup-signal");
    assert.equal(bridge?.templateIntelligenceId, "ti-ai-company-signal");
  });

  it("rebuilds signal with ThemeTech components", () => {
    const { project } = applyVisualSkinLegacyRetheme(
      minimalProject(),
      "signal",
      "English",
    );
    const page = project.files?.find((f) => f.path === "app/page.tsx");
    assert.ok(page?.content.includes("ThemeTech"), "expected technology theme");
    assert.equal(project.settings?.websiteThemeId, "technology");
    const globals = project.files?.find((f) => f.path === "app/globals.css");
    assert.ok(globals?.content.includes("tb-visual-skin"));
  });

  it("skips unpublished legacy skin ids", () => {
    const { project, notes } = applyVisualSkinFrameRetheme(
      minimalProject(),
      "vault",
      "English",
    );
    assert.ok(notes.some((n) => n.includes("skipped")));
    assert.ok(project.files?.find((f) => f.path === "app/page.tsx")?.content.includes("ThemeMinimal"));
  });

  it("covers published catalog skins", () => {
    assert.ok(VISUAL_SKIN_THEME_BRIDGE.signal);
    assert.ok(VISUAL_SKIN_THEME_BRIDGE.volt);
    assert.ok(VISUAL_SKIN_THEME_BRIDGE.ledger);
    assert.ok(VISUAL_SKIN_THEME_BRIDGE.atelier);
  });
});

describe("visual skin legacy retheme", () => {
  it("detects V2 architecture from globals marker", () => {
    const v2: GeneratedWebsiteProject = {
      ...minimalProject(),
      settings: { templateArchitectureVersion: "v2" },
    };
    assert.equal(projectUsesV2Architecture(v2), true);
    assert.equal(projectUsesV2Architecture(minimalProject()), false);
  });
});
