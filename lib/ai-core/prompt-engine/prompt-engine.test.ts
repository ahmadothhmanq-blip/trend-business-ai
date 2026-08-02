import assert from "node:assert/strict";
import { describe, it, after } from "node:test";
import { websiteFilePrompt } from "@/lib/ai/prompts/website";
import {
  assemblePrompt,
  compactAnalysisMetadata,
  compactBlueprintMetadata,
  compactMergedProjectMetadata,
  getPromptFragment,
  listPromptFragments,
  prepareFilePromptPayload,
} from "@/lib/ai-core/prompt-engine";

const sampleAnalysis = {
  projectName: "Luxury Spa",
  projectType: "website",
  pages: ["Home", "Services", "Contact"],
  features: ["booking", "gallery"],
  designSystem: ["luxury", "minimal"],
  technologies: ["next", "tailwind"],
  databaseProvider: "none",
  requiresAuth: false,
  requiresDatabase: false,
  businessProfile: {
    projectName: "Luxury Spa",
    industry: "wellness",
    targetAudience: "affluent urban professionals",
    businessGoals: ["bookings", "brand awareness"],
    offer: "Premium spa treatments ".repeat(40),
    tone: "calm",
    geography: "Dubai",
    competitors: ["Comp A", "Comp B"],
    kpis: ["leads"],
    summary: "A premium wellness destination ".repeat(50),
    requiredSections: ["hero", "services", "testimonials"],
  },
};

const sampleBlueprint = {
  title: "Luxury Spa",
  description: "Premium wellness website ".repeat(30),
  pages: ["Home", "Services", "Contact"],
  sections: ["hero", "services", "cta"],
  colorPalette: ["#111", "#fff"],
  typography: ["Inter"],
  components: ["HeroLuxury", "ServicesModern"],
  content: ["Welcome copy ".repeat(20)],
  seo: ["luxury spa dubai"],
  roadmap: ["launch"],
};

const sampleDynamicPlan = {
  complexity: "professional",
  estimatedFileCount: 22,
  layouts: ["app/layout.tsx"],
  pages: ["app/page.tsx"],
  components: ["components/sections/HeroLuxury.tsx"],
  apiRoutes: [],
  hooks: [],
  utilities: ["lib/utils.ts"],
  types: [],
  configs: ["package.json"],
  unusedNoise: "should be removed",
};

const sampleStrategy = {
  positioning: "Premium wellness",
  sitemap: ["/", "/services"],
  pages: [
    { name: "Home", path: "/", purpose: "Convert", keySections: ["hero"] },
    { name: "Services", path: "/services", purpose: "Explain", keySections: ["services"] },
  ],
  sectionPlan: [
    {
      id: "hero",
      page: "Home",
      name: "HeroLuxury",
      goal: "Capture attention",
      contentNotes: "Long notes ".repeat(40),
    },
    {
      id: "services",
      page: "Home",
      name: "ServicesModern",
      goal: "Explain services",
      contentNotes: "More notes ".repeat(40),
    },
  ],
  conversionFunnel: ["awareness", "booking"],
  contentStructure: ["hero-first"],
  contentStrategy: { brandVoice: "calm luxury" },
  ctas: ["Book now"],
  seoFocus: ["luxury spa"],
};

const sampleDesignSystem = {
  style: "luxury",
  stylePreset: "luxury",
  industryPattern: "wellness",
  colors: { primary: "#111111", secondary: "#fff", accent: "#c9a86c" },
  typography: { headingFont: "Playfair", bodyFont: "Inter" },
  layoutRules: ["editorial spacing"],
  layoutStyle: "editorial",
  uiPatterns: ["luxury-hero"],
  componentPalette: ["HeroLuxury", "ServicesModern"],
  spacingScale: ["4", "8", "16"],
  borderRadius: "12px",
  shadowStyle: "soft",
  premium: { package: "heavy nested object ".repeat(100) },
};

describe("prompt-engine fragment registry", () => {
  it("lists canonical shared fragments", () => {
    const fragments = listPromptFragments();
    assert.equal(fragments.length, 3);
    assert.ok(getPromptFragment("file-generation-rules").content.includes("Return only JSON"));
  });
});

describe("prompt-engine metadata compaction", () => {
  it("truncates verbose analysis fields", () => {
    const compact = compactAnalysisMetadata(sampleAnalysis) as Record<string, unknown>;
    const profile = compact.businessProfile as Record<string, unknown>;
    assert.ok(String(profile.summary).length < String(sampleAnalysis.businessProfile.summary).length);
  });

  it("dedupes blueprint pages when identical to analysis", () => {
    const compact = compactBlueprintMetadata(
      sampleBlueprint,
      sampleAnalysis,
    ) as Record<string, unknown>;
    assert.equal(compact.pages, undefined);
  });

  it("merges project metadata without duplication", () => {
    const merged = compactMergedProjectMetadata({
      analysis: sampleAnalysis,
      blueprint: sampleBlueprint,
      dynamicPlan: sampleDynamicPlan,
    });
    assert.ok(merged.analysis);
    assert.ok(merged.blueprint);
    assert.ok(merged.plan);
    assert.equal((merged.plan as Record<string, unknown>).unusedNoise, undefined);
  });
});

describe("prompt-engine builder", () => {
  const originalEnv = process.env.WB_PROMPT_OPTIMIZATION;

  after(() => {
    if (originalEnv === undefined) {
      delete process.env.WB_PROMPT_OPTIMIZATION;
    } else {
      process.env.WB_PROMPT_OPTIMIZATION = originalEnv;
    }
  });

  it("returns legacy payload when optimization disabled", () => {
    process.env.WB_PROMPT_OPTIMIZATION = "0";
    const result = prepareFilePromptPayload({
      analysis: sampleAnalysis,
      blueprint: sampleBlueprint,
      dynamicPlan: sampleDynamicPlan,
      projectTree: [],
    });
    assert.equal(result.stats.enabled, false);
    assert.equal(result.stats.metadataReductionPercent, 0);
  });

  it("reduces metadata when optimization enabled", () => {
    process.env.WB_PROMPT_OPTIMIZATION = "1";
    const result = prepareFilePromptPayload({
      analysis: sampleAnalysis,
      blueprint: sampleBlueprint,
      dynamicPlan: sampleDynamicPlan,
      projectTree: [{ path: "app/page.tsx", category: "pages", purpose: "x".repeat(300) }],
      strategy: sampleStrategy,
      designSystem: sampleDesignSystem,
      filePlan: {
        path: "components/sections/HeroLuxury.tsx",
        category: "components",
      },
    });
    assert.equal(result.stats.enabled, true);
    assert.ok(result.stats.metadataReductionPercent > 0);
  });

  it("assembles website prompts deterministically", () => {
    process.env.WB_PROMPT_OPTIMIZATION = "1";
    const args = {
      analysis: sampleAnalysis,
      blueprint: sampleBlueprint,
      dynamicPlan: sampleDynamicPlan,
      projectTree: [{ path: "app/page.tsx", category: "pages", purpose: "home" }],
      strategy: sampleStrategy,
      designSystem: sampleDesignSystem,
      filePlan: { path: "components/sections/HeroLuxury.tsx", category: "components" },
      productId: "website" as const,
    };

    const first = assemblePrompt(args, (compacted) =>
      websiteFilePrompt({
        input: {
          prompt: "Luxury spa",
          projectType: "website",
          projectKind: "website",
          language: "en",
          theme: "luxury",
          features: [],
        },
        analysis: compacted.analysis,
        blueprint: compacted.blueprint,
        dynamicPlan: compacted.dynamicPlan,
        filePlan: {
          path: "components/sections/HeroLuxury.tsx",
          purpose: "Hero",
          language: "tsx",
          category: "components",
        },
        projectTree: compacted.projectTree,
        existingFiles: [],
        strategy: compacted.strategy,
        designSystem: compacted.designSystem,
      }),
    );

    const second = assemblePrompt(args, (compacted) =>
      websiteFilePrompt({
        input: {
          prompt: "Luxury spa",
          projectType: "website",
          projectKind: "website",
          language: "en",
          theme: "luxury",
          features: [],
        },
        analysis: compacted.analysis,
        blueprint: compacted.blueprint,
        dynamicPlan: compacted.dynamicPlan,
        filePlan: {
          path: "components/sections/HeroLuxury.tsx",
          purpose: "Hero",
          language: "tsx",
          category: "components",
        },
        projectTree: compacted.projectTree,
        existingFiles: [],
        strategy: compacted.strategy,
        designSystem: compacted.designSystem,
      }),
    );

    assert.equal(first.prompt, second.prompt);
    assert.ok(first.prompt.includes("Generate exactly one production-ready file"));
    assert.ok(first.prompt.includes("FILE_GENERATION_RULES") === false);
    assert.ok(first.prompt.includes("Rules:"));
    assert.ok(first.stats.metadataReductionPercent > 0);
  });
});
