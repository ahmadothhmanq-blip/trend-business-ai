import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateAgencyContent } from "@/lib/ai-core/content-intelligence/generate";
import {
  validateAgencyContent,
  resetContentValidationTraceCounter,
} from "@/lib/ai-core/content-intelligence/validate-content";
import { resolveContentPolicy } from "@/lib/ai-core/content-intelligence/policies";
import { runContentIntelligenceEngine } from "@/lib/ai-core/content-intelligence/engine";
import {
  resolveProductionContent,
  resolveProductionContentWithIntelligence,
} from "@/lib/ai-core/content-intelligence/resolve";
import { remediateAgencyContent } from "@/lib/ai-core/content-intelligence/remediate";
import {
  getContentKnowledgeEntry,
  CONTENT_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/content-intelligence/knowledge-base/catalog";
import { findContentCliches, stripContentCliches } from "@/lib/ai-core/content-intelligence/cliches";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";

const furnitureProfile = {
  industry: "Furniture",
  subcategory: "Showroom",
  audience: ["Homeowners"],
  tone: "Premium",
  visualStyle: ["Luxury"],
  colorPalette: [],
  typography: [],
  photographyStyle: ["Luxury sofa in living room"],
  forbiddenSubjects: ["fashion", "water"],
  heroMessaging: ["Premium furniture for modern living"],
  recommendedSections: ["Hero", "Collections", "Living Room", "Contact"],
  primaryCta: "Browse collections",
  navigationStyle: "standard",
  designSystemHints: { mood: "Premium", layoutApproach: "showroom" },
  routingIndustryId: "furniture",
  confidence: 0.9,
  reason: "test",
};

const furniturePlan: MasterWebsitePlan = {
  id: "test-plan",
  version: "1",
  createdAt: new Date().toISOString(),
  promptHash: "test",
  industry: "furniture",
  industryLabel: "Furniture",
  businessType: "Showroom",
  style: "Luxury",
  audience: "Homeowners",
  language: "en",
  tone: "luxury",
  template: "ti-ecommerce-atelier",
  theme: "luxury",
  layout: "card-first-masonry",
  hero: "Premium furniture",
  navigation: "standard",
  colorPalette: {
    primary: "#000",
    secondary: "#111",
    accent: "#222",
    background: "#fff",
    foreground: "#000",
    surface: "#f5f5f5",
  },
  typography: { display: "A", heading: "A", body: "B" },
  imageStyle: "luxury",
  imageKeywords: ["luxury sofa", "living room"],
  sections: [
    { key: "hero", label: "Hero" },
    { key: "collections", label: "Collections" },
    { key: "contact", label: "Contact" },
  ],
  ctaStyle: "luxury",
  ctaPrimary: "Browse collections",
  features: [],
  components: ["Hero", "Grid", "Footer"],
  locked: {
    industry: true,
    template: true,
    theme: true,
    layout: true,
    sections: true,
    images: true,
    hero: true,
    navigation: true,
  },
  sources: {
    industry: "test",
    template: "test",
    theme: "test",
    design: "test",
    route: "test",
    reasoningChain: [],
    validation: "passed",
  },
};

function sampleContent() {
  return generateAgencyContent({
    profile: furnitureProfile,
    brandKit: {
      companyName: "Atelier Home",
      tagline: "Premium furniture",
      colors: { primary: "#000", secondary: "#111", accent: "#222" },
      typography: { heading: "Inter", body: "Inter" },
    } as never,
    designDNA: { label: "Luxury", benchmark: "agency-elite" } as never,
  });
}

describe("EDS-003 Content Knowledge Base", () => {
  it("has unique CKB entry ids", () => {
    const ids = CONTENT_KNOWLEDGE_ENTRIES.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("resolves furniture CKB entry with forbidden subjects", () => {
    const entry = getContentKnowledgeEntry("furniture");
    assert.equal(entry.industryId, "furniture");
    assert.ok(entry.forbiddenSubjects.includes("fashion"));
  });

  it("resolves aliases to CKB entries", () => {
    assert.equal(getContentKnowledgeEntry("retail").industryId, "ecommerce");
  });
});

describe("EDS-003 Content Policy", () => {
  it("merges CKB + master plan + BI forbidden subjects", () => {
    const lookup = resolveContentPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      businessProfile: furnitureProfile,
    });
    assert.equal(lookup.value.industryId, "furniture");
    assert.equal(lookup.entryId, "content-policy-furniture");
    assert.ok(lookup.value.requiredSections.includes("Collections"));
    assert.ok(lookup.value.forbiddenSubjects.includes("fashion"));
    assert.ok(lookup.value.forbiddenSubjects.includes("water"));
    assert.ok(lookup.resolvedFrom.some((r) => r.startsWith("ckb:")));
  });
});

describe("EDS-003 Content Validation", () => {
  it("validates agency content against CKB policy", () => {
    resetContentValidationTraceCounter();
    const content = sampleContent();
    const validation = validateAgencyContent(
      content,
      resolveContentPolicy({
        industryId: "furniture",
        masterPlan: furniturePlan,
        businessProfile: furnitureProfile,
      }).value,
    );
    assert.equal(validation.valid, true);
    assert.ok(validation.trace.every((t) => t.knowledgeEntryId));
  });

  it("flags forbidden subjects in copy", () => {
    resetContentValidationTraceCounter();
    const content = sampleContent();
    content.about.story = "Visit our fashion runway showroom for swimwear.";
    const validation = validateAgencyContent(
      content,
      resolveContentPolicy({
        industryId: "furniture",
        masterPlan: furniturePlan,
        businessProfile: furnitureProfile,
      }).value,
    );
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some((e) => e.includes("Forbidden")));
  });

  it("detects and strips AI clichés", () => {
    const text = "We are a cutting-edge world-class game-changer.";
    assert.ok(findContentCliches(text).length >= 2);
    const cleaned = stripContentCliches(text);
    assert.ok(!cleaned.includes("cutting-edge"));
  });

  it("remediates clichés and aligns CTA", () => {
    const content = sampleContent();
    content.hero.headline = "A cutting-edge world-class furniture studio";
    const policy = resolveContentPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
    }).value;
    const { content: fixed, changes } = remediateAgencyContent(content, policy);
    assert.ok(changes.includes("hero.headline"));
    assert.ok(!findContentCliches(fixed.hero.headline).length);
    assert.equal(fixed.hero.ctaPrimary, "Browse collections");
  });
});

describe("EDS-003 Content Resolution Pipeline", () => {
  it("resolves agency content with full trace", () => {
    const content = sampleContent();
    const resolution = resolveProductionContentWithIntelligence({
      agencyContract: {
        version: "1",
        createdAt: new Date().toISOString(),
        promptHash: "t",
        businessIntelligence: {
          profile: furnitureProfile,
          source: "analysis",
          promptHash: "t",
          analyzedAt: new Date().toISOString(),
        },
        designDNA: { label: "Luxury", benchmark: "agency-elite" } as never,
        brandKit: {
          companyName: "Atelier Home",
          tagline: "Premium",
          colors: { primary: "#000", secondary: "#111", accent: "#222" },
          typography: { heading: "Inter", body: "Inter" },
          contactPlaceholders: { email: "hello@atelier.test", phone: "+1 555 0100" },
        } as never,
        content,
        qualityThresholds: {
          minOverallScore: 78,
          minIndustryRelevance: 75,
          minDesignScore: 70,
          minSeoScore: 65,
          requireBusinessValidation: true,
        },
      },
      brandName: "Atelier Home",
      masterPlan: furniturePlan,
      businessProfile: furnitureProfile,
    });
    assert.equal(resolution.source, "agency");
    assert.ok(resolution.pack.heroHeadline.length > 0);
    assert.equal(resolution.trace.contentSource, "agency");
    assert.ok(resolution.trace.entries.length > 5);
    assert.ok(resolution.trace.phases.includes("production-pack"));
  });

  it("falls back to static pack with trace when no agency contract", () => {
    const resolution = resolveProductionContentWithIntelligence({
      brandName: "Test Brand",
      masterPlan: furniturePlan,
      profile: { industry: "furniture", projectName: "Test" } as never,
    });
    assert.equal(resolution.source, "static");
    assert.ok(resolution.pack.heroHeadline);
    assert.equal(resolution.trace.contentSource, "static");
  });

  it("backward-compatible resolveProductionContent returns pack only", () => {
    const pack = resolveProductionContent({
      brandName: "Test",
      masterPlan: furniturePlan,
      profile: { industry: "furniture" } as never,
    });
    assert.ok(pack.heroHeadline);
  });

  it("content engine produces remediated content", () => {
    const content = sampleContent();
    content.hero.headline = "cutting-edge synergy platform";
    const result = runContentIntelligenceEngine({
      masterPlan: furniturePlan,
      businessProfile: furnitureProfile,
      agencyContent: content,
      brandName: "Atelier",
    });
    assert.ok(result.remediatedContent);
    assert.ok(result.trace.phases.includes("anti-cliche"));
  });
});

describe("EDS-003 routing and policy consistency", () => {
  it("furniture CKB policy aligns with AKB industry id", () => {
    const policy = resolveContentPolicy({
      industryId: "home-furniture-store",
      masterPlan: furniturePlan,
    });
    assert.equal(policy.value.industryId, "furniture");
    assert.equal(policy.entryId, "content-policy-furniture");
  });
});
