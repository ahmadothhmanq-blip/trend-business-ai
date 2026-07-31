/**
 * Master AI Planner — backward-compatible facade over the Planning & Reasoning Engine.
 * EDS-002: all planning logic lives in planning-reasoning-engine/orchestrator.ts.
 */

import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import {
  assertMasterPlanIndustry,
  lockedIndustryId,
  runPlanningReasoningEngine,
} from "@/lib/ai-core/planning-reasoning-engine";

export type RunMasterWebsitePlannerParams = {
  brief: CoreBrief;
  onProgress?: (message: string) => void;
  /** Skip re-planning when an identical plan already exists on the brief. */
  reuseExisting?: boolean;
};

export type MasterWebsitePlannerResult = {
  plan: MasterWebsitePlan;
  brief: CoreBrief;
  industryDetection: IndustryDetectionResult;
};

/**
 * Analyze the user prompt once and produce the authoritative Website Plan.
 * @deprecated Prefer runPlanningReasoningEngine() for structured decision traces.
 */
export async function runMasterWebsitePlanner(
  params: RunMasterWebsitePlannerParams,
): Promise<MasterWebsitePlannerResult> {
  const result = await runPlanningReasoningEngine(params);
  return {
    plan: result.plan,
    brief: result.brief,
    industryDetection: result.industryDetection,
  };
}

export { assertMasterPlanIndustry, lockedIndustryId };
