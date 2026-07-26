/**
 * App Copilot SSE stream runner (Phase 4).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { runCopilotStreamLoop } from "@/lib/ai-core/copilot-kernel";
import { resolveAppCopilotRoute } from "@/lib/ai-core/app-copilot/resolve-route";
import { routeAppCommand } from "@/lib/ai-core/app-copilot/router";
import { runAppCopilotCommand } from "@/lib/ai-core/app-copilot/processor";
import type {
  AppCopilotCommandRequest,
  AppCopilotCommandSuccess,
} from "@/lib/ai-core/app-copilot/types";
import type { CopilotStreamSend } from "@/lib/ai-core/copilot-kernel";

export async function runAppCopilotCommandStream(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  request: AppCopilotCommandRequest;
  send: CopilotStreamSend;
  executeAllSplitSteps?: boolean;
}): Promise<void> {
  const executeAll = params.executeAllSplitSteps !== false;
  const useClassifier = params.request.useClassifier !== false;

  params.send("progress", { message: "Routing command…" });

  const resolved = await resolveAppCopilotRoute({
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
        index === 0 ? resolved.match : routeAppCommand(stepCommand);

      const result = await runAppCopilotCommand({
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

      return { ok: true, payload: result as AppCopilotCommandSuccess };
    },
  });
}
