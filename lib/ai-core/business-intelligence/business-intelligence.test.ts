import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectionFromBusinessIntelligence } from "@/lib/ai-core/business-intelligence/detection";
import type { BusinessIntelligenceResult } from "@/lib/ai-core/business-intelligence/types";
import {
  repairImagePromptForProfile,
  validateGenerationAgainstBusinessProfile,
  validateImagePromptsAgainstProfile,
} from "@/lib/ai-core/business-intelligence/validate";
import { resolveIndustryVisualBrief } from "@/lib/ai-core/image-engine/section-strategies";
import { resolvePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";

const furnitureProfile: BusinessIntelligenceResult = {
  profile: {
    industry: "Furniture",
    subcategory: "Modern Furniture",
    audience: ["Homeowners", "Interior Designers"],
    tone: "Premium",
    visualStyle: ["Warm", "Elegant", "Minimal"],
    colorPalette: ["Earth tones", "Wood", "Neutral"],
    typography: ["Modern", "Readable"],
    photographyStyle: [
      "Luxury sofa in living room",
      "Bedroom furniture set",
      "Dining table interior",
      "Office furniture showroom",
    ],
    forbiddenSubjects: [
      "fashion",
      "clothing",
      "shoes",
      "apparel",
      "handbags",
    ],
    heroMessaging: ["Premium furniture for modern living"],
    recommendedSections: [
      "Featured Collections",
      "Living Room",
      "Bedroom",
      "Customer Reviews",
      "Delivery",
    ],
    primaryCta: "Shop Collection",
    secondaryCta: "Book Interior Consultation",
    navigationStyle: "collections-focused",
    designSystemHints: {
      mood: "Warm premium",
      layoutApproach: "showroom catalog",
    },
    routingIndustryId: "furniture",
    confidence: 0.92,
    reason: "Furniture showroom and home furnishing brand.",
  },
  source: "analysis",
  analyzedAt: new Date().toISOString(),
  promptHash: "test-furniture",
};

describe("business intelligence", () => {
  it("maps furniture profile to furniture routing id", () => {
    const detection = detectionFromBusinessIntelligence(furnitureProfile);
    assert.equal(detection.industryId, "furniture");
    assert.equal(detection.profile.label, "Furniture");
    assert.ok(
      detection.profile.imageRequirements.includes(
        "Luxury sofa in living room",
      ),
    );
  });

  it("uses photography style for visual briefs instead of ecommerce", () => {
    const brief = resolveIndustryVisualBrief(
      "ecommerce",
      "hero",
      0,
      undefined,
      furnitureProfile.profile,
    );
    assert.ok(brief.toLowerCase().includes("furniture"));
    assert.ok(!brief.toLowerCase().includes("fashion"));
  });

  it("rejects image prompts with forbidden fashion subjects", () => {
    const report = validateImagePromptsAgainstProfile({
      profile: furnitureProfile.profile,
      prompts: [
        {
          id: "hero",
          prompt: "Fashion retail clothing store hero wide shot",
          alt: "Clothing boutique",
        },
      ],
    });
    assert.equal(report.passed, false);
    assert.ok(report.issues.some((i) => i.includes("forbidden")));
  });

  it("repairs prompts with industry photography subjects", () => {
    const repaired = repairImagePromptForProfile(
      "Generic retail hero",
      furnitureProfile.profile,
      "Living room sofa",
    );
    assert.ok(repaired.includes("Furniture"));
    assert.ok(repaired.includes("NEVER show"));
    assert.ok(repaired.includes("Luxury sofa"));
  });

  it("selects furniture stock pack via routing id", () => {
    const url = resolvePremiumStockUrl({
      industry: "ecommerce",
      routingIndustryId: "furniture",
      role: "hero",
      seed: "hero",
    });
    assert.ok(url.includes("unsplash.com"));
    assert.ok(!url.includes("1483985988355"));
  });

  it("validates hero, sections, and CTA for industry", () => {
    const report = validateGenerationAgainstBusinessProfile({
      profile: furnitureProfile.profile,
      heroText: "Premium furniture for modern living",
      sectionLabels: ["Living Room", "Bedroom", "Delivery"],
      ctaLabels: ["Shop Collection"],
    });
    assert.equal(report.passed, true);
  });
});
