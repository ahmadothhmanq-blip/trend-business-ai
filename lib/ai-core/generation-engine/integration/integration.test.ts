import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  isMasterPlanIntegrationEnabled,
  wireMasterPlanIntegration,
  masterPlanToLegacyWebsitePlan,
  buildLockedSpecFromMasterPlan,
  validateBeforeGeneration,
  validateContentTasks,
  validateBeforeBuilder,
  validateBeforeExport,
  buildMasterPlanContentLlmRequest,
  runMasterPlanPipeline,
} from "@/lib/ai-core/generation-engine";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { mapWebsiteInputToTbgeBrief } from "@/lib/tbge/integration/brief-mapper";
import type { WebsiteGenerationInput } from "@/lib/website/types";

const ORIGINAL_WB_MASTER_PLAN = process.env.WB_MASTER_PLAN;
const ORIGINAL_WB_PRODUCTION = process.env.WB_PRODUCTION_PIPELINE;

const sampleInput: WebsiteGenerationInput = {
  prompt: "Create a modern SaaS website with pricing and free trial",
  projectType: "business",
  projectKind: "website",
  language: "English",
  theme: "modern",
  features: ["pricing", "contact"],
};

afterEach(() => {
  if (ORIGINAL_WB_MASTER_PLAN === undefined) delete process.env.WB_MASTER_PLAN;
  else process.env.WB_MASTER_PLAN = ORIGINAL_WB_MASTER_PLAN;
  if (ORIGINAL_WB_PRODUCTION === undefined) delete process.env.WB_PRODUCTION_PIPELINE;
  else process.env.WB_PRODUCTION_PIPELINE = ORIGINAL_WB_PRODUCTION;
});

describe("Master Plan + Website Builder integration", () => {
  it("is disabled by default", () => {
    delete process.env.WB_MASTER_PLAN;
    delete process.env.WB_PRODUCTION_PIPELINE;
    assert.equal(isMasterPlanIntegrationEnabled(), false);
  });

  it("enables with WB_MASTER_PLAN=1", () => {
    process.env.WB_MASTER_PLAN = "1";
    assert.equal(isMasterPlanIntegrationEnabled(), true);
  });

  it("wires master plan into builder lifecycle", async () => {
    process.env.WB_MASTER_PLAN = "1";
    const result = await wireMasterPlanIntegration({
      pluginInput: sampleInput,
      onProgress: () => {},
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.context.masterPlan.providerIndependent, true);
    assert.ok(result.context.lockedSpec);
    assert.ok(isSpecLocked(result.context.lockedSpec!));
    assert.ok(result.context.legacyMasterWebsitePlan.locked.sections);
    assert.equal(result.context.enrichedInput.industryId, result.context.masterPlan.business.industryId);
    assert.ok(result.context.settingsPatch.masterPlanId);
    assert.ok(result.context.briefMetadataPatch.tbge2MasterPlan);
  });

  it("validates master plan before generation", async () => {
    const pipeline = await runMasterPlanPipeline({ userPrompt: sampleInput.prompt });
    assert.equal(pipeline.ok, true);
    if (!pipeline.ok) return;

    const validation = validateBeforeGeneration(pipeline.masterPlan);
    assert.equal(validation.valid, true);
    assert.equal(validateBeforeBuilder(pipeline.masterPlan).valid, true);
  });

  it("builds copy-only content tasks", async () => {
    const pipeline = await runMasterPlanPipeline({ userPrompt: sampleInput.prompt });
    assert.equal(pipeline.ok, true);
    if (!pipeline.ok) return;

    const request = buildMasterPlanContentLlmRequest(pipeline.masterPlan);
    const validation = validateContentTasks(request);
    assert.equal(validation.valid, true);
    assert.ok(!request.userPrompt.includes(sampleInput.prompt));
  });

  it("bridges master plan to legacy website plan", async () => {
    const pipeline = await runMasterPlanPipeline({ userPrompt: "Restaurant with booking" });
    assert.equal(pipeline.ok, true);
    if (!pipeline.ok) return;

    const legacy = masterPlanToLegacyWebsitePlan(pipeline.masterPlan);
    assert.equal(legacy.id, pipeline.masterPlan.id);
    assert.ok(legacy.locked.industry);
    assert.ok(legacy.components.length > 0);
    assert.equal(legacy.sources.industry, "master-plan");
  });

  it("builds locked TBGE spec from master plan", async () => {
    const pipeline = await runMasterPlanPipeline({ userPrompt: sampleInput.prompt });
    assert.equal(pipeline.ok, true);
    if (!pipeline.ok) return;

    const spec = buildLockedSpecFromMasterPlan({
      plan: pipeline.masterPlan,
      prompt: sampleInput.prompt,
      profile: "professional",
      mode: "generate",
    });
    assert.ok(isSpecLocked(spec));
    assert.equal(spec.business.industryId, pipeline.masterPlan.business.industryId);
    assert.ok(spec.structure.pages.length > 0);
    assert.equal(spec.provenance.plannerModel, "master-plan-engine");
  });

  it("maps brief with master plan metadata patch", async () => {
    process.env.WB_MASTER_PLAN = "1";
    const wired = await wireMasterPlanIntegration({ pluginInput: sampleInput });
    assert.equal(wired.ok, true);
    if (!wired.ok) return;

    const brief = mapWebsiteInputToTbgeBrief(
      wired.context.enrichedInput,
      wired.context.briefMetadataPatch,
    );
    assert.ok(brief.metadata?.tbge2MasterPlan);
    assert.equal(brief.metadata?.masterPlanAuthority, true);
    assert.ok(brief.metadata?.masterWebsitePlan);
  });

  it("validates export requirements", () => {
    const result = validateBeforeExport({
      title: "Test",
      pages: ["Home"],
      sections: ["Hero"],
      files: [{ path: "app/page.tsx", content: "export default function Page() {}", language: "tsx" }],
    });
    assert.equal(result.valid, true);
  });
});
