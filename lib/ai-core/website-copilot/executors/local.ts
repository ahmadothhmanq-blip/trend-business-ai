/**
 * Local executor — deterministic edits without AI continue.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { executeWebsiteEdit } from "@/lib/website/platform/services/edit-service";
import type { WebsiteEditServiceSuccess } from "@/lib/website/platform/services/edit-service";

export async function executeLocalCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  command: string;
  expectedRevision?: number;
  capability: string;
}): Promise<WebsiteEditServiceSuccess | { ok: false; code: string; error: string }> {
  const result = await executeWebsiteEdit({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    request: {
      command: params.command,
      applyAi: false,
    },
    commit: {
      expectedRevision: params.expectedRevision,
      operation: "website.copilot.command",
      mutationMeta: {
        capability: params.capability,
        tier: "local",
        command: params.command.slice(0, 200),
      },
    },
  });

  if (!result.ok) {
    return result;
  }

  return result;
}
