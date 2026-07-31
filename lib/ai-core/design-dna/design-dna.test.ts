import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDesignDNA } from "@/lib/ai-core/design-dna/resolve";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

const furnitureProfile: BusinessIntelligenceProfile = {
  industry: "Furniture",
  subcategory: "Modern Furniture",
  audience: ["Homeowners"],
  tone: "Premium",
  visualStyle: ["Warm", "Elegant"],
  colorPalette: ["Earth tones", "Wood"],
  typography: ["Modern"],
  photographyStyle: ["Living room sofa"],
  forbiddenSubjects: ["fashion"],
  heroMessaging: ["Premium furniture for modern living"],
  recommendedSections: ["Collections", "Living Room", "Bedroom", "Contact"],
  primaryCta: "Shop Collection",
  navigationStyle: "collections",
  designSystemHints: { mood: "Warm premium", layoutApproach: "showroom" },
  routingIndustryId: "furniture",
  confidence: 0.9,
  reason: "Furniture company",
};

describe("design DNA engine", () => {
  it("resolves stripe-quality from prompt", () => {
    const dna = resolveDesignDNA({
      prompt: "Create a stripe-quality SaaS website",
      businessProfile: { ...furnitureProfile, industry: "SaaS", subcategory: "B2B Platform" },
    });
    assert.equal(dna.benchmark, "stripe-quality");
  });

  it("resolves apple-quality for luxury furniture", () => {
    const dna = resolveDesignDNA({
      prompt: "Create a luxury furniture website",
      businessProfile: furnitureProfile,
    });
    assert.equal(dna.benchmark, "apple-quality");
  });

  it("never copies brand names in philosophy", () => {
    const dna = resolveDesignDNA({
      prompt: "apple-quality design",
      businessProfile: furnitureProfile,
    });
    const combined = dna.philosophy.join(" ").toLowerCase();
    assert.ok(!combined.includes("apple inc"));
    assert.ok(dna.philosophy.length >= 4);
  });

  it("personalizes section flow from business profile", () => {
    const dna = resolveDesignDNA({
      prompt: "furniture website",
      businessProfile: furnitureProfile,
    });
    assert.ok(dna.layout.sectionFlow.includes("Living Room"));
  });
});
