/**
 * Resolve Copilot routing — rules first, optional LLM compound split (Phase 3).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyCompoundCommand } from "@/lib/ai-core/website-copilot/classifier";
import { routeCommand } from "@/lib/ai-core/website-copilot/router";
import type { CapabilityMatch } from "@/lib/ai-core/website-copilot/types";

export type ResolvedCopilotRoute = {
  match: CapabilityMatch;
  resolvedCommand: string;
  splitCommands?: string[];
  classifierUsed: boolean;
};

/**
 * Route a command via rules; optionally classify and split compound commands.
 */
export async function resolveCopilotRoute(params: {
  command: string;
  useClassifier?: boolean;
  userId?: string;
  supabase?: SupabaseClient;
}): Promise<ResolvedCopilotRoute> {
  const command = params.command.trim();
  const rulesMatch = routeCommand(command);

  if (
    !params.useClassifier ||
    rulesMatch.uri !== "website.advisory.compound" ||
    !params.userId ||
    !params.supabase
  ) {
    return {
      match: rulesMatch,
      resolvedCommand: command,
      classifierUsed: false,
    };
  }

  const classified = await classifyCompoundCommand({
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
  const primaryMatch = routeCommand(primary);

  if (
    primaryMatch.uri === "website.advisory.unknown" ||
    primaryMatch.uri === "website.advisory.compound"
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
