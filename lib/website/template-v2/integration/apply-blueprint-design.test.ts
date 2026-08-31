import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyBlueprintToBundle,
  shouldPreservePackageVisualIdentity,
} from "@/lib/website/template-v2/integration/apply-blueprint-design";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";

function stubBundle(
  packageId: string,
  overrides?: Partial<TemplateV2PackageBundle>,
): TemplateV2PackageBundle {
  return {
    packageId,
    packageDirectory: `/templates/${packageId}`,
    manifest: { specVersion: "2.0.0", id: packageId } as TemplateV2PackageBundle["manifest"],
    tokens: {
      colors: {
        primary: "#4F46E5",
        secondary: "#0F172A",
        accent: "#818CF8",
        background: "#F9FAFB",
        foreground: "#0B1120",
        muted: "rgba(11,17,32,0.55)",
        surface: "#FFFFFF",
        signal: "#10B981",
      },
      typography: {
        display: "Syne",
        body: "DM Sans",
      },
    },
    motion: { preset: "subtle", reducedMotion: true, entrances: {} } as unknown as TemplateV2PackageBundle["motion"],
    responsive: { containerMaxWidth: "82rem" } as TemplateV2PackageBundle["responsive"],
    componentRegistry: { components: [] },
    presentation: {} as TemplateV2PackageBundle["presentation"],
    flows: {},
    tbdpNative: { enabled: true, sectorDnaId: "saas", templateIdentity: "nexus-command" } as unknown as TemplateV2PackageBundle["tbdpNative"],
    ...overrides,
  } as unknown as TemplateV2PackageBundle;
}

const corporateBlueprint = {
  colorPalette: {
    colors: {
      primary: "#080E18",
      secondary: "#152238",
      accent: "#C4A574",
      background: "#F7F6F3",
      foreground: "#080E18",
      muted: "rgba(8,14,24,0.58)",
      surface: "#FFFFFF",
      signal: "#C4A574",
    },
  },
  typographyProfile: {
    display: "Inter",
    body: "Inter",
  },
  motionStrategy: {
    preset: "fade",
    reducedMotionFallback: true,
    heroEntrance: "fade-up",
    sectionEntrance: "fade-up",
    intensity: "moderate",
  },
  containerWidths: { default: "80rem", narrow: "40rem", wide: "88rem", fullBleed: false },
  accessibilityProfile: { rtlSupport: false, motionSafe: true },
} as unknown as WebsiteBlueprint;

describe("applyBlueprintToBundle — visual identity preservation", () => {
  it("preserves flagship saas-enterprise tokens when TBDP native is enabled", () => {
    assert.equal(shouldPreservePackageVisualIdentity(stubBundle("saas-enterprise")), true);
    const merged = applyBlueprintToBundle(
      stubBundle("saas-enterprise"),
      corporateBlueprint,
    );
    assert.equal(merged.tokens.colors.primary, "#4F46E5");
    assert.equal(merged.tokens.typography.display, "Syne");
    assert.equal(merged.tokens.typography.body, "DM Sans");
  });

  it("preserves corporate-business tokens for visual skin package", () => {
    const bundle = stubBundle("corporate-business", {
      tbdpNative: { enabled: true, sectorDnaId: "corporate", templateIdentity: "executive-atlas" } as unknown as TemplateV2PackageBundle["tbdpNative"],
      tokens: {
        colors: {
          primary: "#080E18",
          secondary: "#152238",
          accent: "#C4A574",
          background: "#F7F6F3",
          foreground: "#080E18",
          muted: "rgba(8,14,24,0.58)",
          surface: "#FFFFFF",
          signal: "#C4A574",
        },
        typography: {
          display: "Cormorant Garamond",
          body: "Inter",
        },
      },
    });
    const merged = applyBlueprintToBundle(bundle, corporateBlueprint);
    assert.equal(merged.tokens.typography.display, "Cormorant Garamond");
    assert.equal(merged.tokens.colors.accent, "#C4A574");
  });
});
