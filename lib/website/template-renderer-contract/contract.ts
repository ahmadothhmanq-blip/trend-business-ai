import {
  WB_TEMPLATE_RENDERER_CONTRACT_VERSION,
  WB_TEMPLATE_RENDERER_MIN_PACKAGE_SPEC_VERSION,
} from "@/lib/website/template-renderer-contract/constants";
import type { WbTemplateRenderer } from "@/lib/website/template-renderer-contract/types";

/** What a Template Renderer implementation is responsible for. */
export const WB_TEMPLATE_RENDERER_RESPONSIBILITIES = [
  "Accept a validated Template Package as the sole structural input.",
  "Normalize package documents into a stable runtime Template Model.",
  "Preserve layout, page, region, and placement rule semantics without mutation.",
  "Resolve effective placement rules per region (base region rules + global overrides).",
  "Expose catalog metadata required by the Website Builder template picker.",
  "Return contract-conformant output or structured renderer errors.",
  "Validate its own output against the runtime model contract before returning.",
] as const;

/** What a Template Renderer implementation must never do. */
export const WB_TEMPLATE_RENDERER_NON_RESPONSIBILITIES = [
  "Load or validate Template Packages from the filesystem (Template Engine).",
  "Parse manifest.json or perform package schema validation (Template Engine).",
  "Render React components or import component implementations.",
  "Generate HTML, CSS, inline styles, or preview documents.",
  "Apply themes, brand tokens, or Website Builder theme systems.",
  "Run AI generation, content filling, or copywriting.",
  "Read or mutate editor state, selection, undo stacks, or autosave payloads.",
  "Persist websites, publish artifacts, or write to project databases.",
  "Resolve component instances placed inside regions (Component Library / Builder).",
] as const;

/** Validation work owned by the renderer contract layer. */
export const WB_TEMPLATE_RENDERER_VALIDATION_RESPONSIBILITIES = [
  "Verify renderer input references a structurally complete validated package.",
  "Verify optional scope.pageId and scope.layoutId reference package entities.",
  "Verify runtime model contains all required top-level fields.",
  "Verify cross-references between layouts, regions, pages, and placement rules.",
  "Reject unsupported renderer contract versions.",
  "Reject packages below the minimum supported Template Package spec version.",
] as const;

/** Validation work explicitly owned elsewhere. */
export const WB_TEMPLATE_RENDERER_VALIDATION_NON_RESPONSIBILITIES = [
  "Filesystem package discovery (Template Loader).",
  "Zod/schema validation of package documents (Template Engine validator).",
  "Semver compatibility with the Template Engine runtime version.",
  "Media asset existence checks on disk.",
  "Component package validation (Component Library).",
  "Business content validation inside region slots.",
] as const;

export function describeRendererContract(): string {
  return [
    `contract=${WB_TEMPLATE_RENDERER_CONTRACT_VERSION}`,
    `packageSpec>=${WB_TEMPLATE_RENDERER_MIN_PACKAGE_SPEC_VERSION}`,
    "input=validated-template-package",
    "output=runtime-template-model",
  ].join(" · ");
}

export function assertRendererCallable(
  renderer: unknown,
): asserts renderer is WbTemplateRenderer {
  if (typeof renderer !== "function") {
    throw new TypeError("renderer must be a function");
  }
}
