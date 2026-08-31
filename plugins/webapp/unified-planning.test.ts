import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeWebApp } from "@/plugins/webapp/analyze";
import {
  buildDeterministicFilePlans,
  canSkipStage2Llm,
  isWebAppDeterministicPlanningEnabled,
} from "@/plugins/webapp/deterministic-plan";
import { planWebApp } from "@/plugins/webapp/plan";
import { webappUnifiedPlanningPrompt } from "@/lib/ai/prompts/webapp";
import { webappUnifiedPlanningSchema } from "@/plugins/webapp/schemas";
import type { GenerationContext } from "@/lib/ai/types";

function mockCtx(): GenerationContext {
  return {
    provider: {
      name: "deepseek",
      generateJson: async () => {
        throw new Error("deterministic path must not call the LLM");
      },
      generateText: async () => "",
      streamText: async () => "",
    },
    progress: { emit() {}, getEvents: () => [] },
    usage: {
      add() {},
      get: () => ({ promptTokens: 0, completionTokens: 0, totalTokens: 0 }),
    },
  } as unknown as GenerationContext;
}

describe("App Builder unified Stage 2 planning", () => {
  it("analyzes requirements without an LLM call", async () => {
    const analysis = await analyzeWebApp(
      {
        prompt: "Inventory SaaS with auth",
        appType: "saas",
        language: "English",
        designStyle: "professional",
        colorStyle: "modern",
        features: ["auth", "dashboard"],
      },
      mockCtx(),
    );
    assert.equal(analysis.requiresAuth, true);
    assert.equal(analysis.requiresDatabase, true);
    assert.ok(analysis.databaseTables.length >= 1);
  });

  it("builds a unified planning prompt with structured JSON context", () => {
    const prompt = webappUnifiedPlanningPrompt({
      input: {
        prompt: "CRUD dashboard",
        appType: "saas",
        language: "English",
        designStyle: "professional",
        colorStyle: "modern",
        features: ["auth"],
      },
      seedAnalysis: { appName: "Ops", pages: ["Home"] },
      designSeed: { screens: ["Home"] },
      universalPlannerContext: { enabled: true, selectedServiceId: "app-builder" },
    });
    assert.match(prompt, /ONE JSON response/);
    assert.match(prompt, /"selectedServiceId": "app-builder"/);
    assert.match(prompt, /filePlan/);
    assert.equal(webappUnifiedPlanningSchema.required?.includes("filePlan"), true);
    assert.equal(webappUnifiedPlanningSchema.required?.includes("analysis"), true);
  });

  it("skips Stage 2 DeepSeek for complete local analysis", async () => {
    assert.equal(isWebAppDeterministicPlanningEnabled(), true);
    const input = {
      prompt: "Inventory SaaS with auth",
      appType: "SaaS Dashboard",
      language: "English",
      designStyle: "professional",
      colorStyle: "modern",
      features: ["auth", "dashboard", "database"],
    };
    const analysis = await analyzeWebApp(input, mockCtx());
    assert.equal(canSkipStage2Llm(input, analysis), true);

    const plan = await planWebApp(input, analysis, mockCtx());
    assert.ok(plan.filePlans.length >= 8);
    assert.equal(
      plan.unifiedPlanning?.executionMetadata.generationMode,
      "deterministic-skip",
    );

    const paths = new Set(plan.filePlans.map((f) => f.path));
    assert.ok(paths.has("app/layout.tsx"));
    assert.ok(paths.has("prisma/schema.prisma"));
  });

  it("builds deterministic file plans covering scaffold + entity CRUD", () => {
    const files = buildDeterministicFilePlans({
      appName: "Ops",
      appType: "saas",
      complexity: "moderate",
      pages: ["Home", "Login", "Dashboard", "Items"],
      features: ["auth"],
      technologies: ["next"],
      databaseTables: ["Item", "User"],
      apiEndpoints: [],
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      isEcommerce: false,
      isSaas: true,
      databaseProvider: "prisma",
    });
    const paths = files.map((f) => f.path);
    assert.ok(paths.includes("middleware.ts"));
    assert.ok(paths.includes("lib/db.ts"));
    assert.ok(paths.includes("app/api/items/route.ts"));
    assert.ok(paths.includes("app/dashboard/items/page.tsx"));
  });
});
