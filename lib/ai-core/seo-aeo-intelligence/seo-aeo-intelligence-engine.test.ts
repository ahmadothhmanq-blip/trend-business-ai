import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SEO_AEO_INTELLIGENCE_ENGINE_ID,
  SEO_AEO_INTELLIGENCE_SPEC_KEY,
  SEO_AEO_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-types";
import {
  runSeoAeoIntelligenceEngine,
  persistSeoAeoIntelligenceOnBrief,
  getSeoAeoIntelligenceTraceFromBrief,
  getSeoAeoSpecificationFromBrief,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-engine";
import { resolveSeoPolicy } from "@/lib/ai-core/seo-aeo-intelligence/policies";
import {
  validateSeoSpecification,
  resetSeoValidationTraceCounter,
} from "@/lib/ai-core/seo-aeo-intelligence/validate-seo";
import { buildSeoAeoSpecification } from "@/lib/ai-core/seo-aeo-intelligence/build-spec";
import {
  getSeoKnowledgeEntry,
  getAeoKnowledgeEntry,
  SEO_KNOWLEDGE_ENTRIES,
  AEO_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/seo-aeo-intelligence/knowledge-base/catalog";
import { buildSeoPackageFromStrategy } from "@/lib/ai-core/seo/build";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type {
  CoreBusinessProfile,
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
  imageKeywords: ["luxury sofa", "showroom"],
  sections: [{ key: "hero", label: "Hero" }],
  ctaStyle: "luxury",
  ctaPrimary: "Browse collections",
  features: [],
  components: ["Hero"],
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
  sections: ["Hero"],
  components: ["Hero"],
  hero: "Premium furniture",
  imageKeywords: ["luxury sofa"],
  imagePolicy: {
    routingIndustryId: "furniture",
    forbiddenSubjects: ["fashion"],
    photographyStyle: ["luxury showroom"],
  },
  businessRules: {
    primaryCta: "Browse collections",
    recommendedSections: ["Hero"],
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
    {
      name: "Collections",
      path: "/collections",
      purpose: "Product catalog",
      keySections: ["Grid"],
    },
  ],
  sectionPlan: [
    {
      id: "hero",
      page: "Home",
      name: "Hero",
      goal: "Introduce brand",
      contentNotes: "Premium furniture",
    },
  ],
  conversionFunnel: ["browse", "contact"],
  contentStructure: ["hero", "collections"],
  contentStrategy: {
    brandVoice: "luxury",
    messagingPillars: ["Premium furniture"],
    proofPoints: ["Showroom quality"],
    objectionHandlers: [],
    seoTopics: ["luxury furniture", "showroom"],
  },
  ctas: ["Browse collections"],
  seoFocus: ["luxury furniture", "premium sofa"],
} as CoreProductStrategy;

const profile = {
  projectName: "Atelier Home",
  industry: "furniture",
  targetAudience: "Homeowners",
  businessGoals: ["Showcase collections"],
  offer: "Premium furniture",
  tone: "luxury",
  geography: "New York",
  competitors: [],
  kpis: [],
  summary: "Luxury furniture showroom",
  requiredSections: ["Hero", "Collections"],
} as CoreBusinessProfile;

describe("EDS-006 SEO & AEO Intelligence Engine", () => {
  it("exposes SKB and AEO KB catalogs", () => {
    assert.ok(SEO_KNOWLEDGE_ENTRIES.length >= 5);
    assert.ok(AEO_KNOWLEDGE_ENTRIES.length >= 4);
    const furniture = getSeoKnowledgeEntry("furniture");
    assert.equal(furniture.id, "seo-policy-furniture");
    assert.equal(furniture.primaryIntent, "commercial");
    const aeo = getAeoKnowledgeEntry(furniture.aeoKnowledgeEntryId);
    assert.ok(aeo.citationSignals.length > 0);
  });

  it("resolves SEO policy from SKB + master plan + WebsiteGenerationPlan", () => {
    const lookup = resolveSeoPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    });
    assert.equal(lookup.entryId, "seo-policy-furniture");
    assert.ok(lookup.value.lockedKeywords.includes("luxury sofa"));
    assert.ok(lookup.resolvedFrom.some((r) => r.startsWith("skb:")));
    assert.ok(lookup.resolvedFrom.some((r) => r.startsWith("aeo:")));
  });

  it("builds SEOSpecification with metadata, schema, and AEO signals", () => {
    const policy = resolveSeoPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    }).value;
    const spec = buildSeoAeoSpecification({
      policy,
      strategy,
      profile,
      industryId: "furniture",
    });
    assert.equal(spec.version, "1");
    assert.ok(spec.metadata.title.length > 0);
    assert.ok(spec.metadata.description.length >= policy.minDescriptionLength);
    assert.ok(spec.structuredData.some((s) => s.type === "Organization"));
    assert.ok(spec.structuredData.some((s) => s.type === "WebSite"));
    assert.ok(spec.internalLinks.length >= policy.internalLinkingMin);
    assert.ok(spec.aeo.readinessScore > 0);
    assert.ok(spec.featuredSnippets.length > 0);
    assert.ok(spec.voiceSearch.conversationalQueries.length > 0);
  });

  it("validates SEO specification against SKB policy", () => {
    resetSeoValidationTraceCounter();
    const policy = resolveSeoPolicy({ industryId: "furniture" }).value;
    const spec = buildSeoAeoSpecification({
      policy,
      strategy,
      profile,
      industryId: "furniture",
    });
    const validation = validateSeoSpecification(spec, policy);
    assert.equal(validation.valid, true);
    assert.ok(validation.trace.some((t) => t.knowledgeEntryId === policy.knowledgeEntryId));
  });

  it("runs full SAIE pipeline with structured trace", () => {
    const result = runSeoAeoIntelligenceEngine({
      strategy,
      profile,
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    });
    assert.equal(result.trace.engineId, SEO_AEO_INTELLIGENCE_ENGINE_ID);
    assert.ok(result.trace.entries.length >= 4);
    assert.ok(result.trace.phases.includes("policy-resolve"));
    assert.ok(result.trace.phases.includes("spec-lock"));
    assert.equal(result.spec.industryId, "furniture");
    assert.ok(result.spec.seoPackage.metadata.title.length > 0);
  });

  it("buildSeoPackageFromStrategy delegates to SAIE (backward compatible)", () => {
    const pkg = buildSeoPackageFromStrategy({ strategy, profile, industryId: "furniture" });
    assert.ok(pkg.metadata.title);
    assert.ok(pkg.structuredData.length >= 2);
  });

  it("persists trace and spec on brief metadata", () => {
    const result = runSeoAeoIntelligenceEngine({
      strategy,
      profile,
      industryId: "furniture",
      masterPlan: furniturePlan,
    });
    const brief: CoreBrief = {
      prompt: "Luxury furniture showroom",
      productId: "website",
      metadata: {},
    };
    const updated = persistSeoAeoIntelligenceOnBrief(brief, result);
    assert.ok(updated.metadata?.[SEO_AEO_INTELLIGENCE_TRACE_KEY]);
    assert.ok(updated.metadata?.[SEO_AEO_INTELLIGENCE_SPEC_KEY]);
    assert.equal(
      getSeoAeoIntelligenceTraceFromBrief(updated)?.engineId,
      SEO_AEO_INTELLIGENCE_ENGINE_ID,
    );
    assert.equal(
      getSeoAeoSpecificationFromBrief(updated)?.industryId,
      "furniture",
    );
  });
});
