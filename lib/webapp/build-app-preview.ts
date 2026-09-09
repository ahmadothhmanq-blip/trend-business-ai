/**
 * App Builder live preview HTML — interactive in-memory SPA runtime.
 * Represents generated app structure with mock auth, routing, and CRUD.
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { buildInteractiveAppPreviewHtml } from "@/lib/webapp/interactive-preview/build";
import {
  sanitizeAppPreviewHtml,
  sanitizeTrustedInteractivePreviewHtml,
} from "@/lib/webapp/sanitize-app-preview-html";

export type AppPreviewInput = {
  model: StructuredAppModel;
  activeScreenPath?: string | null;
};

/** Build interactive live-preview HTML from the structured app model. */
export function buildAppPreviewHtml(input: AppPreviewInput): string {
  return buildInteractiveAppPreviewHtml(input);
}

const PREVIEW_PATHS = ["preview/index.html", "public/preview.html"];

/**
 * Prefer model-driven interactive preview. LLM/static preview files are sanitized
 * but never replace the interactive runtime for live preview fidelity.
 */
export function extractAppPreviewFromFiles(
  files: GeneratedProjectFile[] | undefined,
  fallback: AppPreviewInput,
): string {
  // Always render the interactive runtime from the model so preview behavior
  // matches generated screens/navigation/entities (not a static stub).
  void files;
  return sanitizeTrustedInteractivePreviewHtml(buildAppPreviewHtml(fallback));
}

/** Finalize HTML for the live-preview HTTP response. */
export function finalizeLivePreviewHtml(html: string): string {
  if (html.includes('data-preview-trusted="1"') && html.includes("__PREVIEW_RUNTIME__")) {
    return sanitizeTrustedInteractivePreviewHtml(html);
  }
  return sanitizeAppPreviewHtml(html);
}
