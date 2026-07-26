/**
 * LLM classifier for compound App Copilot commands (Phase 4).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { providerManager } from "@/lib/ai/provider-manager";
import { asSupabaseSingleClient } from "@/lib/api/supabase-query";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import type { AppCopilotCapabilityUri } from "@/lib/ai-core/app-copilot/types";

const CAPABILITY_CATALOG: Array<{ uri: AppCopilotCapabilityUri; examples: string }> = [
  { uri: "app.brand.color.set", examples: "Change primary color to blue" },
  { uri: "app.catalog.add", examples: "Add a new product called Widget" },
  { uri: "app.screen.add", examples: "Add a dashboard screen" },
  { uri: "app.screen.remove", examples: "Remove the settings screen" },
  { uri: "app.feature.booking", examples: "Add booking feature" },
  { uri: "app.design.redesign", examples: "Redesign the application" },
  { uri: "app.data.add-model", examples: "Add customer management" },
  { uri: "app.backend.provision", examples: "Connect database" },
  { uri: "app.assistant.continue", examples: "Improve the app with AI" },
];

type ClassifierPayload = {
  commands?: string[];
  confidence?: number;
};

export type AppCompoundClassifierResult = {
  ok: true;
  commands: string[];
  confidence: number;
  classifierUsed: true;
};

export type AppCompoundClassifierFailure = {
  ok: false;
  reason: "provider_unavailable" | "invalid_response" | "empty";
};

export type AppCompoundClassifierOutcome =
  | AppCompoundClassifierResult
  | AppCompoundClassifierFailure;

export async function classifyAppCompoundCommand(params: {
  command: string;
  userId: string;
  supabase: SupabaseClient;
}): Promise<AppCompoundClassifierOutcome> {
  const text = params.command.trim();
  if (!text) return { ok: false, reason: "empty" };

  await providerManager.loadUserSettings(
    asSupabaseSingleClient(params.supabase),
    params.userId,
  );

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) return { ok: false, reason: "provider_unavailable" };

  try {
    const analysis = await providerManager.generateJson<ClassifierPayload>(
      {
        system:
          "You split compound app editing requests into separate executable commands. Respond with JSON only.",
        prompt: `Compound user command:
"""
${text}
"""

Capability catalog:
${JSON.stringify(CAPABILITY_CATALOG, null, 2)}

Return JSON: { "commands": ["..."], "confidence": 0.0-1.0 }`,
        temperature: 0.1,
      },
      resolved,
    );

    const commands = Array.isArray(analysis.commands)
      ? analysis.commands
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];

    if (!commands.length) return { ok: false, reason: "invalid_response" };

    return {
      ok: true,
      commands,
      confidence:
        typeof analysis.confidence === "number"
          ? Math.min(1, Math.max(0, analysis.confidence))
          : 0.75,
      classifierUsed: true,
    };
  } catch {
    return { ok: false, reason: "invalid_response" };
  }
}
