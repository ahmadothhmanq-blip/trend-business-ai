/**
 * SEO executor — applies top SEO fix via WebsiteSeoService (Phase 2).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { executeWebsiteSeoImprove } from "@/lib/website/platform/services/seo-service";
import type { WebsiteSeoApplySuccess } from "@/lib/website/platform/services/seo-service";

export async function executeSeoCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  command: string;
  capability: string;
  expectedRevision?: number;
}): Promise<
  WebsiteSeoApplySuccess | { ok: false; code: string; error: string }
> {
  const result = await executeWebsiteSeoImprove({
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

  if (!result.ok) {
    return result;
  }

  return result;
}
