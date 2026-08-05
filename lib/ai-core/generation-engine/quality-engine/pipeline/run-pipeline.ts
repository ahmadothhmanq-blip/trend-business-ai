import { AWQE_PHASE,
  AWQE_SPEC_VERSION,
} from "@/lib/ai-core/generation-engine/quality-engine/constants";
import { evaluateQuality } from "@/lib/ai-core/generation-engine/quality-engine/evaluate";
import { applyQualityImprovements } from "@/lib/ai-core/generation-engine/quality-engine/improve";
import {
  buildWebsiteSpecification,
  hashSpecification,
} from "@/lib/ai-core/generation-engine/quality-engine/build-spec";
import {
  buildImprovementReport,
  generateRecommendations,
} from "@/lib/ai-core/generation-engine/quality-engine/recommend";
import type {
  AwqePipelineInput,
  AwqePipelineMeta,
  AwqePipelineResult,
  AwqePipelineStage,
} from "@/lib/ai-core/generation-engine/quality-engine/types";
import { validateWebsiteSpecification } from "@/lib/ai-core/generation-engine/quality-engine/validate";

/**
 * AWQE Pipeline — Master Plan → Quality Engine → Website Specification
 *
 * Deterministic. No AI provider. No LLM.
 */
export function runAwqePipeline(input: AwqePipelineInput): AwqePipelineResult {
  const stagesCompleted: AwqePipelineStage[] = [];
  const { masterPlan } = input;

  const evaluation = evaluateQuality(masterPlan);
  stagesCompleted.push("evaluate");

  const recommendations = generateRecommendations(masterPlan, evaluation.dimensions);
  stagesCompleted.push("recommend");

  const improved = applyQualityImprovements(masterPlan);
  stagesCompleted.push("improve");

  stagesCompleted.push("optimize");

  const report = buildImprovementReport({
    evaluation: evaluation.dimensions,
    recommendations,
    appliedImprovements: improved.appliedImprovements,
  });

  const specification = buildWebsiteSpecification({
    masterPlan,
    improved,
    evaluation,
    report,
  });
  stagesCompleted.push("score");
  stagesCompleted.push("build_spec");

  const validation = validateWebsiteSpecification(specification);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors, stage: "validate" };
  }
  stagesCompleted.push("validate");

  const meta: AwqePipelineMeta = {
    phase: AWQE_PHASE,
    schemaVersion: AWQE_SPEC_VERSION,
    resolvedAt: new Date().toISOString(),
    specHash: hashSpecification(specification),
    stagesCompleted,
  };

  return { ok: true, specification, meta };
}
