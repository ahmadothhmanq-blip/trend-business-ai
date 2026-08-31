import {
  buildStaticPreviewHtml,
  extractStaticPreviewHtml,
} from "@/lib/website/build-static-preview.server";
import { previewInputFromGeneration } from "@/lib/website/live-preview";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

function isGeneratedWebsiteProject(
  value: unknown,
): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

/** Resolve sanitized live-preview HTML for an owned website generation. */
export function resolveLivePreviewHtml(generation: WebsiteGeneration): string {
  const input = previewInputFromGeneration(generation);
  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;

  if (blueprint?.files?.length) {
    return extractStaticPreviewHtml(blueprint.files, input);
  }

  return buildStaticPreviewHtml(input);
}

export function livePreviewResponseHeaders() {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, no-store",
    // Inline script: V2 reveal boot (__V2_REVEAL_BOOT__). Inline style: design tokens.
    // fonts.googleapis.com / fonts.gstatic.com: package @import font faces.
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com; script-src 'unsafe-inline' https://cdn.tailwindcss.com; font-src https://fonts.gstatic.com data:; img-src data: https: blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "X-Frame-Options": "SAMEORIGIN",
  };
}
