/**
 * Copilot runtime kernel — generic multi-step SSE loop (Phase 4).
 */

import type { CopilotRoutingMeta, CopilotStreamSend } from "@/lib/ai-core/copilot-kernel/types";

export type CopilotStreamStepResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: string; code?: string };

export async function runCopilotStreamLoop(params: {
  commands: string[];
  routingMeta: CopilotRoutingMeta & { capability?: string };
  send: CopilotStreamSend;
  executeStep: (
    command: string,
    index: number,
    stepCount: number,
  ) => Promise<CopilotStreamStepResult>;
}): Promise<void> {
  const stepCount = params.commands.length;
  let lastPayload: Record<string, unknown> | null = null;

  for (let index = 0; index < stepCount; index++) {
    const stepCommand = params.commands[index]!;
    params.send("progress", {
      message:
        stepCount > 1
          ? `Step ${index + 1} of ${stepCount}: ${stepCommand}`
          : "Executing command…",
      step: index + 1,
      stepCount,
      capability: params.routingMeta.capability,
      classifierUsed: params.routingMeta.classifierUsed,
    });

    const result = await params.executeStep(stepCommand, index, stepCount);
    if (!result.ok) {
      params.send("error", {
        error: result.error,
        code: result.code,
        step: index + 1,
        stepCount,
      });
      return;
    }

    lastPayload = {
      ...result.payload,
      classifierUsed: params.routingMeta.classifierUsed,
      splitCommands: params.routingMeta.splitCommands,
      executedCommandIndex: index,
      executedCommandCount: stepCount,
    };

    if (result.payload.mutated === false && stepCount === 1) {
      params.send("complete", lastPayload);
      return;
    }
  }

  if (lastPayload) {
    params.send("complete", lastPayload);
    return;
  }

  params.send("error", { error: "No command result produced." });
}
