/**
 * App Builder live preview resolver (App Builder only).
 */

import {
  buildAppPreviewHtml,
  finalizeLivePreviewHtml,
} from "@/lib/webapp/build-app-preview";
import { extractAppModelFromBlueprint } from "@/lib/ai-core/app-design-platform/management";
import { appPreviewSecurityHeaders } from "@/lib/webapp/sanitize-app-preview-html";
import type { WebAppGeneration } from "@/types/webapp";

export function resolveAppLivePreviewHtml(
  generation: WebAppGeneration,
  options?: { screenPath?: string | null },
): string {
  const blueprint = generation.blueprint;
  const model = extractAppModelFromBlueprint(blueprint, {
    prompt: generation.prompt,
    appType: generation.app_type,
    language: generation.language,
    designStyle: generation.design_style,
    colorStyle: generation.color_style,
    features: generation.features,
    appName: generation.app_name,
  });

  const html = buildAppPreviewHtml({
    model,
    activeScreenPath: options?.screenPath ?? null,
  });

  return finalizeLivePreviewHtml(html);
}

export function appLivePreviewResponseHeaders() {
  return appPreviewSecurityHeaders({
    cacheControl: "private, no-store",
    referrerPolicy: "same-origin",
    frameOptions: "SAMEORIGIN",
    interactive: true,
  });
}
