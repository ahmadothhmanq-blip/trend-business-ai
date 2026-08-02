import type { SupabaseClient } from "@supabase/supabase-js";
import { getWebsitePlatformPort } from "@/lib/website/platform/port";

/**
 * AiContinue executor — delegates to executeWebsiteEdit with AI continue.
 */

export async function executeAiContinueCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  command: string;
  expectedRevision?: number;
  capability: string;
}) {
  const port = getWebsitePlatformPort();
  return port.executeEdit({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    request: {
      command: params.command,
      applyAi: true,
    },
    commit: {
      expectedRevision: params.expectedRevision,
      operation: "website.copilot.command",
      mutationMeta: {
        capability: params.capability,
        tier: "ai-continue",
        command: params.command.slice(0, 200),
      },
    },
  });
}
