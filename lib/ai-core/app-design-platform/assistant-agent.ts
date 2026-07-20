/**
 * AI App Assistant Agent — AI Core + structured mutations + file sync.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type {
  AppAssistantResult,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import { runAppAssistant } from "@/lib/ai-core/app-design-platform/assistant";
import { addScreen, updateAppSettings } from "@/lib/ai-core/app-design-platform/model-builder";
import { applyBrandKitToModel } from "@/lib/ai-core/app-design-platform/brand";
import { upsertDataModel, connectScreenToData } from "@/lib/ai-core/app-design-platform/data";
import { upsertRole } from "@/lib/ai-core/app-design-platform/roles";
import { runAppQualityChecks } from "@/lib/ai-core/app-design-platform/quality";
import { syncAppModelToFiles } from "@/lib/ai-core/app-design-platform/sync";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type AppAssistantAgentResult = AppAssistantResult & {
  sync?: { updatedPaths: string[]; notes: string[] };
  quality?: ReturnType<typeof runAppQualityChecks>;
  files?: GeneratedProjectFile[];
};

const COMMAND_PATTERNS: Array<{
  pattern: RegExp;
  apply: (model: StructuredAppModel, match: RegExpMatchArray) => StructuredAppModel;
  label: string;
}> = [
  {
    pattern: /add\s+payment\s+system/i,
    label: "Add payment system",
    apply: (model) =>
      upsertDataModel(
        {
          ...model,
          featureFlags: Array.from(new Set([...model.featureFlags, "payments", "stripe"])),
        },
        {
          name: "Payment",
          label: "Payments",
          fields: [
            { name: "amount", type: "money", required: true },
            { name: "status", type: "enum", enumValues: ["pending", "paid", "failed"] },
            { name: "customerId", type: "relation", relationTo: "Customer" },
          ],
          relations: [],
          crud: ["create", "read", "list"],
        },
      ),
  },
  {
    pattern: /create\s+orders?\s+dashboard/i,
    label: "Create orders dashboard",
    apply: (model) => {
      let next = addScreen(model, {
        name: "Orders Dashboard",
        path: "/orders",
        purpose: "Track and manage orders",
        roles: ["admin", "manager"],
      });
      const screen = next.screens[next.screens.length - 1]!;
      return connectScreenToData(next, screen.id, "Order");
    },
  },
  {
    pattern: /add\s+customer\s+management/i,
    label: "Add customer management",
    apply: (model) =>
      upsertDataModel(model, {
        name: "Customer",
        label: "Customers",
        fields: [
          { name: "name", type: "string", required: true },
          { name: "email", type: "string", unique: true },
          { name: "phone", type: "string" },
        ],
        relations: [],
        crud: ["create", "read", "update", "delete", "list"],
      }),
  },
  {
    pattern: /change\s+application\s+design|redesign\s+app/i,
    label: "Change application design",
    apply: (model) =>
      applyBrandKitToModel(model, {
        name: model.brand.businessName,
        primary: "#6366F1",
        accent: "#22D3EE",
        secondary: "#1E293B",
      }),
  },
  {
    pattern: /create\s+admin\s+panel/i,
    label: "Create admin panel",
    apply: (model) => {
      let next = addScreen(model, {
        name: "Admin Panel",
        path: "/admin",
        purpose: "Administrative controls",
        roles: ["admin"],
      });
      next = upsertRole(next, {
        name: "admin",
        description: "Full administrative access",
        permissions: {
          screens: next.screens.map((s) => s.id),
          actions: ["*"],
          dataAccess: "all",
        },
      });
      return next;
    },
  },
  {
    pattern: /connect\s+database/i,
    label: "Connect database",
    apply: (model) => ({
      ...model,
      featureFlags: Array.from(new Set([...model.featureFlags, "database", "supabase"])),
      settings: {
        ...model.settings,
        features: Array.from(new Set([...model.settings.features, "database"])),
      },
      updatedAt: new Date().toISOString(),
      version: model.version + 1,
    }),
  },
];

async function tryLlmPlan(
  message: string,
  model: StructuredAppModel,
): Promise<string[] | null> {
  try {
    const providerName = getDefaultTextProvider();
    const provider = providerManager.resolve(providerName);
    if (!provider || !providerManager.isConfigured(provider)) return null;

    const prompt = `You are an App Builder assistant. Given the user command and app summary, return ONLY a JSON array of action strings (max 5) to apply. No markdown.

App: ${model.settings.appName} (${model.templateId})
Screens: ${model.screens.map((s) => s.name).join(", ")}
Data models: ${model.dataModels.map((d) => d.name).join(", ")}

User: ${message}`;

    const text = await providerManager.generateText(
      { prompt, temperature: 0.2 },
      providerName,
    );
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
}

export async function runAppAssistantAgent(params: {
  message: string;
  model: StructuredAppModel;
  files?: GeneratedProjectFile[];
  syncFiles?: boolean;
}): Promise<AppAssistantAgentResult> {
  const message = params.message.trim();
  let model = params.model;
  const actions: string[] = [];
  const notes: string[] = [];
  let applied = false;

  for (const cmd of COMMAND_PATTERNS) {
    const match = message.match(cmd.pattern);
    if (match) {
      model = cmd.apply(model, match);
      actions.push(cmd.label);
      applied = true;
    }
  }

  if (!applied) {
    const fallback = runAppAssistant({ message, model: params.model });
    if (fallback.applied && fallback.model) {
      model = fallback.model;
      actions.push(...fallback.actions);
      notes.push(...fallback.notes);
      applied = true;
    } else {
      const llmActions = await tryLlmPlan(message, params.model);
      if (llmActions?.length) {
        notes.push(`AI plan: ${llmActions.join(" → ")}`);
        for (const action of llmActions) {
          const inner = await runAppAssistantAgent({
            message: action,
            model,
            files: params.files,
            syncFiles: false,
          });
          if (inner.applied && inner.model) {
            model = inner.model;
            actions.push(...inner.actions);
            applied = true;
          }
        }
      }
      if (!applied) {
        return {
          ...fallback,
          understood: message,
          quality: runAppQualityChecks({ model: params.model, files: params.files }),
        };
      }
    }
  }

  let syncResult;
  let files = params.files;
  if (params.syncFiles !== false && files) {
    syncResult = syncAppModelToFiles(model, files);
    files = syncResult.files;
    notes.push(...syncResult.notes);
  }

  const quality = runAppQualityChecks({ model, files: files ?? [] });

  return {
    understood: message,
    actions,
    applied: true,
    notes,
    model,
    command: actions[0],
    sync: syncResult ? { updatedPaths: syncResult.updatedPaths, notes: syncResult.notes } : undefined,
    quality,
    files,
  };
}
