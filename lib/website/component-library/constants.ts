/** Component Library specification format version. */
export const WB_COMPONENT_LIBRARY_SPEC_VERSION = "1.0.0";

/** Renderer contract version for component output agreements. */
export const WB_COMPONENT_RENDERER_CONTRACT_VERSION = "1.0.0";

/** Required manifest filename at the root of every component package. */
export const WB_COMPONENT_MANIFEST_FILENAME = "manifest.json";

/** Relative path from project root to installable website components. */
export const WB_COMPONENTS_RELATIVE_PATH = "components/website";

export const WB_COMPONENT_PACKAGE_DIRS = {
  schemas: "schemas",
  slots: "slots",
  variants: "variants",
  contracts: "contracts",
} as const;

/**
 * Capability-oriented groups — NOT business/industry groups.
 * Components are categorized by what they DO, not who they serve.
 */
export const WB_COMPONENT_CATEGORIES = [
  "navigation",
  "content",
  "media",
  "marketing",
  "commerce",
  "forms",
  "social",
  "interactive",
  "layout",
  "utility",
  "custom",
] as const;

/**
 * Fine-grained capabilities within a category.
 * Used for discovery, constraints, and composition rules.
 */
export const WB_COMPONENT_CAPABILITIES = [
  "nav-bar",
  "nav-link",
  "breadcrumb",
  "heading",
  "paragraph",
  "rich-text",
  "list",
  "quote",
  "image",
  "video",
  "gallery",
  "background",
  "hero-stack",
  "feature-grid",
  "cta-stack",
  "banner",
  "pricing-table",
  "product-card",
  "checkout-form",
  "input",
  "textarea",
  "select",
  "button",
  "button-group",
  "form-layout",
  "social-links",
  "share-bar",
  "accordion",
  "tabs",
  "modal",
  "carousel",
  "grid",
  "stack",
  "divider",
  "spacer",
  "container",
  "custom",
] as const;

export const WB_COMPONENT_SLOT_KINDS = [
  "single",
  "collection",
  "optional",
] as const;

export const WB_COMPONENT_VARIANT_STYLES = [
  "default",
  "minimal",
  "bold",
  "bordered",
  "elevated",
  "ghost",
] as const;

export const WB_COMPONENT_RESPONSIVE_MODES = [
  "stack",
  "hide",
  "collapse",
  "reflow",
  "scale",
] as const;

export const WB_COMPONENT_EDITABLE_KINDS = [
  "text",
  "richtext",
  "number",
  "boolean",
  "color",
  "image",
  "url",
  "enum",
  "spacing",
  "alignment",
] as const;

export const WB_COMPONENT_RENDERER_OUTPUTS = [
  "abstract-tree",
  "html-fragment",
] as const;
