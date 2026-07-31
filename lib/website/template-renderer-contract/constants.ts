/** Template Renderer Contract version — governs input/output agreement only. */
export const WB_TEMPLATE_RENDERER_CONTRACT_VERSION = "1.0.0";

/** Minimum Template Package Specification the renderer contract accepts. */
export const WB_TEMPLATE_RENDERER_MIN_PACKAGE_SPEC_VERSION = "2.0.0";

/** Top-level keys required on every normalized runtime model. */
export const WB_TEMPLATE_RUNTIME_MODEL_REQUIRED_KEYS = [
  "contractVersion",
  "template",
  "metadata",
  "entry",
  "canvas",
  "layouts",
  "regions",
  "pages",
  "placementRules",
  "media",
] as const;

/** Renderer error codes — stable identifiers for contract violations. */
export const WB_TEMPLATE_RENDERER_ERROR_CODES = [
  "input.missing_package",
  "input.invalid_package",
  "input.unsupported_spec_version",
  "input.missing_page",
  "input.missing_layout",
  "output.invalid_model",
  "output.missing_field",
  "output.invalid_reference",
  "output.duplicate_id",
  "validation.layout_region_mismatch",
  "validation.page_layout_mismatch",
  "validation.page_region_mismatch",
  "validation.placement_override_unknown_region",
  "validation.constraint_unknown_region",
  "validation.constraint_unknown_page",
  "contract.unsupported_version",
] as const;
