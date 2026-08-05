import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MASTER_PLAN_SCHEMA_VERSION,
  MASTER_PLAN_PHASE,
  buildMasterPlan,
  validateMasterPlan,
  isMasterPlan,
  buildMasterPlanContentLlmRequest,
  runMasterPlanPipeline,
  runTbge2PlanningPipeline,
  MASTER_PLAN_LIFECYCLE,
  getMasterPlanLifecyclePhase,
  masterPlanToSettingsPatch,
} from "@/lib/ai-core/generation-engine";

describe("TBGE2 Master Plan Engine — Phase 1.5", () => {
  it("exports master plan constants", () => {
    assert.equal(MASTER_PLAN_SCHEMA_VERSION, "1.0.0");
    assert.equal(MASTER_PLAN_PHASE, "master-plan-1");
  });

  it("defines master plan lifecycle", () => {
    assert.equal(MASTER_PLAN_LIFECYCLE.length, 5);
    const llmStages = MASTER_PLAN_LIFECYCLE.filter((p) => p.usesLlm);
    assert.equal(llmStages.length, 1);
    assert.equal(llmStages[0]?.stage, "structured_content");
    assert.equal(getMasterPlanLifecyclePhase("master_plan_build")?.owner, "master-plan");
  });

  it("builds master plan from TBGE2 analysis", async () => {
    const tbge = await runTbge2PlanningPipeline({
      userPrompt: "Modern SaaS platform with pricing and free trial for enterprise teams",
    });
    assert.equal(tbge.ok, true);
    if (!tbge.ok) return;

    const masterPlan = buildMasterPlan(tbge.plan, {
      userPrompt: "Modern SaaS platform with pricing and free trial for enterprise teams",
    });

    assert.ok(masterPlan.id);
    assert.equal(masterPlan.version, 1);
    assert.ok(masterPlan.createdAt);
    assert.equal(masterPlan.schemaVersion, "1.0.0");
    assert.equal(masterPlan.providerIndependent, true);
    assert.equal(masterPlan.websiteType, "saas");
    assert.ok(masterPlan.pages.length >= 3);
    assert.ok(masterPlan.sections.length >= 5);
    assert.ok(masterPlan.componentsNeeded.length > 0);
    assert.ok(masterPlan.businessFeatures.includes("pricing"));
  });

  it("includes all required master plan domains", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Italian restaurant in Dubai with online booking and menu",
      language: "English",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const plan = result.masterPlan;
    assert.ok(plan.project.name);
    assert.ok(plan.business.industryId);
    assert.ok(plan.audience.length > 0);
    assert.ok(plan.goals.length > 0);
    assert.ok(plan.brand.style);
    assert.ok(plan.localization.language);
    assert.ok(plan.localization.localeCode);
    assert.ok(plan.conversionStrategy);
    assert.ok(plan.navigation.length > 0);
    assert.ok(plan.seoStrategy.targetKeywords.length > 0);
    assert.ok(plan.contentStrategy.llmOwnedFields.length > 0);
    assert.ok(plan.contentStrategy.forbiddenLlmFields.length > 0);
    assert.ok(plan.mediaStrategy.imageStyle);
    assert.ok(plan.ctaStrategy.primary);
    assert.ok(plan.trustStrategy);
    assert.ok(plan.legalPages.length >= 2);
    assert.ok(plan.performanceTargets.lighthousePerformance >= 90);
    assert.equal(plan.accessibilityTargets.wcagLevel, "AA");
    assert.ok(plan.futureExpansion.supportedProviders.includes("deepseek"));
    assert.ok(plan.futureExpansion.supportedProviders.includes("grok"));
  });

  it("validates master plan comprehensively", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Dental clinic with appointment booking and FAQ",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const validation = validateMasterPlan(result.masterPlan);
    assert.equal(validation.valid, true);
    assert.equal(isMasterPlan(result.masterPlan), true);
  });

  it("runs full master plan pipeline", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Creative agency portfolio website in London",
      projectName: "Atelier Studio",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.masterPlan.project.name, "Atelier Studio");
    assert.ok(result.meta.planHash.length === 16);
    assert.ok(result.meta.stagesCompleted.includes("master_plan_validate"));
    assert.ok(result.meta.stagesCompleted.includes("llm_request"));
    assert.equal(result.meta.schemaVersion, "1.0.0");
  });

  it("builds LLM request for copy execution only", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "E-commerce jewelry store with gallery and payments",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const req = buildMasterPlanContentLlmRequest(result.masterPlan);
    assert.ok(req.systemPrompt.includes("LOCKED Master Plan"));
    assert.ok(req.systemPrompt.includes("YOU MUST NEVER"));
    assert.ok(!req.userPrompt.includes("E-commerce jewelry store"));
    assert.ok(req.userPrompt.includes("copyTasks"));
    const payload = JSON.parse(req.userPrompt) as { locked?: boolean };
    assert.equal(payload.locked, true);
    assert.ok(req.schema);
  });

  it("forbids LLM from making planning decisions", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Law firm website with consultation booking",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const forbidden = result.masterPlan.contentStrategy.forbiddenLlmFields;
    assert.ok(forbidden.includes("pages"));
    assert.ok(forbidden.includes("sections"));
    assert.ok(forbidden.includes("navigation"));
    assert.ok(forbidden.includes("website architecture"));
  });

  it("resolves components for every section", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Real estate agency with property gallery",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    for (const section of result.masterPlan.sections) {
      assert.ok(section.componentId.startsWith("components/"));
      assert.ok(section.contentBlocks.length >= 0);
    }
  });

  it("supports Arabic localization in master plan", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Arabic restaurant website",
      language: "Arabic",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.masterPlan.localization.direction, "rtl");
    assert.equal(result.masterPlan.localization.strategy, "rtl-aware");
  });

  it("produces settings patch for project storage", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Medical clinic website",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const patch = masterPlanToSettingsPatch(result.meta);
    assert.ok(patch.masterPlanHash);
    assert.equal(patch.masterPlanProviderIndependent, "true");
  });

  it("is provider independent", async () => {
    const result = await runMasterPlanPipeline({
      userPrompt: "Blog website with newsletter",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.masterPlan.providerIndependent, true);
    const providers = result.masterPlan.futureExpansion.supportedProviders;
    assert.ok(providers.includes("openai"));
    assert.ok(providers.includes("gemini"));
    assert.ok(providers.includes("claude"));
    assert.ok(providers.includes("deepseek"));
  });
});
