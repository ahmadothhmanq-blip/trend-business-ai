import type { SupabaseClient } from "@supabase/supabase-js";
import { getWebsitePlatformPort } from "@/lib/website/platform/port";

/**
 * SEO executor — applies top SEO fix via WebsiteSeoService (Phase 2).
 */

export async function executeSeoCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  command: string;
  capability: string;
  expectedRevision?: number;
}) {
  const port = getWebsitePlatformPort();
  return port.executeSeoImprove({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    command: params.command,
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
