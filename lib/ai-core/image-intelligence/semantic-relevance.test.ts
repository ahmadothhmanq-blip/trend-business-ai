import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildImageIntelligence } from "@/lib/ai-core/image-engine/intelligence";
import { resolveImagePolicy } from "@/lib/ai-core/image-intelligence/policies";
import { buildImageSystemSpec } from "@/lib/ai-core/image-intelligence/build-spec";
import {
  resolveSemanticVisualConcept,
  validateSemanticRelevance,
  isGenericImageSpec,
} from "@/lib/ai-core/image-intelligence/semantic-relevance";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

const profile = {
  projectName: "Atelier Home",
  industry: "furniture",
  targetAudience: "Homeowners",
  businessGoals: ["Showcase craftsmanship"],
  offer: "Sustainable luxury furniture",
  tone: "luxury",
  geography: "New York",
  competitors: [],
  kpis: [],
  summary: "Luxury furniture showroom",
  requiredSections: ["Hero", "Sustainability"],
} as CoreBusinessProfile;

const strategy = {
  positioning: "Sustainable luxury furniture showroom",
  sitemap: ["/"],
  pages: [
    {
      name: "Home",
      path: "/",
      purpose: "Introduce sustainable craftsmanship",
      keySections: ["Hero", "Sustainability", "Living Room"],
    },
  ],
  sectionPlan: [
    {
      id: "sustainability",
      page: "Home",
      name: "Sustainability",
      goal: "Highlight eco materials",
      contentNotes: "Natural wood, recycled materials, artisan craftsmanship",
    },
    {
      id: "living-room",
      page: "Home",
      name: "Living Room",
      goal: "Showcase luxury interiors",
      contentNotes: "Luxury living room with curated sofa collection",
    },
  ],
  conversionFunnel: ["browse"],
  contentStructure: ["hero", "sustainability", "living room"],
  contentStrategy: {
    brandVoice: "luxury",
    messagingPillars: ["Sustainable craftsmanship", "Natural materials"],
    proofPoints: ["Artisan workshop"],
    objectionHandlers: [],
    seoTopics: ["sustainable furniture", "luxury sofa"],
  },
  ctas: ["Browse collections"],
  seoFocus: ["luxury furniture"],
} as CoreProductStrategy;

const designSystem = {
  style: "luxury",
  stylePreset: "luxury",
  industryPattern: "furniture",
  colors: {
    primary: "#2c1810",
    secondary: "#4a3728",
    accent: "#c9a96e",
    neutral: "#6b7280",
    background: "#faf8f5",
    foreground: "#1a1410",
    surface: "#f0ebe3",
  },
  typography: {
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    scale: ["sm", "base", "lg"],
    notes: "refined",
  },
  layoutRules: ["grid"],
  layoutStyle: "commerce-grid",
  uiPatterns: ["cards"],
  componentPalette: ["hero", "grid"],
  spacingScale: ["4", "8", "16"],
  borderRadius: "md",
  shadowStyle: "soft",
} as CoreDesignSystem;

describe("Image semantic relevance enforcement", () => {
  it("resolves industry-specific visual concepts from section purpose", () => {
    const ctx = buildImageIntelligence({ strategy, designSystem, profile });
    const sustainability = resolveSemanticVisualConcept({
      industryId: "furniture",
      sectionLabel: "Sustainability",
      sectionKey: "about",
      sectionPurpose: "Highlight eco materials and craftsmanship",
      contentNotes: "Natural wood, recycled materials",
      purpose: "section",
      ctx,
      strategy,
    });
    assert.match(sustainability.visualConcept.toLowerCase(), /wood|craft|sustain|material/);

    const livingRoom = resolveSemanticVisualConcept({
      industryId: "furniture",
      sectionLabel: "Living Room",
      sectionKey: "features",
      contentNotes: "Luxury living room interior",
      purpose: "section",
      ctx,
      strategy,
    });
    assert.match(livingRoom.visualConcept.toLowerCase(), /living|interior|luxury|sofa/);
  });

  it("builds ImageSpecifications with sectionPurpose and visualConcept", () => {
    const policy = resolveImagePolicy({ industryId: "furniture" }).value;
    const spec = buildImageSystemSpec({
      policy,
      strategy,
      designSystem,
      profile,
      structuredImageRequirements: [
        {
          role: "section",
          brief: "Artisan workshop craftsmanship detail",
          sectionKey: "about",
          required: true,
        },
      ],
      designPlanContext: {
        sections: [
          { key: "sustainability", label: "Sustainability", purpose: "Eco materials story" },
          { key: "living-room", label: "Living Room", purpose: "Luxury interior showcase" },
        ],
        heroTreatment: "cinematic",
        layoutStyle: "editorial",
      },
    });

    assert.ok(spec.specifications.length > 0);
    for (const imageSpec of spec.specifications) {
      assert.ok(imageSpec.visualConcept?.trim(), `missing visualConcept on ${imageSpec.id}`);
      assert.ok(imageSpec.sectionPurpose?.trim() || imageSpec.pagePurpose?.trim());
      assert.ok(imageSpec.providerPrompt.length > 40);
      assert.equal(isGenericImageSpec(imageSpec), false);
    }

    const semantic = validateSemanticRelevance(spec.specifications, policy);
    assert.equal(semantic.valid, true, semantic.issues.join("; "));
  });

  it("rejects generic placeholder image language", () => {
    assert.equal(
      isGenericImageSpec({
        subject: "generic stock photo",
        scene: "office",
        providerPrompt: "business handshake in meeting room",
      }),
      true,
    );
  });
});
