/**
 * Website Copilot SSE stream runner (Phase 3 + kernel Phase 4).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { runCopilotStreamLoop } from "@/lib/ai-core/copilot-kernel";
import { resolveCopilotRoute } from "@/lib/ai-core/website-copilot/resolve-route";
import { runCopilotCommand } from "@/lib/ai-core/website-copilot/processor";
import { routeCommand } from "@/lib/ai-core/website-copilot/router";
import type {
  CopilotCommandRequest,
  CopilotCommandSuccess,
} from "@/lib/ai-core/website-copilot/types";
import type { CopilotStreamSend } from "@/lib/ai-core/copilot-kernel";

export type { CopilotStreamSend };

export async function runCopilotCommandStream(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: CopilotCommandRequest;
  send: CopilotStreamSend;
  executeAllSplitSteps?: boolean;
}): Promise<void> {
  const executeAll = params.executeAllSplitSteps !== false;
  const useClassifier = params.request.useClassifier !== false;

  params.send("progress", { message: "Routing command…" });

  const resolved = await resolveCopilotRoute({
    command: params.request.command,
    useClassifier,
    userId: params.userId,
    supabase: params.supabase,
  });

  const commands =
    executeAll && resolved.splitCommands && resolved.splitCommands.length > 1
      ? resolved.splitCommands
      : [resolved.resolvedCommand];

  await runCopilotStreamLoop({
    commands,
    routingMeta: {
      capability: resolved.match.uri,
      classifierUsed: resolved.classifierUsed,
      splitCommands: resolved.splitCommands,
    },
    send: params.send,
    executeStep: async (stepCommand, index, stepCount) => {
      const match =
        index === 0 ? resolved.match : routeCommand(stepCommand);

      const result = await runCopilotCommand({
        supabase: params.supabase,
        userId: params.userId,
        generationId: params.generationId,
        request: {
          ...params.request,
          command: stepCommand,
          useClassifier: false,
          idempotencyKey:
            index === stepCount - 1
              ? params.request.idempotencyKey
              : undefined,
        },
        routing: {
          skipResolve: true,
          match,
          resolvedCommand: stepCommand,
          splitCommands: resolved.splitCommands,
          classifierUsed: resolved.classifierUsed,
          executedCommandIndex: index,
          executedCommandCount: stepCount,
        },
        onProgress: (message) => {
          params.send("progress", {
            message,
            step: index + 1,
            stepCount,
          });
        },
      });

      if (!result.ok) {
        return { ok: false, error: result.error, code: result.code };
      }

      return { ok: true, payload: result as CopilotCommandSuccess };
    },
  });
}
