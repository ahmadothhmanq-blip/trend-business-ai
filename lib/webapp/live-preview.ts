/**
 * App Builder live preview resolver (App Builder only).
 */

import {
  buildAppPreviewHtml,
  extractAppPreviewFromFiles,
} from "@/lib/webapp/build-app-preview";
import { extractAppModelFromBlueprint } from "@/lib/ai-core/app-design-platform/management";
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

  const input = {
    model,
    activeScreenPath: options?.screenPath ?? null,
  };

  if (blueprint?.files?.length) {
    return extractAppPreviewFromFiles(blueprint.files, input);
  }

  return buildAppPreviewHtml(input);
}

export function appLivePreviewResponseHeaders() {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, no-store",
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline'; img-src data: https: blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "X-Frame-Options": "SAMEORIGIN",
  };
}
