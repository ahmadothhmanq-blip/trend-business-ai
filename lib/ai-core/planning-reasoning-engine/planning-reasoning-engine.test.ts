import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PlanningTraceCollector,
  explainPlanningTrace,
  summarizePlanningTrace,
  PLANNING_REASONING_ENGINE_ID,
  PLANNING_REASONING_TRACE_KEY,
} from "@/lib/ai-core/planning-reasoning-engine";
import { runMasterWebsitePlanner } from "@/lib/ai-core/master-planner";
import type { CoreBrief } from "@/lib/ai-core/layers/types";

describe("EDS-002 Planning & Reasoning Engine", () => {
  it("collects structured decision traces across phases", () => {
    const collector = new PlanningTraceCollector();
    collector.beginPhase("business-analysis");
    collector.record({
      ruleId: "bi-test",
      category: "business",
      passed: true,
      severity: "info",
      message: "Test business analysis",
      confidence: 0.9,
    });
    collector.beginPhase("template-routing");
    collector.mergeReasoningChain(
      ["Industry locked: furniture", "Structure: modern-business"],
      "template-routing",
      "route",
    );
    const trace = collector.toTrace("abc123");
    assert.equal(trace.engineId, PLANNING_REASONING_ENGINE_ID);
    assert.ok(trace.entries.length >= 3);
    assert.ok(trace.phases.includes("business-analysis"));
    assert.ok(trace.phases.includes("template-routing"));
    const chain = explainPlanningTrace(trace);
    assert.ok(chain.some((line) => line.includes("furniture")));
    assert.ok(summarizePlanningTrace(trace).includes("Planning completed"));
  });

  it("merges architecture validation trace entries", () => {
    const collector = new PlanningTraceCollector();
    collector.beginPhase("architecture-validation");
    collector.mergeArchitectureValidationTrace([
      {
        ruleId: "industry-layout-family",
        category: "layout",
        passed: true,
        severity: "warning",
        message: "furniture → commerce-grid allowed per AKB",
        knowledgeEntryId: "furniture",
      },
    ]);
    const entry = collector.getEntries().find(
      (e) => e.ruleId === "industry-layout-family",
    );
    assert.ok(entry);
    assert.equal(entry?.knowledgeEntryId, "furniture");
    assert.equal(entry?.phase, "architecture-validation");
  });

  it("master planner facade delegates to PRE and persists trace key", async () => {
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
      designSystemHints: {
        mood: "Warm premium",
        layoutApproach: "showroom catalog",
      },
      routingIndustryId: "furniture",
      confidence: 0.92,
      reason: "Furniture showroom",
    };

    const brief: CoreBrief = {
      productId: "website-builder",
      prompt:
        "Premium luxury furniture showroom for modern living rooms. Browse collections.",
      language: "en",
      features: [],
      metadata: {
        allowLegacyArchitectureBypass: true,
        businessIntelligence: {
          profile: furnitureProfile,
          source: "analysis",
          promptHash: "test-furniture",
          analyzedAt: new Date().toISOString(),
        },
      },
    };
    const result = await runMasterWebsitePlanner({ brief, reuseExisting: false });
    assert.equal(result.plan.industry, "furniture");
    assert.ok(result.plan.sources.reasoningChain.length > 0);
    assert.ok(result.plan.sources.reasoningChain[0]?.includes("["));

    const trace = result.brief.metadata?.[PLANNING_REASONING_TRACE_KEY];
    assert.ok(trace && typeof trace === "object");
    const typed = trace as { entries: unknown[]; phases: string[] };
    assert.ok(typed.entries.length > 5);
    assert.ok(typed.phases.includes("business-analysis"));
    assert.ok(typed.phases.includes("architecture-validation"));
  });

  it("reuses locked plan with reuse trace phase", async () => {
    const furnitureProfile = {
      industry: "Furniture",
      subcategory: "Showroom",
      audience: ["Homeowners"],
      tone: "Premium",
      visualStyle: ["Luxury"],
      colorPalette: [],
      typography: [],
      photographyStyle: ["Luxury sofa"],
      forbiddenSubjects: ["fashion"],
      heroMessaging: ["Premium furniture"],
      recommendedSections: ["Hero", "Collections", "Contact"],
      primaryCta: "Browse collections",
      navigationStyle: "standard",
      designSystemHints: { mood: "Premium", layoutApproach: "showroom" },
      routingIndustryId: "furniture",
      confidence: 0.9,
      reason: "Furniture",
    };
    const brief: CoreBrief = {
      productId: "website-builder",
      prompt: "Premium luxury furniture showroom for modern living rooms.",
      language: "en",
      features: [],
      metadata: {
        allowLegacyArchitectureBypass: true,
        businessIntelligence: {
          profile: furnitureProfile,
          source: "analysis",
          promptHash: "reuse-test",
          analyzedAt: new Date().toISOString(),
        },
      },
    };
    const first = await runMasterWebsitePlanner({ brief, reuseExisting: false });
    const second = await runMasterWebsitePlanner({
      brief: first.brief,
      reuseExisting: true,
    });
    assert.equal(second.plan.id, first.plan.id);
    const trace = second.brief.metadata?.[PLANNING_REASONING_TRACE_KEY] as {
      phases: string[];
    };
    assert.ok(trace.phases.includes("reuse"));
  });
});
