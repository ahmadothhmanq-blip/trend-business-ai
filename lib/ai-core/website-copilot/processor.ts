/**
 * Website Copilot command processor — router → composer → executor → commit.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { composePlan } from "@/lib/ai-core/website-copilot/composer";
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
  COPILOT_PRODUCT_WEBSITE,
} from "@/lib/ai-core/copilot-kernel";
import { estimateCopilotCost } from "@/lib/ai-core/website-copilot/cost-tier";
import { executeAdvisoryCopilotCommand } from "@/lib/ai-core/website-copilot/executors/advisory";
import { executeAiContinueCopilotCommand } from "@/lib/ai-core/website-copilot/executors/ai-continue";
import { executeLocalCopilotCommand } from "@/lib/ai-core/website-copilot/executors/local";
import { executeSeoCopilotCommand } from "@/lib/ai-core/website-copilot/executors/seo";
import { executeStructureCopilotCommand } from "@/lib/ai-core/website-copilot/executors/structure";
import { resolveCopilotRoute } from "@/lib/ai-core/website-copilot/resolve-route";
import { runWebsiteCopilotReview } from "@/lib/ai-core/website-copilot/review";
import { enrichCommandWithSelection } from "@/lib/ai-core/website-copilot/selection-context";
import type {
  CapabilityMatch,
  CopilotCommandRequest,
  CopilotCommandResult,
  CopilotCommandSuccess,
  CopilotEditResultPayload,
} from "@/lib/ai-core/website-copilot/types";
import { validatePostCommandL1 } from "@/lib/ai-core/website-copilot/validators/post-command";
import { findIdempotentCommit, storeIdempotentCommit } from "@/lib/website/platform/idempotency";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";
import { readBlueprintRevisionFromGeneration } from "@/lib/website/platform/revision";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import type { WebsiteEditServiceSuccess } from "@/lib/website/platform/services/edit-service";
import type { WebsiteSeoApplySuccess } from "@/lib/website/platform/services/seo-service";
import type { WebsiteStructureServiceSuccess } from "@/lib/website/platform/services/structure-service";

function formatEditPayload(
  edit: WebsiteEditServiceSuccess["editResult"],
): CopilotEditResultPayload {
  const actionsApplied = edit.actionsApplied.map((action) => {
    return (
      action.notes ||
      `${action.type}${action.target ? ` → ${action.target}` : ""}`
    );
  });
  return {
    summary: edit.summary,
    actionsApplied,
    appliedNotes: edit.appliedNotes,
    suggestions: edit.suggestions,
    continueInstruction: edit.continueInstruction,
  };
}

function buildEditMutationSuccess(params: {
  capability: string;
  tier: "local" | "ai-continue";
  edit: WebsiteEditServiceSuccess;
  fromIdempotency: boolean;
  warnings?: string[];
}): CopilotCommandSuccess {
  const { generation, project, editResult } = params.edit;
  return {
    ok: true,
    capability: params.capability,
    tier: params.tier,
    mutated: true,
    revision: readBlueprintRevisionFromGeneration(generation),
    aiRunId: params.edit.aiRunId ?? null,
    fromIdempotency: params.fromIdempotency,
    summary: editResult.summary,
    project,
    generation,
    editResult: formatEditPayload(editResult),
    warnings: params.warnings,
    previewVersion: generation.updated_at,
  };
}

function buildStructureMutationSuccess(params: {
  capability: string;
  result: WebsiteStructureServiceSuccess;
}): CopilotCommandSuccess {
  const { project, generation } = params.result;
  const summary =
    params.result.notes?.join(" · ") ||
    params.result.assistant?.notes?.join(" · ") ||
    "Structure updated.";
  return {
    ok: true,
    capability: params.capability,
    tier: "local",
    mutated: true,
    revision: readBlueprintRevisionFromGeneration(generation!),
    aiRunId: null,
    fromIdempotency: false,
    summary,
    project,
    generation,
    manageResult: {
      summary,
      notes: params.result.notes ?? [],
      editCommand: params.result.editCommand ?? null,
    },
    previewVersion: generation!.updated_at,
  };
}

function buildSeoMutationSuccess(params: {
  capability: string;
  result: WebsiteSeoApplySuccess;
}): CopilotCommandSuccess {
  const { project, generation, fix, notes } = params.result;
  const summary = `Applied SEO fix: ${fix.title}`;
  return {
    ok: true,
    capability: params.capability,
    tier: "ai-continue",
    mutated: true,
    revision:
      params.result.revision ??
      readBlueprintRevisionFromGeneration(generation),
    aiRunId: params.result.aiRunId ?? null,
    fromIdempotency: false,
    summary,
    project,
    generation,
    seoResult: {
      summary,
      fixId: fix.id,
      fixTitle: fix.title,
      notes,
    },
    previewVersion: generation.updated_at,
  };
}

export type CopilotRoutingOverride = {
  skipResolve?: boolean;
  match: CapabilityMatch;
  resolvedCommand: string;
  splitCommands?: string[];
  classifierUsed: boolean;
  executedCommandIndex?: number;
  executedCommandCount?: number;
};

async function applyWebsitePhase5(
  supabase: SupabaseClient,
  params: {
    request: CopilotCommandRequest;
    userId: string;
    generationId: string;
    rawCommand: string;
    memoryEnabled: boolean;
    result: CopilotCommandSuccess;
    project?: GeneratedWebsiteProject;
    generation?: WebsiteGeneration;
  },
): Promise<CopilotCommandSuccess> {
  return finalizeCopilotPhase5(supabase, {
    enabled: params.memoryEnabled,
    userId: params.userId,
    productId: COPILOT_PRODUCT_WEBSITE,
    generationId: params.generationId,
    sessionId: params.request.sessionId,
    rawCommand: params.rawCommand,
    result: params.result,
    includeReview: params.request.includeReview,
    mutated: params.result.mutated,
    runReview:
      params.result.mutated && params.project
        ? () =>
            runWebsiteCopilotReview({
              project: params.project!,
              prompt: params.generation?.business_description ?? undefined,
            })
        : undefined,
  });
}

export async function runCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: CopilotCommandRequest;
  routing?: CopilotRoutingOverride;
  onProgress?: (message: string) => void;
}): Promise<CopilotCommandResult> {
  const rawCommand = params.request.command.trim();
  const memoryEnabled = copilotMemoryEnabled(params.request);
  const idempotencyKey = params.request.idempotencyKey?.trim();
  const applyAi = params.request.applyAi !== false;

  if (idempotencyKey) {
    const cached = await findIdempotentCommit(params.supabase, {
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
      const copilotResult = payload.copilotResult as CopilotCommandSuccess;
      const threadEcho = await echoCopilotThreadOnly(params.supabase, {
        enabled: memoryEnabled,
        userId: params.userId,
        productId: COPILOT_PRODUCT_WEBSITE,
        generationId: params.generationId,
        sessionId: params.request.sessionId,
      });
      return { ...copilotResult, fromIdempotency: true, ...threadEcho };
    }
  }

  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return {
      ok: false,
      code: "NOT_FOUND",
      error: "Generation not found.",
    };
  }

  const project = toWebsiteProject(generation);

  const crossProduct = detectCrossProductCommand(
    rawCommand,
    "website",
    params.request.linkedAppGenerationId,
  );
  if (crossProduct.isCrossProduct && crossProduct.split) {
    const advisory = executeAdvisoryCopilotCommand({
      generation,
      project,
      capability: "website.advisory.cross-product",
      summary: crossProductAdvisorySummary("website"),
      includeExamples: false,
    });
    return applyWebsitePhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: { ...advisory, crossProductSplit: crossProduct.split },
      project,
      generation,
    });
  }

  const memoryTurns = await loadCopilotMemoryTurns(params.supabase, {
    enabled: memoryEnabled,
    userId: params.userId,
    productId: COPILOT_PRODUCT_WEBSITE,
    generationId: params.generationId,
    sessionId: params.request.sessionId,
  });

  const command = enrichCommandWithMemory(
    enrichCommandWithSelection(rawCommand, params.request.selectionContext),
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
    : await resolveCopilotRoute({
        command,
        useClassifier: params.request.useClassifier === true,
        userId: params.userId,
        supabase: params.supabase,
      });

  const effectiveCommand = resolved.resolvedCommand;
  const match = resolved.match;
  const plan = composePlan(match);
  const costHint = estimateCopilotCost(match, plan);
  const routingMeta: CopilotRoutingOverride | undefined = params.routing ?? {
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
    match.uri === "website.advisory.unknown" ||
    match.uri === "website.advisory.compound"
  ) {
    const summary =
      match.uri === "website.advisory.compound"
        ? resolved.classifierUsed
          ? "Could not split that compound command into supported steps. Try one command at a time."
          : "This looks like multiple commands. Enable the classifier or run them one at a time."
        : "I could not map that to a supported command yet. Try one of the examples below.";
    return applyWebsitePhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: attachCostHint(
        attachRoutingMeta(
          executeAdvisoryCopilotCommand({
            generation,
            project,
            capability: match.uri,
            summary,
            includeExamples: true,
            includePhase2Examples: true,
          }),
          routingMeta,
        ),
        costHint,
      ),
      project,
      generation,
    });
  }

  if (plan.tier === "ai-continue" && !applyAi) {
    return applyWebsitePhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: attachCostHint(
        attachRoutingMeta(
          executeAdvisoryCopilotCommand({
            generation,
            project,
            capability: plan.capability,
            summary:
              "This command needs AI to complete. Enable AI or try a simpler local edit such as changing the primary color.",
            includeExamples: true,
            includePhase2Examples: true,
          }),
          routingMeta,
        ),
        costHint,
      ),
      project,
      generation,
    });
  }

  params.onProgress?.("Executing command…");

  if (plan.executor === "structure") {
    const structureResult = await executeStructureCopilotCommand({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      command: effectiveCommand,
      capability: plan.capability,
      match,
      expectedRevision: params.request.expectedRevision,
    });

    if (!structureResult.ok) {
      return {
        ok: false,
        code:
          structureResult.code === "NOT_FOUND"
            ? "NOT_FOUND"
            : structureResult.code === "CONFLICT"
              ? "CONFLICT"
              : structureResult.code === "VALIDATION"
                ? "VALIDATION"
                : "SERVER",
        error: structureResult.error,
      };
    }

    const success = await applyWebsitePhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: attachCostHint(
        attachRoutingMeta(
          buildStructureMutationSuccess({
            capability: plan.capability,
            result: structureResult,
          }),
          routingMeta,
        ),
        costHint,
      ),
      project: structureResult.project,
      generation: structureResult.generation,
    });

    if (idempotencyKey) {
      await storeIdempotentCommit(params.supabase, {
        userId: params.userId,
        generationId: params.generationId,
        idempotencyKey,
        operation: "website.copilot.command",
        response: {
          generation: structureResult.generation,
          project: structureResult.project,
          revision: success.revision,
          servicePayload: { copilotResult: success },
        },
        aiRunId: null,
      });
    }

    return success;
  }

  if (plan.executor === "seo") {
    const seoResult = await executeSeoCopilotCommand({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      command: effectiveCommand,
      capability: plan.capability,
      expectedRevision: params.request.expectedRevision,
    });

    if (!seoResult.ok) {
      return {
        ok: false,
        code:
          seoResult.code === "NOT_FOUND"
            ? "NOT_FOUND"
            : seoResult.code === "CONFLICT"
              ? "CONFLICT"
              : seoResult.code === "VALIDATION"
                ? "VALIDATION"
                : /provider|unavailable|no model/i.test(seoResult.error)
                  ? "PROVIDER_UNAVAILABLE"
                  : "SERVER",
        error: seoResult.error,
      };
    }

    const success = await applyWebsitePhase5(params.supabase, {
      request: params.request,
      userId: params.userId,
      generationId: params.generationId,
      rawCommand,
      memoryEnabled,
      result: attachCostHint(
        attachRoutingMeta(
          buildSeoMutationSuccess({
            capability: plan.capability,
            result: seoResult,
          }),
          routingMeta,
        ),
        costHint,
      ),
      project: seoResult.project,
      generation: seoResult.generation,
    });

    if (idempotencyKey) {
      await storeIdempotentCommit(params.supabase, {
        userId: params.userId,
        generationId: params.generationId,
        idempotencyKey,
        operation: "website.copilot.command",
        response: {
          generation: seoResult.generation,
          project: seoResult.project,
          revision: success.revision,
          servicePayload: { copilotResult: success },
        },
        aiRunId: seoResult.aiRunId ?? null,
      });
    }

    return success;
  }

  let editResult:
    | WebsiteEditServiceSuccess
    | { ok: false; code: string; error: string };

  const imageCommand =
    plan.capability === "website.image.replace.all"
      ? `${effectiveCommand}. Regenerate all website images with fresh, industry-appropriate photography.`
      : effectiveCommand;

  if (plan.executor === "local") {
    editResult = await executeLocalCopilotCommand({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      command: imageCommand,
      expectedRevision: params.request.expectedRevision,
      capability: plan.capability,
    });
  } else {
    editResult = await executeAiContinueCopilotCommand({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      command: imageCommand,
      expectedRevision: params.request.expectedRevision,
      capability: plan.capability,
    });
  }

  if (!editResult.ok) {
    const code =
      editResult.code === "NOT_FOUND"
        ? "NOT_FOUND"
        : editResult.code === "CONFLICT"
          ? "CONFLICT"
          : editResult.code === "VALIDATION"
            ? "VALIDATION"
            : /provider|unavailable|no model/i.test(editResult.error)
              ? "PROVIDER_UNAVAILABLE"
              : "SERVER";
    return {
      ok: false,
      code,
      error: editResult.error,
    };
  }

  const l1 = validatePostCommandL1({
    project: editResult.project,
    prompt: generation.business_description ?? undefined,
    language: generation.language ?? undefined,
  });

  const success = await applyWebsitePhase5(params.supabase, {
    request: params.request,
    userId: params.userId,
    generationId: params.generationId,
    rawCommand,
    memoryEnabled,
    result: attachCostHint(
      attachRoutingMeta(
        buildEditMutationSuccess({
          capability: plan.capability,
          tier: plan.tier === "local" ? "local" : "ai-continue",
          edit: editResult,
          fromIdempotency: false,
          warnings: l1.warnings.length ? l1.warnings : undefined,
        }),
        routingMeta,
      ),
      costHint,
    ),
    project: editResult.project,
    generation: editResult.generation,
  });

  success.revision = readBlueprintRevisionFromGeneration(editResult.generation);

  if (idempotencyKey) {
    await storeIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
      operation: "website.copilot.command",
      response: {
        generation: editResult.generation,
        project: editResult.project,
        revision: success.revision,
        servicePayload: { copilotResult: success },
      },
      aiRunId: editResult.aiRunId ?? null,
    });
  }

  return success;
}
