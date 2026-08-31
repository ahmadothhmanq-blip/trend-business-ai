import { createHash } from "node:crypto";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  runPlanningReasoningEngine,
} from "@/lib/ai-core/planning-reasoning-engine";
import {
  CANONICAL_WORKFLOW_ORDER,
  completeMaoeWorkflow,
  getWorkflowStateFromBrief,
  persistWorkflowStateOnBrief,
  runMultiAgentOrchestrationEngine,
  superviseAgentSync,
} from "@/lib/ai-core/multi-agent-orchestration";
import {
  getSharedMemoryFromBrief,
  persistSharedMemoryOnBrief,
  shareArtifact,
} from "@/lib/ai-core/multi-agent-orchestration/shared-memory";
import { buildUniversalBlueprintCore, finalizeUniversalBlueprint } from "@/lib/ai-core/universal-planner/blueprint-generator";
import { buildClarificationQuestions } from "@/lib/ai-core/universal-planner/clarification-engine";
import {
  getUniversalBlueprintFromBrief,
  persistUniversalBlueprint,
  persistUniversalRequirements,
} from "@/lib/ai-core/universal-planner/memory/brief-persistence";
import { analyzeUniversalRequirements } from "@/lib/ai-core/universal-planner/requirements/analyzer";
import { safeParseUniversalBlueprint } from "@/lib/ai-core/universal-planner/schema";
import { buildUniversalServicePlans } from "@/lib/ai-core/universal-planner/service-router";
import type {
  UniversalPlannerRunInput,
  UniversalPlannerRunResult,
} from "@/lib/ai-core/universal-planner/types";

function withSafePreFallbackBrief(brief: CoreBrief): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      industryId:
        typeof brief.metadata?.industryId === "string"
          ? brief.metadata.industryId
          : "business",
      industry:
        typeof brief.metadata?.industry === "string"
          ? brief.metadata.industry
          : "business",
      websiteGenerationInput:
        typeof brief.metadata?.websiteGenerationInput === "object" &&
        brief.metadata?.websiteGenerationInput
          ? brief.metadata.websiteGenerationInput
          : { projectType: "business" },
    },
  };
}

function briefFingerprint(brief: CoreBrief): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        prompt: brief.prompt,
        productId: brief.productId,
        language: brief.language,
        theme: brief.theme,
        features: brief.features,
      }),
    )
    .digest("hex")
    .slice(0, 16);
}

export async function runUniversalPlanner(
  input: UniversalPlannerRunInput,
): Promise<UniversalPlannerRunResult> {
  const onProgress = input.onProgress;
  let brief = input.brief;
  const fp = briefFingerprint(brief);

  if (input.reuseExisting !== false) {
    const cached = getUniversalBlueprintFromBrief(brief);
    if (cached && cached.briefId === fp) {
      const pre = await runPlanningReasoningEngine({
        brief,
        onProgress,
        reuseExisting: true,
      });
      return {
        brief,
        blueprint: cached,
        industryDetection: pre.industryDetection,
        planningTrace: pre.trace,
        clarifications: cached.clarifications.questions,
        requirements:
          (brief.metadata?.universalPlannerRequirements as UniversalPlannerRunResult["requirements"]) ??
          analyzeUniversalRequirements(brief),
      };
    }
  }

  onProgress?.("[universal-planner] Phase 1/5 · PRE domain planning");
  let pre;
  try {
    pre = await runPlanningReasoningEngine({
      brief,
      onProgress,
      reuseExisting: input.reuseExisting,
    });
  } catch (error) {
    onProgress?.(
      `[universal-planner] PRE retry with safe fallback metadata: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    brief = withSafePreFallbackBrief(brief);
    pre = await runPlanningReasoningEngine({
      brief,
      onProgress,
      reuseExisting: false,
    });
  }
  brief = pre.brief;

  onProgress?.("[universal-planner] Phase 2/5 · Requirement analysis");
  const requirements = analyzeUniversalRequirements(brief);
  brief = persistUniversalRequirements(brief, requirements);

  onProgress?.("[universal-planner] Phase 3/5 · Clarification synthesis");
  const clarifications = buildClarificationQuestions(requirements);

  onProgress?.("[universal-planner] Phase 4/5 · MAOE orchestration state");
  const maoe = runMultiAgentOrchestrationEngine({ brief, onProgress });
  brief = maoe.brief;
  for (const agentId of CANONICAL_WORKFLOW_ORDER) {
    const supervised = superviseAgentSync({
      agentId,
      brief,
      relaxedDependencies: true,
      executor: () => ({ ok: true }),
    });
    brief = supervised.brief;
  }
  brief = completeMaoeWorkflow(
    brief,
    (message) => onProgress?.(`[universal-planner] ${message}`),
  );
  const finalizedWorkflow = getWorkflowStateFromBrief(brief);
  if (finalizedWorkflow && finalizedWorkflow.status !== "completed") {
    brief = persistWorkflowStateOnBrief(brief, {
      ...finalizedWorkflow,
      status: "completed",
      completedAt: finalizedWorkflow.completedAt ?? new Date().toISOString(),
    });
  }

  const blueprintCore = buildUniversalBlueprintCore({
    briefId: fp,
    industryDetection: pre.industryDetection,
    requirements,
    clarificationQuestions: clarifications,
    planningTrace: pre.trace,
    orchestrationTraceRef: maoe.trace.workflowId,
  });

  onProgress?.("[universal-planner] Phase 5/5 · Blueprint generation + adapter routing");
  const servicePlans = buildUniversalServicePlans(blueprintCore, requirements);
  const blueprint = finalizeUniversalBlueprint(blueprintCore, servicePlans);

  const validated = safeParseUniversalBlueprint(blueprint);
  if (!validated.success) {
    throw new Error(
      `Universal planner blueprint validation failed: ${validated.error.message}`,
    );
  }

  let shared = getSharedMemoryFromBrief(brief);
  shared = shareArtifact(
    shared,
    "PRE",
    `universal-blueprint:${fp}`,
    validated.data,
    "universal-blueprint",
  );
  brief = persistSharedMemoryOnBrief(brief, shared);
  brief = persistUniversalBlueprint(brief, validated.data);

  return {
    brief,
    blueprint: validated.data,
    industryDetection: pre.industryDetection,
    planningTrace: pre.trace,
    clarifications,
    requirements,
  };
}
