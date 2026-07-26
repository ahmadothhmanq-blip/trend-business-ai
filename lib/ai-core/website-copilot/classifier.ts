/**
 * LLM classifier for compound Website Copilot commands (Phase 3).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { providerManager } from "@/lib/ai/provider-manager";
import { asSupabaseSingleClient } from "@/lib/api/supabase-query";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import type { CopilotCapabilityUri } from "@/lib/ai-core/website-copilot/types";

const CAPABILITY_CATALOG: Array<{ uri: CopilotCapabilityUri; examples: string }> = [
  {
    uri: "website.brand.color.set",
    examples: "Change primary color to #2563eb",
  },
  {
    uri: "website.design.style.modernize",
    examples: "Make the design more modern",
  },
  {
    uri: "website.section.add.testimonials",
    examples: "Add a testimonials section",
  },
  {
    uri: "website.section.regenerate.hero",
    examples: "Regenerate only the hero section",
  },
  {
    uri: "website.content.rewrite.home",
    examples: "Rewrite the homepage copy",
  },
  {
    uri: "website.page.add",
    examples: "Add an About page",
  },
  {
    uri: "website.image.replace.all",
    examples: "Replace all images with fresh photos",
  },
  {
    uri: "website.seo.improve",
    examples: "Improve SEO for this site",
  },
  {
    uri: "website.manage.catalog",
    examples: "Add a new service to the catalog",
  },
  {
    uri: "website.manage.cms",
    examples: "Add a blog post to CMS",
  },
];

type ClassifierPayload = {
  commands?: string[];
  confidence?: number;
};

export type CompoundClassifierResult = {
  ok: true;
  commands: string[];
  confidence: number;
  classifierUsed: true;
};

export type CompoundClassifierFailure = {
  ok: false;
  reason: "provider_unavailable" | "invalid_response" | "empty";
};

export type CompoundClassifierOutcome =
  | CompoundClassifierResult
  | CompoundClassifierFailure;

function normalizeCommands(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 5);
}

/**
 * Use LLM to split a compound natural-language command into ordered sub-commands.
 */
export async function classifyCompoundCommand(params: {
  command: string;
  userId: string;
  supabase: SupabaseClient;
}): Promise<CompoundClassifierOutcome> {
  const text = params.command.trim();
  if (!text) {
    return { ok: false, reason: "empty" };
  }

  await providerManager.loadUserSettings(
    asSupabaseSingleClient(params.supabase),
    params.userId,
  );

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) {
    return { ok: false, reason: "provider_unavailable" };
  }

  try {
    const analysis = await providerManager.generateJson<ClassifierPayload>(
      {
        system:
          "You split compound website editing requests into separate, executable commands. Each sub-command must use exactly one capability from the catalog. Respond with JSON only.",
        prompt: `Compound user command:
"""
${text}
"""

Capability catalog (each sub-command must map to one):
${JSON.stringify(CAPABILITY_CATALOG, null, 2)}

Rules:
- Return 1–5 sub-commands in execution order.
- Each sub-command must be self-contained natural language.
- Do not combine multiple capabilities in one sub-command.
- Preserve user intent; do not invent unrelated work.

Return JSON:
{
  "commands": ["first command", "second command"],
  "confidence": 0.0-1.0
}`,
        temperature: 0.1,
      },
      resolved,
    );

    const commands = normalizeCommands(analysis.commands);
    if (!commands.length) {
      return { ok: false, reason: "invalid_response" };
    }

    const confidence =
      typeof analysis.confidence === "number"
        ? Math.min(1, Math.max(0, analysis.confidence))
        : 0.75;

    return {
      ok: true,
      commands,
      confidence,
      classifierUsed: true,
    };
  } catch {
    return { ok: false, reason: "invalid_response" };
  }
}
