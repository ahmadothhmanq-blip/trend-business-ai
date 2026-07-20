/**
 * App management helpers — extract/persist model from webapp blueprint.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import type { AppVersionHistory } from "@/lib/ai-core/app-design-platform/versions";
import { emptyVersionHistory } from "@/lib/ai-core/app-design-platform/versions";
import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";

export type WebAppBlueprintBag = {
  title?: string;
  description?: string;
  appType?: string;
  framework?: string;
  pages?: Array<{ name: string; path: string; description: string }>;
  files?: GeneratedProjectFile[];
  settings?: Record<string, string>;
  prompt?: string;
  generatedAt?: string;
  progressEvents?: string[];
  appModel?: StructuredAppModel;
  versionHistory?: AppVersionHistory;
  [key: string]: unknown;
};

export function extractAppModelFromBlueprint(
  blueprint: unknown,
  fallback?: {
    prompt?: string;
    appType?: string;
    language?: string;
    designStyle?: string;
    colorStyle?: string;
    features?: string[];
    appName?: string;
  },
): StructuredAppModel {
  const bp = (blueprint || {}) as WebAppBlueprintBag;
  if (bp.appModel && typeof bp.appModel === "object" && Array.isArray(bp.appModel.screens)) {
    return bp.appModel;
  }

  const designed = runAppDesignEngine({
    prompt: fallback?.prompt || bp.prompt || bp.description || bp.title || "Business app",
    appType: fallback?.appType || bp.appType,
    language: fallback?.language || "English",
    designStyle: fallback?.designStyle,
    colorStyle: fallback?.colorStyle,
    features: fallback?.features,
  });

  if (fallback?.appName || bp.title) {
    designed.model.settings.appName = fallback?.appName || bp.title || designed.model.settings.appName;
    designed.model.brand.businessName = designed.model.settings.appName;
  }
  return designed.model;
}

export function extractVersionHistory(blueprint: unknown): AppVersionHistory {
  const bp = (blueprint || {}) as WebAppBlueprintBag;
  if (bp.versionHistory?.versions) return bp.versionHistory;
  return emptyVersionHistory();
}

export function withAppModel(
  blueprint: WebAppBlueprintBag,
  model: StructuredAppModel,
  history?: AppVersionHistory,
): WebAppBlueprintBag {
  return {
    ...blueprint,
    title: model.settings.appName || blueprint.title,
    appModel: model,
    ...(history ? { versionHistory: history } : {}),
  };
}
