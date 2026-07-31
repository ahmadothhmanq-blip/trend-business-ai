import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDesignSystemSpec } from "@/lib/ai-core/design-intelligence/build-spec";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import type { DesignPolicy } from "@/lib/ai-core/design-intelligence/die-types";
import {
  buildExcellenceSpacingCss,
  resolveDefaultInnerPageSections,
  resolveInnerPageSections,
  resolveSectionShellVariantFromSpec,
} from "@/lib/ai-core/website-builder/excellence";

const baseIntelligence = {
  industryKey: "agency",
  premiumStyleId: "luxury-editorial",
  layoutVariationId: "editorial",
  heroTreatment: "editorial-split",
  sectionLayout: "editorial-asymmetric",
  cardStyle: "borderless-editorial",
  navigationStyle: "transparent-overlay",
  animationStyle: "slow-reveal",
  sectionStructure: ["Hero", "Story", "Work", "Contact"],
  imageStyle: "cinematic",
  visualStyle: "editorial luxury",
  layoutStyle: "editorial",
  spacingDirection: "airy",
  colorDirection: "ink and gold",
  typographyDirection: "display serif",
  enginePreset: "luxury",
  componentStyle: "editorial cards",
} as unknown as DesignIntelligenceBrief;

const basePolicy = {
  industryId: "agency",
  knowledgeEntryId: "agency-default",
  layoutFamily: "editorial",
  allowedPremiumStyleIds: ["luxury-editorial"],
  defaultPremiumStyleId: "luxury-editorial",
  defaultLayoutVariationId: "editorial",
  forbiddenLayoutVariationIds: [],
  spacingDensity: "airy",
  colorStrategy: "high contrast",
  typographyStrategy: "editorial serif",
  componentCardStyle: "borderless-editorial",
  navigationStyle: "transparent-overlay",
  minContrastRatio: 4.5,
  responsiveStrategy: "mobile-first",
  visualHierarchyNotes: [],
  accessibilityPolicies: [],
  lockedColors: null,
  lockedTypography: null,
  requiredSections: ["Hero", "Contact"],
} as unknown as DesignPolicy;

describe("Website Builder Excellence", () => {
  it("maps editorial DesignSystemSpec to editorial section shell", () => {
    const spec = buildDesignSystemSpec({
      intelligence: baseIntelligence,
      policy: basePolicy,
    });
    assert.equal(resolveSectionShellVariantFromSpec(spec), "editorial");
  });

  it("resolves about page sections without generic FeatureHighlights default", () => {
    const sections = resolveDefaultInnerPageSections(
      {
        name: "About",
        path: "/about",
        purpose: "Company story and team",
        keySections: [],
      },
      { industryId: "agency", compositionMode: "editorial" },
    );
    assert.ok(sections.some((s) => s.componentId === "FeatureStorytelling"));
    assert.ok(sections.some((s) => s.componentId === "TeamSection"));
    assert.equal(
      sections.some((s) => s.componentId === "FeatureHighlights"),
      false,
    );
  });

  it("maps key sections to semantically relevant components", () => {
    const sections = resolveInnerPageSections(
      {
        name: "Services",
        path: "/services",
        purpose: "Service offerings",
        keySections: ["Our services", "Client testimonials", "Book a call"],
      },
      [],
      { industryId: "agency", compositionMode: "trust" },
    );
    assert.equal(sections[0]?.componentId, "ServicesGrid");
    assert.equal(sections[1]?.componentId, "TestimonialsCarousel");
    assert.equal(sections[2]?.componentId, "CtaBand");
  });

  it("emits density-aware spacing CSS", () => {
    const css = buildExcellenceSpacingCss("airy");
    assert.match(css, /--section-y: 8\.5rem/);
    assert.match(css, /Excellence Program/);
  });
});
