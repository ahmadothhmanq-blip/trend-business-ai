import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AWQE_SPEC_VERSION,
  AWQE_PHASE,
  runAwqePipeline,
  evaluateQuality,
  applyQualityImprovements,
  validateWebsiteSpecification,
  isAwqeWebsiteSpecification,
  specificationToSettingsPatch,
  AWQE_QUALITY_LIFECYCLE,
  runMasterPlanPipeline,
} from "@/lib/ai-core/generation-engine";

describe("AWQE — AI Website Quality Engine Phase 1", () => {
  it("exports constants", () => {
    assert.equal(AWQE_SPEC_VERSION, "1.0.0");
    assert.equal(AWQE_PHASE, "quality-1");
  });

  it("defines quality lifecycle", () => {
    assert.equal(AWQE_QUALITY_LIFECYCLE.length, 7);
    assert.ok(AWQE_QUALITY_LIFECYCLE.some((p) => p.stage === "evaluate"));
    assert.ok(AWQE_QUALITY_LIFECYCLE.some((p) => p.stage === "build_spec"));
  });

  it("evaluates quality dimensions from master plan", async () => {
    const mp = await runMasterPlanPipeline({
      userPrompt: "Modern SaaS website with pricing and free trial",
    });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const evaluation = evaluateQuality(mp.masterPlan);
    assert.ok(evaluation.scores.overall >= 0 && evaluation.scores.overall <= 100);
    assert.ok(evaluation.scores.seo >= 0);
    assert.ok(evaluation.scores.conversion >= 0);
    assert.ok(evaluation.scores.accessibility >= 0);
    assert.equal(evaluation.dimensions.length, 9);
  });

  it("applies quality improvements", async () => {
    const mp = await runMasterPlanPipeline({
      userPrompt: "Restaurant with online booking and menu",
    });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const improved = applyQualityImprovements(mp.masterPlan);
    assert.ok(improved.sections.length >= mp.masterPlan.sections.length);
    assert.ok(improved.appliedImprovements.length > 0);
    assert.ok(improved.sections.some((s) => s.type === "hero"));
  });

  it("runs full AWQE pipeline", async () => {
    const mp = await runMasterPlanPipeline({
      userPrompt: "Dental clinic with appointment booking and FAQ",
    });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const result = runAwqePipeline({ masterPlan: mp.masterPlan });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const spec = result.specification;
    assert.ok(spec.id);
    assert.equal(spec.schemaVersion, "1.0.0");
    assert.equal(spec.providerIndependent, true);
    assert.equal(spec.masterPlanId, mp.masterPlan.id);
    assert.ok(spec.pages.length > 0);
    assert.ok(spec.sections.length > 0);
    assert.ok(spec.scores.overall > 0);
    assert.ok(spec.report.strengths.length > 0);
    assert.ok(spec.report.appliedImprovements.length > 0);
    assert.ok(spec.seo.pageTitles);
    assert.ok(spec.conversion.primaryCta);
    assert.equal(spec.accessibility.wcagLevel, "AA");
    assert.ok(spec.performance.lazyLoading);
  });

  it("validates website specification", async () => {
    const mp = await runMasterPlanPipeline({
      userPrompt: "Creative agency portfolio website",
    });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const result = runAwqePipeline({ masterPlan: mp.masterPlan });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const validation = validateWebsiteSpecification(result.specification);
    assert.equal(validation.valid, true);
    assert.equal(isAwqeWebsiteSpecification(result.specification), true);
  });

  it("produces improvement report with recommendations", async () => {
    const mp = await runMasterPlanPipeline({
      userPrompt: "E-commerce jewelry store",
    });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const result = runAwqePipeline({ masterPlan: mp.masterPlan });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.ok(Array.isArray(result.specification.report.recommendations));
    assert.ok(result.specification.report.weaknesses.length >= 0);
    assert.ok(result.meta.specHash.length === 16);
  });

  it("produces settings patch", async () => {
    const mp = await runMasterPlanPipeline({
      userPrompt: "Law firm website",
    });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const result = runAwqePipeline({ masterPlan: mp.masterPlan });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    const patch = specificationToSettingsPatch(result.specification);
    assert.ok(patch.awqeSpecId);
    assert.ok(patch.awqeOverallScore);
  });

  it("does not modify master plan input", async () => {
    const mp = await runMasterPlanPipeline({
      userPrompt: "Medical clinic website",
    });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const sectionCountBefore = mp.masterPlan.sections.length;
    runAwqePipeline({ masterPlan: mp.masterPlan });
    assert.equal(mp.masterPlan.sections.length, sectionCountBefore);
  });

  it("is provider independent", async () => {
    const mp = await runMasterPlanPipeline({ userPrompt: "Blog website" });
    assert.equal(mp.ok, true);
    if (!mp.ok) return;

    const result = runAwqePipeline({ masterPlan: mp.masterPlan });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.specification.providerIndependent, true);
  });
});
