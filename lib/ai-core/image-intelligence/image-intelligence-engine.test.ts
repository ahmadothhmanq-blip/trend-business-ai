import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  IMAGE_INTELLIGENCE_ENGINE_ID,
  IMAGE_INTELLIGENCE_SPEC_KEY,
  IMAGE_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/image-intelligence/iie-types";
import {
  runImageIntelligenceEngine,
  persistImageIntelligenceOnBrief,
  getImageIntelligenceTraceFromBrief,
  getImageSystemSpecFromBrief,
} from "@/lib/ai-core/image-intelligence/iie-engine";
import { resolveImagePolicy } from "@/lib/ai-core/image-intelligence/policies";
import {
  validateImageSpecifications,
  resetImageValidationTraceCounter,
} from "@/lib/ai-core/image-intelligence/validate-image";
import { buildImageSystemSpec } from "@/lib/ai-core/image-intelligence/build-spec";
import {
  getImageKnowledgeEntry,
  IMAGE_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/image-intelligence/knowledge-base/catalog";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { resolveDesignPolicy } from "@/lib/ai-core/design-intelligence/policies";
import { analyzeDesignIntelligence } from "@/lib/ai-core/design-intelligence/analyze";
import { buildDesignSystemSpec as buildDieSpec } from "@/lib/ai-core/design-intelligence/build-spec";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

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
  layout: "commerce-grid",
  hero: "Premium furniture",
  navigation: "standard",
  colorPalette: {
    primary: "#2c1810",
    secondary: "#4a3728",
    accent: "#c9a96e",
    background: "#faf8f5",
    foreground: "#1a1410",
    surface: "#f0ebe3",
  },
  typography: { display: "Playfair Display", heading: "Playfair Display", body: "Inter" },
  imageStyle: "luxury",
  imageKeywords: ["luxury sofa", "living room showroom"],
  sections: [
    { key: "hero", label: "Hero" },
    { key: "collections", label: "Collections" },
  ],
  ctaStyle: "luxury",
  ctaPrimary: "Browse collections",
  features: [],
  components: ["Hero", "Grid"],
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

const furnitureWebsitePlan: WebsiteGenerationPlan = {
  version: "1",
  industryId: "furniture",
  industryLabel: "Furniture",
  routingIndustryId: "furniture",
  layoutFamily: "commerce-grid",
  structureTemplateId: "ecommerce-atelier",
  layoutTemplateIntelligenceId: "ti-ecommerce-atelier",
  layoutStructure: "commerce-grid",
  pageTopology: "single-page",
  visualThemePresetId: "luxury",
  visualThemeTemplateIntelligenceId: "ti-luxury",
  premiumTemplateId: "premium-furniture",
  sections: ["Hero", "Collections"],
  components: ["Hero", "Grid"],
  hero: "Premium furniture",
  imageKeywords: ["luxury sofa", "showroom"],
  imagePolicy: {
    routingIndustryId: "furniture",
    forbiddenSubjects: ["fashion"],
    photographyStyle: ["luxury showroom"],
  },
  businessRules: {
    primaryCta: "Browse collections",
    recommendedSections: ["Hero", "Collections"],
    confidence: 0.9,
    subcategory: "Showroom",
  },
  route: {
    version: "1",
    industryId: "furniture",
    structureTemplateId: "ecommerce-atelier",
    layoutTemplateIntelligenceId: "ti-ecommerce-atelier",
    visualThemePresetId: "luxury",
    visualThemeTemplateIntelligenceId: "ti-luxury",
    premiumTemplateId: "premium-furniture",
    layoutFamily: "commerce-grid",
    pageTopology: "single-page",
    reason: "furniture commerce routing",
    confidence: 0.9,
    reasoningChain: ["furniture → commerce-grid"],
  },
  reasoningChain: ["furniture → commerce-grid"],
  confidence: 0.9,
};

const designSystemSpec = buildDieSpec({
  intelligence: analyzeDesignIntelligence({
    industryId: "furniture",
    preferredStyle: "luxury",
  }),
  policy: resolveDesignPolicy({
    industryId: "furniture",
    masterPlan: furniturePlan,
    websiteGenerationPlan: furnitureWebsitePlan,
  }).value,
  brandDna: null,
});

const strategy = {
  positioning: "Premium furniture showroom",
  sitemap: ["/"],
  pages: [
    {
      name: "Home",
      path: "/",
      purpose: "Showcase collections",
      keySections: ["Hero", "Collections"],
    },
  ],
  sectionPlan: [
    {
      id: "hero",
      page: "Home",
      name: "Hero",
      goal: "Introduce brand",
      contentNotes: "Premium furniture hero",
    },
    {
      id: "collections",
      page: "Home",
      name: "Collections",
      goal: "Showcase products",
      contentNotes: "Product grid",
    },
  ],
  conversionFunnel: ["awareness", "browse", "contact"],
  contentStructure: ["hero", "collections"],
  contentStrategy: {
    brandVoice: "luxury",
    messagingPillars: ["Premium furniture"],
    proofPoints: ["Showroom quality"],
    objectionHandlers: [],
    seoTopics: ["luxury furniture"],
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

const profile = {
  projectName: "Atelier Home",
  industry: "furniture",
  targetAudience: "Homeowners",
  businessGoals: ["Showcase collections"],
  offer: "Premium furniture",
  tone: "luxury",
  geography: "US",
  competitors: [],
  kpis: [],
  summary: "Luxury furniture showroom",
  requiredSections: ["Hero", "Collections"],
} as CoreBusinessProfile;

describe("EDS-005 Image Intelligence Engine", () => {
  it("exposes IKB catalog with industry image policies", () => {
    assert.ok(IMAGE_KNOWLEDGE_ENTRIES.length >= 5);
    const furniture = getImageKnowledgeEntry("furniture");
    assert.equal(furniture.id, "image-policy-furniture");
    assert.ok(furniture.forbiddenSubjects.includes("fashion"));
    assert.ok(furniture.requiredPurposes.includes("hero"));
  });

  it("resolves image policy from IKB + master plan + DIE spec", () => {
    const lookup = resolveImagePolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
      designSystemSpec,
    });
    assert.equal(lookup.entryId, "image-policy-furniture");
    assert.ok(lookup.value.forbiddenSubjects.includes("fashion"));
    assert.ok(lookup.value.lockedKeywords.includes("luxury sofa"));
    assert.ok(lookup.resolvedFrom.some((r) => r.startsWith("ikb:")));
    assert.ok(lookup.resolvedFrom.includes("design-system-spec"));
  });

  it("builds ImageSystemSpec with color harmony from DesignSystemSpec", () => {
    const policy = resolveImagePolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      designSystemSpec,
    }).value;
    const spec = buildImageSystemSpec({
      policy,
      designSystemSpec,
      strategy,
      designSystem,
      profile,
      masterPlan: furniturePlan,
      maxImages: 8,
    });
    assert.equal(spec.version, "1");
    assert.equal(spec.colorHarmony.primary, "#2c1810");
    assert.ok(spec.specifications.length >= policy.minImageCount);
    assert.ok(spec.specifications.every((s) => s.providerPrompt.length > 20));
    assert.ok(spec.specifications.every((s) => s.accessibility.altText.length > 0));
    assert.ok(spec.specifications.every((s) => s.seo.description.length > 0));
  });

  it("validates specifications against IKB policy", () => {
    resetImageValidationTraceCounter();
    const policy = resolveImagePolicy({ industryId: "furniture" }).value;
    const spec = buildImageSystemSpec({
      policy,
      strategy,
      designSystem,
      profile,
      maxImages: 8,
    });
    const validation = validateImageSpecifications(spec, policy);
    assert.equal(validation.valid, true);
    assert.ok(validation.trace.some((t) => t.knowledgeEntryId === policy.knowledgeEntryId));
  });

  it("runs full IIE pipeline with structured trace", () => {
    const result = runImageIntelligenceEngine({
      strategy,
      designSystem,
      profile,
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
      designSystemSpec,
      preferredStyle: "luxury",
      maxImages: 8,
    });
    assert.equal(result.trace.engineId, IMAGE_INTELLIGENCE_ENGINE_ID);
    assert.ok(result.trace.entries.length >= 4);
    assert.ok(result.trace.phases.includes("policy-resolve"));
    assert.ok(result.trace.phases.includes("spec-lock"));
    assert.equal(result.spec.industryId, "furniture");
    assert.ok(result.spec.specifications.length > 0);
    assert.ok(
      result.spec.specifications.every(
        (s) => !s.providerPrompt.toLowerCase().includes("fashion"),
      ),
    );
  });

  it("persists trace and spec on brief metadata", () => {
    const result = runImageIntelligenceEngine({
      strategy,
      designSystem,
      profile,
      masterPlan: furniturePlan,
      designSystemSpec,
      maxImages: 6,
    });
    const brief: CoreBrief = {
      prompt: "Luxury furniture showroom",
      productId: "website",
      metadata: {},
    };
    const updated = persistImageIntelligenceOnBrief(brief, result);
    assert.ok(updated.metadata?.[IMAGE_INTELLIGENCE_TRACE_KEY]);
    assert.ok(updated.metadata?.[IMAGE_INTELLIGENCE_SPEC_KEY]);
    assert.equal(
      getImageIntelligenceTraceFromBrief(updated)?.engineId,
      IMAGE_INTELLIGENCE_ENGINE_ID,
    );
    assert.equal(
      getImageSystemSpecFromBrief(updated)?.industryId,
      "furniture",
    );
  });
});
