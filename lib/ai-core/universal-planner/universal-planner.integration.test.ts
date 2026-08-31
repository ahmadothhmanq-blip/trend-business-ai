import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  MAOE_SHARED_MEMORY_KEY,
  MAOE_WORKFLOW_STATE_KEY,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-types";
import { PLANNING_REASONING_TRACE_KEY } from "@/lib/ai-core/planning-reasoning-engine/types";
import {
  buildUniversalBlueprintCore,
  getUniversalBlueprintFromBrief,
  IMPLEMENTED_SERVICE_IDS,
  REQUIRED_SERVICE_BLUEPRINT_KEYS,
  runUniversalPlanner,
  safeParseUniversalBlueprint,
  UNIVERSAL_BLUEPRINT_KEY,
  UNIVERSAL_CLARIFICATIONS_KEY,
  UNIVERSAL_REQUIREMENTS_KEY,
  UNIVERSAL_SERVICE_PLANS_KEY,
  validateServiceBlueprintEntry,
  validateUniversalAdapterRegistry,
} from "@/lib/ai-core/universal-planner";
import { analyzeUniversalRequirements } from "@/lib/ai-core/universal-planner/requirements/analyzer";
import { buildUniversalServicePlans } from "@/lib/ai-core/universal-planner/service-router";
import { PLANNING_REASONING_ENGINE_ID, PLANNING_REASONING_ENGINE_VERSION } from "@/lib/ai-core/planning-reasoning-engine/types";
import type { UniversalBlueprintCore } from "@/lib/ai-core/universal-planner/types";

function brief(prompt: string, productId: string): CoreBrief {
  return {
    prompt,
    productId,
    language: "English",
    features: ["auth", "dashboard", "analytics"],
    metadata: {},
  };
}

function briefWithLockedPlan(prompt: string, productId: string): CoreBrief {
  const promptHash = createHash("sha256").update(prompt.trim()).digest("hex").slice(0, 16);
  return {
    ...brief(prompt, productId),
    metadata: {
      masterWebsitePlan: {
        id: "locked-plan-test",
        version: "1",
        createdAt: new Date().toISOString(),
        promptHash,
        industry: "business",
        industryLabel: "Business",
        businessType: "General",
        style: "professional",
        audience: "customers",
        language: "English",
        tone: "Professional",
        template: "corporate-business",
        theme: "corporate-business",
        layout: "business",
        hero: "Professional services",
        navigation: "standard",
        colorPalette: {
          primary: "#1f2937",
          secondary: "#111827",
          accent: "#2563eb",
          background: "#ffffff",
          foreground: "#111827",
          surface: "#f8fafc",
        },
        typography: {
          display: "Geist",
          heading: "Geist",
          body: "Geist",
        },
        imageStyle: "professional",
        imageKeywords: ["business", "professional"],
        sections: [],
        ctaStyle: "consultation",
        features: [],
        components: [],
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
          reasoningChain: ["test"],
          validation: "test",
        },
      },
    },
  };
}

function blueprintCoreForBrief(inputBrief: CoreBrief): UniversalBlueprintCore {
  const requirements = analyzeUniversalRequirements(inputBrief);
  return buildUniversalBlueprintCore({
    briefId: "test-brief-id",
    industryDetection: {
      industryId: "business",
      confidence: 0.9,
      reason: "integration test",
      source: "default",
      profile: {
        id: "business",
        label: "Business",
        description: "General business",
        keywords: [],
        recommendedPages: ["home"],
        requiredSections: ["hero"],
        ctaTypes: ["contact"],
        contentStyle: "professional",
        designStyle: "corporate",
        designPreset: "corporate",
        layoutStyle: "corporate-trust",
        industryPattern: "corporate",
        imageRequirements: [],
        requiredFeatures: [],
      },
    },
    requirements,
    clarificationQuestions: [],
    planningTrace: {
      version: "1",
      engineId: PLANNING_REASONING_ENGINE_ID,
      engineVersion: PLANNING_REASONING_ENGINE_VERSION,
      promptHash: "test-hash",
      createdAt: new Date().toISOString(),
      phases: [],
      entries: [],
      summary: "integration test",
    },
  });
}

describe("universal planner integration", () => {
  it("validates full planner request flow and persistence", async () => {
    const result = await runUniversalPlanner({
      brief: briefWithLockedPlan(
        "Create a professional restaurant website with menu and booking dashboard.",
        "website",
      ),
    });

    const parsed = safeParseUniversalBlueprint(result.blueprint);
    assert.equal(parsed.success, true);
    assert.equal(result.blueprint.version, "1");

    assert.ok(result.blueprint.industry.industryId.length > 0);
    assert.ok(result.blueprint.intent.summary.length > 0);
    assert.ok(typeof result.blueprint.requirements.auth.required === "boolean");
    assert.ok(Array.isArray(result.blueprint.clarifications.questions));

    assert.ok(result.blueprint.selectedServiceId.length > 0);
    assert.ok(result.blueprint.executionPlan.orderedServices.length > 0);

    assert.ok(result.brief.metadata?.[UNIVERSAL_BLUEPRINT_KEY]);
    assert.ok(result.brief.metadata?.[UNIVERSAL_REQUIREMENTS_KEY]);
    assert.ok(result.brief.metadata?.[UNIVERSAL_CLARIFICATIONS_KEY]);
    assert.ok(result.brief.metadata?.[UNIVERSAL_SERVICE_PLANS_KEY]);
    assert.ok(result.brief.metadata?.[MAOE_SHARED_MEMORY_KEY]);
    assert.ok(getUniversalBlueprintFromBrief(result.brief));

    assert.ok(result.brief.metadata?.[PLANNING_REASONING_TRACE_KEY]);
    assert.ok(result.planningTrace.promptHash.length > 0);
    assert.ok(result.blueprint.trace.orchestrationTraceRef);

    const workflowState = result.brief.metadata?.[MAOE_WORKFLOW_STATE_KEY] as
      | { status?: string; completedAt?: string }
      | undefined;
    assert.ok(workflowState);
    assert.ok(workflowState?.status === "completed");
    assert.ok(Boolean(workflowState?.completedAt));
  });

  it("registers dedicated adapters for every platform service", () => {
    const registry = validateUniversalAdapterRegistry();
    assert.equal(registry.ok, true, JSON.stringify(registry));
    assert.equal(IMPLEMENTED_SERVICE_IDS.length, 14);
  });

  it("routes all service keywords to supported adapters consuming universal blueprint", () => {
    const cases: Array<{ prompt: string; productId: string; serviceId: string }> = [
      { prompt: "Build an SEO website for consulting", productId: "website", serviceId: "website-builder" },
      { prompt: "Build a CRUD web app with auth", productId: "webapp", serviceId: "app-builder" },
      { prompt: "Create a landing page for paid campaign", productId: "landing-page", serviceId: "landing-page-builder" },
      { prompt: "Design a premium logo for fintech startup", productId: "logo-designer", serviceId: "logo-designer" },
      { prompt: "Build brand identity and guidelines", productId: "brand-designer", serviceId: "brand-designer" },
      { prompt: "Generate campaign hero images", productId: "image-generator", serviceId: "image-generator" },
      { prompt: "Storyboard a product launch video", productId: "video-studio", serviceId: "video-studio" },
      { prompt: "Write editorial content calendar", productId: "content-studio", serviceId: "content-studio" },
      { prompt: "Plan marketing campaign funnel", productId: "marketing-ai", serviceId: "marketing" },
      { prompt: "Schedule Instagram posts for brand", productId: "social-media", serviceId: "social-media" },
      { prompt: "Score CRM pipeline leads", productId: "crm", serviceId: "crm" },
      { prompt: "Forecast ERP inventory demand", productId: "erp", serviceId: "erp" },
      { prompt: "Manage organization projects workspace", productId: "business-manager", serviceId: "business-manager" },
      { prompt: "Generate BI executive analytics report", productId: "business-intelligence", serviceId: "business-intelligence" },
    ];

    for (const testCase of cases) {
      const inputBrief = brief(testCase.prompt, testCase.productId);
      const core = blueprintCoreForBrief(inputBrief);
      const requirements = analyzeUniversalRequirements(inputBrief);
      const plans = buildUniversalServicePlans(core, requirements);
      const plan = plans.find((entry) => entry.serviceId === testCase.serviceId);

      assert.ok(plan, `missing adapter plan for ${testCase.serviceId}`);
      assert.equal(plan?.supported, true, `${testCase.serviceId} should be supported`);
      assert.equal(plan?.adapterVersion, "1");
    }
  });

  it("validates adapter contract fields for every implemented service", () => {
    const inputBrief = brief(
      "Need website, logo, marketing, CRM, and BI planning with auth and data",
      "website",
    );
    const core = blueprintCoreForBrief(inputBrief);
    const requirements = analyzeUniversalRequirements(inputBrief);
    const plans = buildUniversalServicePlans(core, requirements);

    for (const serviceId of IMPLEMENTED_SERVICE_IDS) {
      const plan = plans.find((entry) => entry.serviceId === serviceId);
      assert.ok(plan, `missing plan for ${serviceId}`);

      const validation = validateServiceBlueprintEntry(plan!, core.briefId);
      assert.equal(
        validation.ok,
        true,
        `${serviceId}: ${validation.errors.join("; ")}`,
      );

      for (const key of REQUIRED_SERVICE_BLUEPRINT_KEYS) {
        assert.ok(
          key in plan!.serviceBlueprint,
          `${serviceId} missing contract key ${key}`,
        );
      }
    }

    const future = plans.find((entry) => entry.serviceId === "future-service");
    assert.ok(future);
    assert.equal(future?.supported, false);
  });

  it("exposes adapter interface contracts only (no generation)", () => {
    const inputBrief = brief("Need website and app planning with auth and data", "website");
    const core = blueprintCoreForBrief(inputBrief);
    const requirements = analyzeUniversalRequirements(inputBrief);
    const plans = buildUniversalServicePlans(core, requirements);

    for (const serviceId of ["website-builder", "app-builder", "landing-page-builder"] as const) {
      const plan = plans.find((entry) => entry.serviceId === serviceId);
      assert.ok(plan);
      assert.equal(plan?.adapterVersion, "1");
      assert.equal(plan?.supported, true);
      assert.equal(plan?.serviceBlueprint.universalBlueprintRef, core.briefId);
    }
  });
});
