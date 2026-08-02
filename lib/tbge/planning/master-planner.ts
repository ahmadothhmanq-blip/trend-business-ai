/**
 * TBGE Master Planner — single LLM call for planning; deterministic spec creation.
 */

import { runPlanningPipeline } from "@/lib/tbge/planning/pipeline";
import type {
  MasterPlanner,
  MasterPlannerDeps,
  MasterPlannerInput,
  MasterPlannerResult,
} from "@/lib/tbge/planning/types";

export function createMasterPlanner(deps: MasterPlannerDeps): MasterPlanner {
  return {
    async plan(input: MasterPlannerInput): Promise<MasterPlannerResult> {
      return runPlanningPipeline(deps, input);
    },
  };
}

/** Default LLM client — throws unless a real client is injected at integration time. */
export function createUnconfiguredPlannerLlmClient() {
  return {
    async complete(): Promise<never> {
      throw new Error(
        "TBGE Master Planner LLM client is not configured. Inject PlannerLlmClient via DI.",
      );
    },
  };
}
