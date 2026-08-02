/**
 * TBGE Orchestrator — Sprint 2: planning via Master Planner when TBGE_PLANNING=1.
 * Not wired to Website Builder. Requires TBGE_ENABLED=1.
 */

import { shouldUseTbgeOrchestrator } from "@/lib/tbge/flags";
import { createTbgeRunContext, transitionPhase } from "@/lib/tbge/kernel/run-context";
import { createTbgeRunBudget } from "@/lib/tbge/kernel/run-budget";
import type {
  TbgeOrchestratorDeps,
  TbgeRunInput,
  TbgeRunResult,
  TbgeRunTrace,
} from "@/lib/tbge/kernel/types";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { assertValidGenerationSpec } from "@/lib/tbge/spec/validator";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

export type TbgeOrchestrator = {
  run(input: TbgeRunInput): Promise<TbgeRunResult>;
};

export function createTbgeOrchestrator(deps: TbgeOrchestratorDeps): TbgeOrchestrator {
  return {
    async run(input: TbgeRunInput): Promise<TbgeRunResult> {
      const startedAt = new Date().toISOString();
      const ctx = createTbgeRunContext({
        brief: input.brief,
        mode: input.mode,
        profile: input.profile,
        flags: input.flags,
        onProgress: input.onProgress,
      });

      const trace: TbgeRunTrace = {
        runId: ctx.runId,
        phases: [...ctx.phasesVisited],
        llmCalls: 0,
        startedAt,
      };

      if (!shouldUseTbgeOrchestrator()) {
        return {
          status: "not_enabled",
          files: [],
          trace: {
            ...trace,
            completedAt: new Date().toISOString(),
          },
          message: "TBGE is disabled (set TBGE_ENABLED=1 to activate skeleton)",
        };
      }

      const budget = createTbgeRunBudget(ctx.profile);
      let spec: GenerationSpec | undefined = input.spec;

      try {
        transitionPhase(ctx, "planning");

        if (!spec) {
          if (!ctx.flags.planning) {
            transitionPhase(ctx, "failed");
            return {
              status: "failed",
              files: [],
              trace: {
                ...trace,
                phases: [...ctx.phasesVisited],
                llmCalls: budget.usedLlmCalls,
                completedAt: new Date().toISOString(),
                error: "GenerationSpec required (set TBGE_PLANNING=1 to enable Master Planner)",
              },
              message: "Planning disabled — provide a pre-built GenerationSpec or enable TBGE_PLANNING",
            };
          }

          if (!deps.masterPlanner || !deps.resolveAdapter) {
            transitionPhase(ctx, "failed");
            return {
              status: "failed",
              files: [],
              trace: {
                ...trace,
                phases: [...ctx.phasesVisited],
                llmCalls: budget.usedLlmCalls,
                completedAt: new Date().toISOString(),
                error: "Master Planner not configured in DI container",
              },
              message: "Master Planner dependencies missing",
            };
          }

          const adapter = deps.resolveAdapter(input.brief.productId);
          if (!adapter) {
            transitionPhase(ctx, "failed");
            return {
              status: "failed",
              files: [],
              trace: {
                ...trace,
                phases: [...ctx.phasesVisited],
                llmCalls: budget.usedLlmCalls,
                completedAt: new Date().toISOString(),
                error: `No TBGE adapter for product: ${input.brief.productId}`,
              },
              message: `Unsupported product: ${input.brief.productId}`,
            };
          }

          const planned = await deps.masterPlanner.plan({
            brief: input.brief,
            mode: ctx.mode,
            profile: ctx.profile,
            adapter,
            budget,
            onProgress: input.onProgress,
          });

          trace.llmCalls = budget.usedLlmCalls;

          if (!planned.ok) {
            transitionPhase(ctx, "failed");
            return {
              status: "failed",
              files: [],
              trace: {
                ...trace,
                phases: [...ctx.phasesVisited],
                llmCalls: budget.usedLlmCalls,
                completedAt: new Date().toISOString(),
                error: planned.errors.join("; "),
              },
              message: `Master Planner failed at ${planned.stage}`,
            };
          }

          spec = planned.spec;
        } else {
          assertValidGenerationSpec(spec);
          if (!isSpecLocked(spec)) {
            throw new Error("Provided GenerationSpec is not locked");
          }
        }

        transitionPhase(ctx, "spec_locked");

        if (ctx.flags.contentModel) {
          transitionPhase(ctx, "content_modeling");
        }

        transitionPhase(ctx, "assembling");
        const assembly = await deps.assemblyEngine.assemble(spec, {
          spec,
          onProgress: (message) => {
            input.onProgress?.({
              phase: "assembling",
              message,
              timestamp: new Date().toISOString(),
            });
          },
        });

        transitionPhase(ctx, "verifying");
        transitionPhase(ctx, "quality");
        transitionPhase(ctx, "finalizing");
        transitionPhase(ctx, "completed");

        return {
          status: "completed",
          spec,
          files: assembly.files,
          trace: {
            ...trace,
            phases: [...ctx.phasesVisited],
            llmCalls: budget.usedLlmCalls,
            completedAt: new Date().toISOString(),
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        transitionPhase(ctx, "failed");
        return {
          status: "failed",
          files: [],
          trace: {
            ...trace,
            phases: [...ctx.phasesVisited],
            llmCalls: budget.usedLlmCalls,
            completedAt: new Date().toISOString(),
            error: message,
          },
          message,
        };
      }
    },
  };
}
