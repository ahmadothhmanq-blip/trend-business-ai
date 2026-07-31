import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  QUALITY_ASSURANCE_ENGINE_ID,
  QUALITY_SPECIFICATION_KEY,
  QUALITY_ASSURANCE_TRACE_KEY,
} from "@/lib/ai-core/quality-assurance/qashe-types";
import {
  runQualityAssuranceEngine,
  persistQualityAssuranceOnBrief,
  getQualityAssuranceTraceFromBrief,
  getQualitySpecificationFromBrief,
} from "@/lib/ai-core/quality-assurance/qashe-engine";
import { resolveQualityPolicy } from "@/lib/ai-core/quality-assurance/policies";
import {
  validateCrossEngineConsistency,
  validateArtifactContent,
  validateQualitySpecification,
  resetQualityValidationTraceCounter,
} from "@/lib/ai-core/quality-assurance/validate-pipeline";
import { buildQualitySpecification } from "@/lib/ai-core/quality-assurance/build-spec";
import {
  getQualityKnowledgeEntry,
  QUALITY_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/quality-assurance/knowledge-base/catalog";
import { applySelfHealing } from "@/lib/ai-core/quality-assurance/self-heal";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
  CoreQualityReport,
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

const baseReport: CoreQualityReport = {
  passed: true,
  dimensions: [
    { name: "structure", passed: true, issues: [] },
    { name: "content", passed: true, issues: [] },
  ],
  weakSections: [],
  improveApplied: false,
  issues: [],
  score: 85,
};

const cleanFiles = [
  {
    path: "app/page.tsx",
    content: `<html lang="en"><body><nav>Nav</nav><main><h1>Atelier Home</h1><p>hero collections premium furniture</p></main></body></html>`,
  },
];

const placeholderFiles = [
  {
    path: "app/page.tsx",
    content: `<html><body><h1>lorem ipsum</h1><a href="/undefined">broken</a></body></html>`,
  },
];

function briefWithTraces(): CoreBrief {
  return {
    productId: "website",
    language: "en",
    prompt: "Build a furniture showroom site",
    metadata: {
      planningReasoningTrace: { industryId: "furniture", entries: [{ id: "1" }] },
      contentIntelligenceTrace: { industryId: "furniture" },
      designIntelligenceTrace: { industryId: "furniture" },
      imageIntelligenceTrace: { industryId: "furniture" },
      seoAeoIntelligenceTrace: { industryId: "furniture" },
      contentIntelligenceValidation: { valid: true },
      designIntelligenceValidation: { valid: true },
      imageIntelligenceValidation: { valid: true },
      seoAeoIntelligenceValidation: { valid: true },
    },
  };
}

describe("EDS-007 Quality Assurance & Self-Healing Engine", () => {
  it("exposes QKB catalog with industry policies", () => {
    assert.ok(QUALITY_KNOWLEDGE_ENTRIES.length >= 5);
    const furniture = getQualityKnowledgeEntry("furniture");
    assert.equal(furniture.id, "quality-policy-furniture");
    assert.ok(furniture.requiredEngineTraces.includes("seoAeoIntelligenceTrace"));
    assert.ok(furniture.forbiddenPlaceholderPhrases.includes("lorem ipsum"));
  });

  it("resolves quality policy from QKB + master plan + WebsiteGenerationPlan", () => {
    const lookup = resolveQualityPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    });
    assert.equal(lookup.value.industryId, "furniture");
    assert.equal(lookup.entryId, "quality-policy-furniture");
    assert.ok(lookup.value.minConfidenceScore >= 65);
  });

  it("validates cross-engine consistency from brief traces", () => {
    resetQualityValidationTraceCounter();
    const policy = resolveQualityPolicy({ industryId: "furniture" }).value;
    const { results, entries } = validateCrossEngineConsistency(
      briefWithTraces(),
      policy,
    );
    assert.ok(entries.length > 0);
    const crossEngine = results.find((r) => r.dimension === "cross-engine");
    assert.ok(crossEngine?.passed);
  });

  it("detects placeholders, broken refs, and security issues in artifacts", () => {
    resetQualityValidationTraceCounter();
    const policy = resolveQualityPolicy({ industryId: "furniture" }).value;
    const { results } = validateArtifactContent(placeholderFiles, policy);
    const content = results.find((r) => r.dimension === "content");
    assert.equal(content?.passed, false);
    const security = results.find((r) => r.dimension === "security");
    assert.ok(security);
  });

  it("applies accessibility self-healing when landmarks are missing", () => {
    const policy = resolveQualityPolicy({ industryId: "business" }).value;
    const files = [{ path: "app/page.tsx", content: "<div><h1>Hello</h1></div>" }];
    const healed = applySelfHealing(files, policy);
    assert.ok(healed.actionsApplied.length > 0 || healed.remediationActions.length > 0);
  });

  it("builds QualitySpecification with confidence and remediation", () => {
    const policy = resolveQualityPolicy({
      industryId: "furniture",
      masterPlan: furniturePlan,
    }).value;
    const { spec } = buildQualitySpecification({
      policy,
      files: cleanFiles,
      strategy,
      profile,
      baseReport,
      brief: briefWithTraces(),
    });
    assert.equal(spec.version, "1");
    assert.ok(spec.confidenceScore >= 0);
    assert.ok(spec.validationResults.length > 0);
    assert.ok(spec.qualityReport.score >= 0);
  });

  it("runs QASHE engine and locks QualitySpecification", () => {
    resetQualityValidationTraceCounter();
    const result = runQualityAssuranceEngine({
      brief: briefWithTraces(),
      files: cleanFiles,
      strategy,
      profile,
      baseReport,
      masterPlan: furniturePlan,
      websiteGenerationPlan: furnitureWebsitePlan,
    });
    assert.equal(result.trace.engineId, QUALITY_ASSURANCE_ENGINE_ID);
    assert.equal(result.spec.version, "1");
    assert.ok(result.trace.entries.length > 0);
    assert.ok(result.spec.validationResults.length > 0);
    const validation = validateQualitySpecification(result.spec, result.policy);
    assert.equal(validation.valid, validation.errors.length === 0);
  });

  it("persists trace and spec on brief metadata", () => {
    const result = runQualityAssuranceEngine({
      brief: briefWithTraces(),
      files: cleanFiles,
      baseReport,
      masterPlan: furniturePlan,
    });
    const next = persistQualityAssuranceOnBrief(briefWithTraces(), result);
    assert.ok(getQualityAssuranceTraceFromBrief(next));
    assert.ok(getQualitySpecificationFromBrief(next));
    assert.ok(next.metadata?.[QUALITY_ASSURANCE_TRACE_KEY]);
    assert.ok(next.metadata?.[QUALITY_SPECIFICATION_KEY]);
  });

  it("withholds production approval when forbidden placeholders are present", () => {
    const result = runQualityAssuranceEngine({
      brief: briefWithTraces(),
      files: placeholderFiles,
      baseReport: { ...baseReport, passed: false, score: 40 },
      masterPlan: furniturePlan,
    });
    const contentFailed = result.spec.validationResults.some(
      (r) => r.dimension === "content" && !r.passed,
    );
    assert.ok(contentFailed);
  });
});
