import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TBGE2_PHASE,
  TBGE2_SPEC_VERSION,
  analyzeIntent,
  analyzeBusiness,
  analyzeRequirements,
  planWebsite,
  planPages,
  planSections,
  planContent,
  buildLlmRequest,
  planToStructuredOutput,
  containsForbiddenMarkup,
  isStructuredPlan,
  runTbge2PlanningPipeline,
  validatePlanningInput,
  validatePlanningPlan,
  bridgeToTbgePlanDraft,
  bridgeFromWebsiteGenerationInput,
  enrichPlanWithGls,
  TBGE2_PLANNING_LIFECYCLE,
  TBGE2_INTENT_PATTERNS,
  TBGE2_REQUIREMENT_PATTERNS,
} from "@/lib/ai-core/generation-engine";

describe("TBGE2 Generation Engine — Phase 1", () => {
  it("exports phase constants", () => {
    assert.equal(TBGE2_PHASE, "planning-1");
    assert.equal(TBGE2_SPEC_VERSION, "2.0.0");
  });

  it("defines full planning lifecycle", () => {
    assert.equal(TBGE2_PLANNING_LIFECYCLE.length, 10);
    const llmStages = TBGE2_PLANNING_LIFECYCLE.filter((p) => p.usesLlm);
    assert.equal(llmStages.length, 1);
    assert.equal(llmStages[0]?.stage, "structured_output");
  });

  it("registers intent patterns", () => {
    assert.ok(TBGE2_INTENT_PATTERNS.length >= 10);
    assert.ok(TBGE2_INTENT_PATTERNS.some((p) => p.category === "restaurant"));
    assert.ok(TBGE2_INTENT_PATTERNS.some((p) => p.category === "saas"));
  });

  it("registers requirement patterns", () => {
    assert.ok(TBGE2_REQUIREMENT_PATTERNS.length >= 15);
    assert.ok(TBGE2_REQUIREMENT_PATTERNS.some((p) => p.id === "booking"));
    assert.ok(TBGE2_REQUIREMENT_PATTERNS.some((p) => p.id === "payments"));
  });

  it("analyzes restaurant intent from prompt", () => {
    const intent = analyzeIntent({
      userPrompt: "Create a modern restaurant website with online booking and menu",
    });
    assert.equal(intent.category, "restaurant");
    assert.ok(intent.confidence > 0.5);
    assert.equal(intent.source, "keyword");
  });

  it("analyzes SaaS business from prompt", () => {
    const intent = analyzeIntent({ userPrompt: "Build a B2B SaaS platform website with pricing" });
    const business = analyzeBusiness({ userPrompt: "Build a B2B SaaS platform website with pricing" }, intent);
    assert.equal(intent.category, "saas");
    assert.equal(business.industryId, "saas");
    assert.ok(business.audience.length > 0);
  });

  it("detects requirements from prompt", () => {
    const intent = analyzeIntent({ userPrompt: "Medical clinic with booking and FAQ" });
    const reqs = analyzeRequirements({ userPrompt: "Medical clinic with booking and FAQ" }, intent);
    assert.ok(reqs.required.includes("booking"));
    assert.ok(reqs.required.includes("faq"));
    assert.ok(reqs.required.includes("contact"));
  });

  it("plans website with navigation and CTAs", () => {
    const intent = analyzeIntent({ userPrompt: "SaaS startup website" });
    const business = analyzeBusiness({ userPrompt: "SaaS startup website" }, intent);
    const reqs = analyzeRequirements({ userPrompt: "SaaS startup website" }, intent);
    const website = planWebsite(intent, business, reqs);
    assert.equal(website.websiteType, "saas");
    assert.ok(website.navigation.length >= 3);
    assert.ok(website.primaryCta.length > 0);
  });

  it("plans pages and sections for restaurant", () => {
    const intent = analyzeIntent({ userPrompt: "Italian restaurant in Dubai" });
    const reqs = analyzeRequirements({ userPrompt: "Italian restaurant in Dubai" }, intent);
    const website = planWebsite(intent, analyzeBusiness({ userPrompt: "Italian restaurant in Dubai" }, intent), reqs);
    const pages = planPages(intent, reqs, website.primaryCta);
    const sections = planSections(pages, intent, reqs);
    assert.ok(pages.some((p) => p.kind === "menu"));
    assert.ok(sections.some((s) => s.type === "hero"));
    assert.ok(sections.some((s) => s.type === "footer"));
  });

  it("plans content blocks with tone and localization", () => {
    const intent = analyzeIntent({ userPrompt: "Luxury hotel website", language: "Arabic" });
    const business = analyzeBusiness({ userPrompt: "Luxury hotel website", language: "Arabic" }, intent);
    const reqs = analyzeRequirements({ userPrompt: "Luxury hotel website", language: "Arabic" }, intent);
    const website = planWebsite(intent, business, reqs);
    const pages = planPages(intent, reqs, website.primaryCta);
    const sections = planSections(pages, intent, reqs);
    const content = planContent(sections, business, reqs);
    assert.ok(content.blocks.length > 0);
    assert.equal(content.localizationStrategy, "rtl-aware");
  });

  it("runs full planning pipeline without LLM", async () => {
    const result = await runTbge2PlanningPipeline({
      userPrompt: "Create a portfolio website for a creative agency in London",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.plan.pages.length >= 3);
    assert.ok(result.plan.sections.length >= 5);
    assert.ok(result.meta.planHash.length === 16);
    assert.ok(result.meta.stagesCompleted.includes("content"));
    assert.ok(!result.meta.stagesCompleted.includes("structured_output"));
  });

  it("builds LLM request without raw user prompt", async () => {
    const result = await runTbge2PlanningPipeline({
      userPrompt: "Secret raw prompt that must not leak to LLM",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(!result.llmRequest.userPrompt.includes("Secret raw prompt"));
    assert.ok(result.llmRequest.systemPrompt.includes("JSON"));
    assert.ok(result.llmRequest.schema);
  });

  it("produces structured JSON output", async () => {
    const result = await runTbge2PlanningPipeline({
      userPrompt: "E-commerce store for handmade jewelry",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const structured = planToStructuredOutput(result.plan);
    assert.equal(structured.version, "2.0.0");
    assert.ok(isStructuredPlan(structured));
  });

  it("rejects forbidden markup in LLM output", () => {
    assert.ok(containsForbiddenMarkup('<div className="hero">Hello</div>'));
    assert.ok(!containsForbiddenMarkup('{"version":"2.0.0"}'));
  });

  it("validates planning input and plan", async () => {
    const badInput = validatePlanningInput({ userPrompt: "" });
    assert.equal(badInput.valid, false);

    const result = await runTbge2PlanningPipeline({
      userPrompt: "Professional law firm website",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const planValid = validatePlanningPlan(result.plan);
    assert.equal(planValid.valid, true);
  });

  it("bridges to TBGE v1 plan draft format", async () => {
    const result = await runTbge2PlanningPipeline({
      userPrompt: "Dental clinic with appointment booking",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const draft = bridgeToTbgePlanDraft(result.plan);
    assert.ok(draft.business.name);
    assert.ok(draft.structure.pages.length > 0);
    assert.equal(draft.capabilities.auth, false);
  });

  it("bridges from website generation input", () => {
    const input = bridgeFromWebsiteGenerationInput({
      prompt: "Modern cafe website",
      language: "English",
      industry: "restaurant",
    });
    assert.equal(input.userPrompt, "Modern cafe website");
    assert.equal(input.industry, "restaurant");
  });

  it("enriches plan with GLS language context", async () => {
    const result = await runTbge2PlanningPipeline({
      userPrompt: "Arabic restaurant website",
      language: "Arabic",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const enriched = enrichPlanWithGls(result.plan);
    assert.ok("language" in enriched);
    assert.equal((enriched as { language: { website: { direction: string } } }).language.website.direction, "rtl");
  });
});
