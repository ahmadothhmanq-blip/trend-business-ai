import {
  WB_TEMPLATE_RENDERER_CONTRACT_VERSION,
  WB_TEMPLATE_RENDERER_MIN_PACKAGE_SPEC_VERSION,
  WB_TEMPLATE_RUNTIME_MODEL_REQUIRED_KEYS,
} from "@/lib/website/template-renderer-contract/constants";
import {
  issue,
  WbTemplateRendererError,
} from "@/lib/website/template-renderer-contract/errors";
import type {
  WbTemplateRendererInput,
  WbTemplateRendererPackageInput,
  WbTemplateRuntimeModel,
  WbTemplateRuntimePageDefinition,
} from "@/lib/website/template-renderer-contract/types";
import type { WbTemplateRendererValidationResult } from "@/lib/website/template-renderer-contract/errors";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function compareSpecVersion(left: string, right: string): number {
  const parse = (value: string) =>
    value.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const [lMajor, lMinor = 0, lPatch = 0] = parse(left);
  const [rMajor, rMinor = 0, rPatch = 0] = parse(right);
  if (lMajor !== rMajor) return lMajor - rMajor;
  if (lMinor !== rMinor) return lMinor - rMinor;
  return lPatch - rPatch;
}

export function assertRendererContractVersion(
  contractVersion: string = WB_TEMPLATE_RENDERER_CONTRACT_VERSION,
): void {
  if (contractVersion !== WB_TEMPLATE_RENDERER_CONTRACT_VERSION) {
    throw new WbTemplateRendererError(
      "contract.unsupported_version",
      `unsupported renderer contract version "${contractVersion}" (expected ${WB_TEMPLATE_RENDERER_CONTRACT_VERSION})`,
      { path: "contractVersion" },
    );
  }
}

export function validateRendererInput(
  input: unknown,
): WbTemplateRendererValidationResult {
  const issues = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      issues: [issue("input.invalid_package", "renderer input must be an object")],
    };
  }

  if (!isRecord(input.package)) {
    issues.push(
      issue("input.missing_package", "renderer input.package is required", "package"),
    );
    return { valid: false, issues };
  }

  const pkg = input.package as WbTemplateRendererPackageInput;

  if (!isRecord(pkg.manifest)) {
    issues.push(
      issue("input.invalid_package", "package.manifest is required", "package.manifest"),
    );
  } else {
    if (!hasString(pkg.manifest.id)) {
      issues.push(
        issue("input.invalid_package", "package.manifest.id is required", "package.manifest.id"),
      );
    }
    if (!hasString(pkg.manifest.specVersion)) {
      issues.push(
        issue(
          "input.invalid_package",
          "package.manifest.specVersion is required",
          "package.manifest.specVersion",
        ),
      );
    } else if (
      compareSpecVersion(
        pkg.manifest.specVersion,
        WB_TEMPLATE_RENDERER_MIN_PACKAGE_SPEC_VERSION,
      ) < 0
    ) {
      issues.push(
        issue(
          "input.unsupported_spec_version",
          `package specVersion ${pkg.manifest.specVersion} is below minimum ${WB_TEMPLATE_RENDERER_MIN_PACKAGE_SPEC_VERSION}`,
          "package.manifest.specVersion",
        ),
      );
    }
  }

  if (!isRecord(pkg.entry)) {
    issues.push(
      issue("input.invalid_package", "package.entry is required", "package.entry"),
    );
  }

  if (!isRecord(pkg.layouts) || Object.keys(pkg.layouts).length === 0) {
    issues.push(
      issue("input.invalid_package", "package.layouts must contain at least one layout", "package.layouts"),
    );
  }

  if (!isRecord(pkg.regions) || Object.keys(pkg.regions).length === 0) {
    issues.push(
      issue("input.invalid_package", "package.regions must contain at least one region", "package.regions"),
    );
  }

  if (!isRecord(pkg.pages) || Object.keys(pkg.pages).length === 0) {
    issues.push(
      issue("input.invalid_package", "package.pages must contain at least one page", "package.pages"),
    );
  }

  if (!isRecord(pkg.canvas)) {
    issues.push(
      issue("input.invalid_package", "package.canvas is required", "package.canvas"),
    );
  }

  if (!isRecord(pkg.placementRules)) {
    issues.push(
      issue(
        "input.invalid_package",
        "package.placementRules is required",
        "package.placementRules",
      ),
    );
  }

  if (isRecord(input.scope)) {
    const scope = input.scope as { pageId?: string; layoutId?: string };
    if (scope.pageId && pkg.pages && !pkg.pages[scope.pageId]) {
      issues.push(
        issue(
          "input.missing_page",
          `scope.pageId "${scope.pageId}" does not exist in package.pages`,
          "scope.pageId",
        ),
      );
    }
    if (scope.layoutId && pkg.layouts && !pkg.layouts[scope.layoutId]) {
      issues.push(
        issue(
          "input.missing_layout",
          `scope.layoutId "${scope.layoutId}" does not exist in package.layouts`,
          "scope.layoutId",
        ),
      );
    }
  }

  return { valid: issues.length === 0, issues };
}

export function assertRendererInput(input: WbTemplateRendererInput): void {
  const result = validateRendererInput(input);
  if (!result.valid) {
    throw new WbTemplateRendererError(
      "input.invalid_package",
      "renderer input failed contract validation",
      { issues: result.issues },
    );
  }
}

export function validateRuntimeModel(
  model: unknown,
): WbTemplateRendererValidationResult {
  const issues = [];

  if (!isRecord(model)) {
    return {
      valid: false,
      issues: [issue("output.invalid_model", "runtime model must be an object")],
    };
  }

  for (const key of WB_TEMPLATE_RUNTIME_MODEL_REQUIRED_KEYS) {
    if (!(key in model)) {
      issues.push(
        issue("output.missing_field", `runtime model.${key} is required`, `model.${key}`),
      );
    }
  }

  if (!hasString(model.contractVersion)) {
    issues.push(
      issue(
        "output.missing_field",
        "runtime model.contractVersion is required",
        "model.contractVersion",
      ),
    );
  } else if (model.contractVersion !== WB_TEMPLATE_RENDERER_CONTRACT_VERSION) {
    issues.push(
      issue(
        "contract.unsupported_version",
        `runtime model.contractVersion must be ${WB_TEMPLATE_RENDERER_CONTRACT_VERSION}`,
        "model.contractVersion",
      ),
    );
  }

  if (!isRecord(model.template) || !hasString(model.template.id)) {
    issues.push(
      issue("output.invalid_model", "runtime model.template.id is required", "model.template.id"),
    );
  }

  if (!isRecord(model.layouts) || Object.keys(model.layouts).length === 0) {
    issues.push(
      issue("output.invalid_model", "runtime model.layouts must not be empty", "model.layouts"),
    );
  }

  if (!isRecord(model.regions) || Object.keys(model.regions).length === 0) {
    issues.push(
      issue("output.invalid_model", "runtime model.regions must not be empty", "model.regions"),
    );
  }

  if (!isRecord(model.pages) || Object.keys(model.pages).length === 0) {
    issues.push(
      issue("output.invalid_model", "runtime model.pages must not be empty", "model.pages"),
    );
  }

  const layouts = (model.layouts ?? {}) as Record<string, { regionOrder?: string[] }>;
  const regions = (model.regions ?? {}) as Record<string, { id?: string }>;
  const pages = (model.pages ?? {}) as Record<string, WbTemplateRuntimePageDefinition>;

  const layoutIds = new Set(Object.keys(layouts));
  const regionIds = new Set(Object.keys(regions));
  const pageIds = new Set(Object.keys(pages));

  if (layoutIds.size !== Object.keys(layouts).length) {
    issues.push(issue("output.duplicate_id", "duplicate layout ids detected", "model.layouts"));
  }
  if (regionIds.size !== Object.keys(regions).length) {
    issues.push(issue("output.duplicate_id", "duplicate region ids detected", "model.regions"));
  }
  if (pageIds.size !== Object.keys(pages).length) {
    issues.push(issue("output.duplicate_id", "duplicate page ids detected", "model.pages"));
  }

  for (const [layoutId, layout] of Object.entries(layouts)) {
    if (!hasStringArray(layout.regionOrder)) {
      issues.push(
        issue(
          "output.invalid_model",
          `layout "${layoutId}" requires regionOrder: string[]`,
          `model.layouts.${layoutId}.regionOrder`,
        ),
      );
      continue;
    }
    for (const regionId of layout.regionOrder) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "output.invalid_reference",
            `layout "${layoutId}" references unknown region "${regionId}"`,
            `model.layouts.${layoutId}.regionOrder`,
          ),
        );
      }
    }
  }

  for (const [pageId, page] of Object.entries(pages)) {
    if (!hasString(page.layoutId) || !layoutIds.has(page.layoutId)) {
      issues.push(
        issue(
          "validation.page_layout_mismatch",
          `page "${pageId}" references unknown layout "${page.layoutId ?? ""}"`,
          `model.pages.${pageId}.layoutId`,
        ),
      );
    }
    if (!hasStringArray(page.regionIds)) {
      issues.push(
        issue(
          "output.invalid_model",
          `page "${pageId}" requires regionIds: string[]`,
          `model.pages.${pageId}.regionIds`,
        ),
      );
      continue;
    }
    const layout = layouts[page.layoutId];
    const layoutRegionOrder = layout?.regionOrder ?? [];
    for (const regionId of page.regionIds) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "validation.page_region_mismatch",
            `page "${pageId}" references unknown region "${regionId}"`,
            `model.pages.${pageId}.regionIds`,
          ),
        );
      }
      if (layout && !layoutRegionOrder.includes(regionId)) {
        issues.push(
          issue(
            "validation.page_region_mismatch",
            `page "${pageId}" region "${regionId}" is not declared in layout "${page.layoutId}"`,
            `model.pages.${pageId}.regionIds`,
          ),
        );
      }
    }
  }

  const placementRules = isRecord(model.placementRules)
    ? (model.placementRules as {
        regionOverrides?: Record<string, unknown>;
        constraints?: Array<{ id?: string; when?: { region?: string; page?: string } }>;
      })
    : undefined;

  if (placementRules?.regionOverrides) {
    for (const regionId of Object.keys(placementRules.regionOverrides)) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "validation.placement_override_unknown_region",
            `placementRules.regionOverrides references unknown region "${regionId}"`,
            `model.placementRules.regionOverrides.${regionId}`,
          ),
        );
      }
    }
  }

  for (const constraint of placementRules?.constraints ?? []) {
    if (constraint.when?.region && !regionIds.has(constraint.when.region)) {
      issues.push(
        issue(
          "validation.constraint_unknown_region",
          `placement constraint "${constraint.id ?? "unknown"}" references unknown region "${constraint.when.region}"`,
          `model.placementRules.constraints`,
        ),
      );
    }
    if (constraint.when?.page && !pageIds.has(constraint.when.page)) {
      issues.push(
        issue(
          "validation.constraint_unknown_page",
          `placement constraint "${constraint.id ?? "unknown"}" references unknown page "${constraint.when.page}"`,
          `model.placementRules.constraints`,
        ),
      );
    }
  }

  return { valid: issues.length === 0, issues };
}

export function assertRuntimeModel(model: WbTemplateRuntimeModel): void {
  const result = validateRuntimeModel(model);
  if (!result.valid) {
    throw new WbTemplateRendererError(
      "output.invalid_model",
      "runtime model failed contract validation",
      { issues: result.issues },
    );
  }
}

export function isWbTemplateRuntimeModel(
  value: unknown,
): value is WbTemplateRuntimeModel {
  return validateRuntimeModel(value).valid;
}
