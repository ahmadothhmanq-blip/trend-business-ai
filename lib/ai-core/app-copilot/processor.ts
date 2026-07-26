/**
 * App Copilot command processor — router → composer → executor → commit.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  attachCostHint,
  attachRoutingMeta,
  copilotMemoryEnabled,
  crossProductAdvisorySummary,
  detectCrossProductCommand,
  echoCopilotThreadOnly,
  enrichCommandWithMemory,
  finalizeCopilotPhase5,
  loadCopilotMemoryTurns,
  COPILOT_PRODUCT_APP,
} from "@/lib/ai-core/copilot-kernel";
import { composeAppPlan } from "@/lib/ai-core/app-copilot/composer";
import { estimateAppCopilotCost } from "@/lib/ai-core/app-copilot/cost-tier";
import { executeAdvisoryAppCopilotCommand } from "@/lib/ai-core/app-copilot/executors/advisory";
import { executeAiContinueAppCopilotCommand } from "@/lib/ai-core/app-copilot/executors/ai-continue";
import { executeLocalAppCopilotCommand } from "@/lib/ai-core/app-copilot/executors/local";
import { resolveAppCopilotRoute } from "@/lib/ai-core/app-copilot/resolve-route";
import { runAppCopilotReview } from "@/lib/ai-core/app-copilot/review";
import { enrichAppCommandWithSelection } from "@/lib/ai-core/app-copilot/selection-context";
import type {
  AppCapabilityMatch,
  AppCopilotCommandRequest,
  AppCopilotCommandResult,
  AppCopilotCommandSuccess,
} from "@/lib/ai-core/app-copilot/types";
import {
  loadWebappGenerationForUser,
  toWebappPayload,
} from "@/lib/webapp/platform/load-generation";
import { findWebappIdempotentCommit } from "@/lib/webapp/platform/idempotency";
import { storeWebappIdempotentCommit } from "@/lib/webapp/platform/idempotency";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type AppCopilotRoutingOverride = {
  skipResolve?: boolean;
  match: AppCapabilityMatch;
  resolvedCommand: string;
  splitCommands?: string[];
  classifierUsed: boolean;
  executedCommandIndex?: number;
  executedCommandCount?: number;
};

async function applyAppPhase5(
  supabase: SupabaseClient,
  params: {
    request: AppCopilotCommandRequest;
    userId: string;
    generationId: string;
    rawCommand: string;
    memoryEnabled: boolean;
    result: AppCopilotCommandSuccess;
    model?: StructuredAppModel;
    files?: GeneratedProjectFile[];
  },
): Promise<AppCopilotCommandSuccess> {
  return finalizeCopilotPhase5(supabase, {
    enabled: params.memoryEnabled,
    userId: params.userId,
    productId: COPILOT_PRODUCT_APP,
    generationId: params.generationId,
    sessionId: params.request.sessionId,
    rawCommand: params.rawCommand,
    result: params.result,
    includeReview: params.request.includeReview,
    mutated: params.result.mutated,
    runReview:
      params.result.mutated && params.model
        ? () =>
            runAppCopilotReview({
              model: params.model!,
              files: params.files,
            })
        : undefined,
  });
}

export async function runAppCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: AppCopilotCommandRequest;
  routing?: AppCopilotRoutingOverride;
  onProgress?: (message: string) => void;
}): Promise<AppCopilotCommandResult> {
  const rawCommand = params.request.command.trim();
  const memoryEnabled = copilotMemoryEnabled(params.request);
  const idempotencyKey = params.request.idempotencyKey?.trim();
  const applyAi = params.request.applyAi !== false;

  if (idempotencyKey) {
    const cached = await findWebappIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
    });
    const payload = cached?.response?.servicePayload;
    if (
      payload &&
      typeof payload === "object" &&
      "copilotResult" in payload &&
      payload.copilotResult &&
      typeof payload.copilotResult === "object"
    ) {
      const copilotResult = payload.copilotResult as AppCopilotCommandSuccess;
      const threadEcho = await echoCopilotThreadOnly(params.supabase, {
        enabled: memoryEnabled,
        userId: params.userId,
        productId: COPILOT_PRODUCT_APP,
        generationId: params.generationId,
        sessionId: params.request.sessionId,
      });
      return { ...copilotResult, fromIdempotency: true, ...threadEcho };
    }
  }

  const generation = await loadWebappGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Generation not found." };
  }

  const { model, files, blueprint } = toWebappPayload(generation);

  const crossProduct = detectCrossProductCommand(
    rawCommand,
    "app",
    params.request.linkedWebsiteGenerationId,
  );
  if (crossProduct.isCrossProduct && crossProduct.split) {
    const advisory = executeAdvisoryAppCopilotCommand({
      generation,
      model,
      capability: "app.advisory.cross-product",
      summary: crossProductAdvisorySummary("app"),
      includeExamples: false,
    });
    return applyAppPhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: { ...advisory, crossProductSplit: crossProduct.split },
      model,
      files,
    });
  }

  const memoryTurns = await loadCopilotMemoryTurns(params.supabase, {
    enabled: memoryEnabled,
    userId: params.userId,
    productId: COPILOT_PRODUCT_APP,
    generationId: params.generationId,
    sessionId: params.request.sessionId,
  });

  const command = enrichCommandWithMemory(
    enrichAppCommandWithSelection(rawCommand, params.request.selectionContext),
    memoryTurns,
  );
  params.onProgress?.("Routing command…");

  const resolved = params.routing?.skipResolve
    ? {
        match: params.routing.match,
        resolvedCommand: params.routing.resolvedCommand,
        splitCommands: params.routing.splitCommands,
        classifierUsed: params.routing.classifierUsed,
      }
    : await resolveAppCopilotRoute({
        command,
        useClassifier: params.request.useClassifier === true,
        userId: params.userId,
        supabase: params.supabase,
      });

  const effectiveCommand = resolved.resolvedCommand;
  const match = resolved.match;
  const plan = composeAppPlan(match);
  const costHint = estimateAppCopilotCost(match, plan);
  const routingMeta = params.routing ?? {
    match,
    resolvedCommand: effectiveCommand,
    splitCommands: resolved.splitCommands,
    classifierUsed: resolved.classifierUsed,
    executedCommandIndex: 0,
    executedCommandCount: resolved.splitCommands?.length ?? 1,
  };

  if (
    match.confidence < 0.5 ||
    plan.tier === "advisory" ||
    match.uri === "app.advisory.unknown" ||
    match.uri === "app.advisory.compound"
  ) {
    const summary =
      match.uri === "app.advisory.compound"
        ? resolved.classifierUsed
          ? "Could not split that compound command into supported steps. Try one command at a time."
          : "This looks like multiple commands. Enable the classifier or run them one at a time."
        : "I could not map that to a supported app command yet. Try one of the examples below.";
    return applyAppPhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: attachCostHint(
        attachRoutingMeta(
          executeAdvisoryAppCopilotCommand({
            generation,
            model,
            capability: match.uri,
            summary,
            includeExamples: true,
          }),
          routingMeta,
        ),
        costHint,
      ),
      model,
      files,
    });
  }

  if (plan.tier === "ai-continue" && !applyAi) {
    return applyAppPhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: attachCostHint(
        attachRoutingMeta(
          executeAdvisoryAppCopilotCommand({
            generation,
            model,
            capability: plan.capability,
            summary:
              "This command needs AI to complete. Enable AI or try a simpler local edit.",
            includeExamples: true,
          }),
          routingMeta,
        ),
        costHint,
      ),
      model,
      files,
    });
  }

  params.onProgress?.("Executing command…");

  const executor =
    plan.executor === "ai-continue"
      ? executeAiContinueAppCopilotCommand
      : executeLocalAppCopilotCommand;

  const result = await executor({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    command: effectiveCommand,
    capability: plan.capability,
    model,
    files,
    blueprint,
    generation,
    expectedRevision: params.request.expectedRevision,
  });

  if (!result.ok) {
    return {
      ok: false,
      code:
        result.code === "NOT_FOUND"
          ? "NOT_FOUND"
          : result.code === "CONFLICT"
            ? "CONFLICT"
            : result.code === "VALIDATION"
              ? "VALIDATION"
              : result.code === "PROVIDER_UNAVAILABLE"
                ? "PROVIDER_UNAVAILABLE"
                : "SERVER",
      error: result.error,
    };
  }

  const success = await applyAppPhase5(params.supabase, {
    request: params.request,
    userId: params.userId,
    generationId: params.generationId,
    rawCommand,
    memoryEnabled,
    result: attachCostHint(
      attachRoutingMeta(
        {
          ok: true,
          capability: plan.capability,
          tier: plan.tier === "ai-continue" ? "ai-continue" : "local",
          mutated: true,
          revision: result.revision,
          aiRunId: result.aiRunId,
          fromIdempotency: false,
          summary: result.summary,
          model: result.model,
          generation: result.generation,
          files: result.files,
          assistantResult: result.assistantResult,
          previewVersion: result.generation.updated_at,
        } satisfies AppCopilotCommandSuccess,
        routingMeta,
      ),
      costHint,
    ),
    model: result.model,
    files: result.files,
  });

  if (idempotencyKey) {
    await storeWebappIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
      operation: "webapp.copilot.command",
      response: {
        generation: result.generation,
        model: result.model,
        files: result.files,
        blueprint: result.blueprint,
        revision: success.revision,
        servicePayload: { copilotResult: success },
      },
      aiRunId: result.aiRunId,
    });
  }

  return success;
}
