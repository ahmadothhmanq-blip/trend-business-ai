import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  isProductionPipelineEnabled,
  isIntegratedPipelineEnabled,
  runProductionPlanningPhase,
  runMasterPlanPipeline,
  runAwqePipeline,
  validateWebsiteSpecification,
} from "@/lib/ai-core/generation-engine";
import type { WebsiteGenerationInput } from "@/lib/website/types";

const ORIGINAL_WB_PRODUCTION = process.env.WB_PRODUCTION_PIPELINE;
const ORIGINAL_WB_MASTER_PLAN = process.env.WB_MASTER_PLAN;

const sampleInput: WebsiteGenerationInput = {
  prompt: "Create a modern SaaS website with pricing and free trial",
  projectType: "business",
  projectKind: "website",
  language: "English",
  theme: "modern",
  features: ["pricing", "contact"],
};

afterEach(() => {
  if (ORIGINAL_WB_PRODUCTION === undefined) delete process.env.WB_PRODUCTION_PIPELINE;
  else process.env.WB_PRODUCTION_PIPELINE = ORIGINAL_WB_PRODUCTION;
  if (ORIGINAL_WB_MASTER_PLAN === undefined) delete process.env.WB_MASTER_PLAN;
  else process.env.WB_MASTER_PLAN = ORIGINAL_WB_MASTER_PLAN;
});

describe("Production Website Generation Pipeline", () => {
  it("is disabled by default", () => {
    delete process.env.WB_PRODUCTION_PIPELINE;
    delete process.env.WB_MASTER_PLAN;
    assert.equal(isProductionPipelineEnabled(), false);
    assert.equal(isIntegratedPipelineEnabled(), false);
  });

  it("enables with WB_PRODUCTION_PIPELINE=1", () => {
    process.env.WB_PRODUCTION_PIPELINE = "1";
    assert.equal(isProductionPipelineEnabled(), true);
    assert.equal(isIntegratedPipelineEnabled(), true);
  });

  it("runs full planning phase with validation and AWQE", async () => {
    process.env.WB_PRODUCTION_PIPELINE = "1";
    const result = await runProductionPlanningPhase({
      pluginInput: sampleInput,
      onProgress: () => {},
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.ok(result.context.websiteSpecification);
    assert.ok(result.context.awqeMeta.specHash);
    assert.equal(result.context.validationReport.passed, true);
    assert.ok(result.context.qualityReport.overallScore >= 0);
    assert.ok(result.context.trace.traceId);
    assert.ok(result.context.planningTiming.planningMs >= 0);
    assert.ok(result.context.planningTiming.qualityMs >= 0);
    assert.equal(result.context.websiteSpecification.providerIndependent, true);
    assert.ok(result.context.briefMetadataPatch.awqeWebsiteSpecification);
  });

  it("stops on invalid master plan input", async () => {
    process.env.WB_PRODUCTION_PIPELINE = "1";
    const result = await runProductionPlanningPhase({
      pluginInput: { ...sampleInput, prompt: "" },
      onProgress: () => {},
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(result.errors.length > 0);
    assert.ok(result.validationReport.entries.length > 0);
  });

  it("AWQE produces valid website specification from master plan", async () => {
    const pipeline = await runMasterPlanPipeline({ userPrompt: sampleInput.prompt });
    assert.equal(pipeline.ok, true);
    if (!pipeline.ok) return;

    const awqe = runAwqePipeline({ masterPlan: pipeline.masterPlan });
    assert.equal(awqe.ok, true);
    if (!awqe.ok) return;

    const specValidation = validateWebsiteSpecification(awqe.specification);
    assert.equal(specValidation.valid, true);
    assert.equal(awqe.specification.masterPlanId, pipeline.masterPlan.id);
  });
});
