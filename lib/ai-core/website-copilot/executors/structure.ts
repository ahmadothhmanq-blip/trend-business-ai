/**
 * Structure executor — delegates to WebsiteStructureService (Phase 2).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CapabilityMatch } from "@/lib/ai-core/website-copilot/types";
import {
  executeWebsiteStructureMutation,
  type WebsiteManageAction,
  type WebsiteStructureServiceSuccess,
} from "@/lib/website/platform/services/structure-service";

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveStructureAction(
  command: string,
  capability: string,
  match: CapabilityMatch,
): WebsiteManageAction {
  if (capability === "website.page.add") {
    const pageMatch =
      command.match(/add\s+(?:an?\s+)?(.+?)\s+page/i) ||
      command.match(/create\s+(?:an?\s+)?(.+?)\s+page/i) ||
      command.match(/add\s+(?:a\s+)?(about|contact|services|pricing|blog)/i);
    const raw = (pageMatch?.[1] || "New").trim();
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    const route = `/${slugify(raw)}`;
    return {
      action: "pages.create",
      label,
      route,
      purpose: `Page created via Copilot: ${label}`,
    };
  }

  if (capability === "website.manage.cms") {
    const titleMatch = command.match(
      /(?:add|create|publish)\s+(?:a\s+)?(?:blog\s+)?(?:post|article)(?:\s+(?:called|named|titled))?\s*["']?([^"'\n]+)?/i,
    );
    const title = (titleMatch?.[1] || "New article").trim();
    return {
      action: "cms.upsert",
      entry: {
        title,
        kind: "post",
        slug: slugify(title),
        body: `# ${title}\n\nDraft content — edit in CMS.`,
        published: false,
      },
    };
  }

  if (capability === "website.manage.catalog") {
    return { action: "assistant", message: command };
  }

  const slotLabel =
    typeof match.slots.label === "string" ? match.slots.label : undefined;
  if (slotLabel) {
    return {
      action: "pages.create",
      label: slotLabel,
      route: `/${slugify(slotLabel)}`,
    };
  }

  return { action: "assistant", message: command };
}

export async function executeStructureCopilotCommand(params: {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  command: string;
  capability: string;
  match: CapabilityMatch;
  expectedRevision?: number;
}): Promise<
  WebsiteStructureServiceSuccess | { ok: false; code: string; error: string }
> {
  const action = resolveStructureAction(
    params.command,
    params.capability,
    params.match,
  );

  const result = await executeWebsiteStructureMutation({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    action,
    commit: {
      expectedRevision: params.expectedRevision,
      operation: "website.copilot.command",
      mutationMeta: {
        capability: params.capability,
        tier: "local",
        manageAction: action.action,
        command: params.command.slice(0, 200),
      },
    },
  });

  if (!result.ok) {
    return result;
  }

  if (!result.project || !result.generation) {
    return {
      ok: false,
      code: "SERVER",
      error: "Structure mutation did not return project.",
    };
  }

  return result;
}
