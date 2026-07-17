import {
  buildStaticPreviewHtml,
  extractStaticPreviewHtml,
  type StaticPreviewInput,
} from "@/lib/website/build-static-preview";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

function isGeneratedWebsiteProject(value: unknown): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

export function previewInputFromGeneration(
  generation: WebsiteGeneration,
): StaticPreviewInput {
  const blueprint = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;

  return {
    title: blueprint?.title || generation.project_name,
    description: blueprint?.description || generation.business_description,
    pages: blueprint?.pages,
    sections: blueprint?.sections,
    colorPalette: blueprint?.colorPalette,
    typography: blueprint?.typography,
    content: blueprint?.content,
    components: blueprint?.components,
  };
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
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "X-Frame-Options": "SAMEORIGIN",
  };
}
