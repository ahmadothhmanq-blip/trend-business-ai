/**
 * Resolve App Copilot routing — rules first, optional LLM compound split.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyAppCompoundCommand } from "@/lib/ai-core/app-copilot/classifier";
import { routeAppCommand } from "@/lib/ai-core/app-copilot/router";
import type { AppCapabilityMatch } from "@/lib/ai-core/app-copilot/types";

export type ResolvedAppCopilotRoute = {
  match: AppCapabilityMatch;
  resolvedCommand: string;
  splitCommands?: string[];
  classifierUsed: boolean;
};

export async function resolveAppCopilotRoute(params: {
  command: string;
  useClassifier?: boolean;
  userId?: string;
  supabase?: SupabaseClient;
}): Promise<ResolvedAppCopilotRoute> {
  const command = params.command.trim();
  const rulesMatch = routeAppCommand(command);

  if (
    !params.useClassifier ||
    rulesMatch.uri !== "app.advisory.compound" ||
    !params.userId ||
    !params.supabase
  ) {
    return {
      match: rulesMatch,
      resolvedCommand: command,
      classifierUsed: false,
    };
  }

  const classified = await classifyAppCompoundCommand({
    command,
    userId: params.userId,
    supabase: params.supabase,
  });

  if (!classified.ok || classified.commands.length === 0) {
    return {
      match: rulesMatch,
      resolvedCommand: command,
      classifierUsed: false,
    };
  }

  const primary = classified.commands[0]!;
  const primaryMatch = routeAppCommand(primary);

  if (
    primaryMatch.uri === "app.advisory.unknown" ||
    primaryMatch.uri === "app.advisory.compound"
  ) {
    return {
      match: rulesMatch,
      resolvedCommand: command,
      splitCommands: classified.commands,
      classifierUsed: true,
    };
  }

  return {
    match: primaryMatch,
    resolvedCommand: primary,
    splitCommands: classified.commands,
    classifierUsed: true,
  };
}
