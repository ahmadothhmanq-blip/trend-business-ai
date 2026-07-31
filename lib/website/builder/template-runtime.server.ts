import { getWbTemplateRegistry, initializeWbTemplateEngine } from "@/lib/website/template-engine/index.server";
import { renderWbTemplateFromResolvedPackage } from "@/lib/website/template-renderer";
import type {
  BuilderTemplateRuntimeFailure,
  BuilderTemplateRuntimeResult,
  BuilderTemplateRuntimeScope,
} from "@/lib/website/builder/template-runtime.types";

export type {
  BuilderTemplateRuntimeFailure,
  BuilderTemplateRuntimeResult,
  BuilderTemplateRuntimeScope,
  BuilderTemplateRuntimeSuccess,
} from "@/lib/website/builder/template-runtime.types";

function failure(
  templateId: string,
  code: string,
  message: string,
  issues: BuilderTemplateRuntimeFailure["issues"] = [],
): BuilderTemplateRuntimeFailure {
  return {
    ok: false,
    templateId,
    code,
    message,
    issues: issues.length ? issues : [{ code, message }],
  };
}

/**
 * Loads a validated Template Package via the Template Engine and normalizes it
 * through the Template Renderer for Website Builder consumption.
 */
export async function resolveBuilderTemplateRuntimeModel(
  templateId: string,
  scope?: BuilderTemplateRuntimeScope,
): Promise<BuilderTemplateRuntimeResult> {
  const normalizedId = templateId.trim();
  if (!normalizedId) {
    return failure(
      "",
      "input.invalid_package",
      "template package id is required",
      [
        {
          code: "input.invalid_package",
          message: "template package id is required",
          path: "templateId",
        },
      ],
    );
  }

  const engine = await initializeWbTemplateEngine();
  await engine.ensureLoaded();

  const pkg = getWbTemplateRegistry().getPackage(normalizedId);
  if (!pkg) {
    const loadReport = engine.getLastLoadReport();
    const loadIssue =
      loadReport?.errors.find((item) => item.directory.includes(normalizedId))
        ?.message ?? null;

    return failure(
      normalizedId,
      "input.missing_package",
      loadIssue
        ? `template package "${normalizedId}" failed to load: ${loadIssue}`
        : `template package "${normalizedId}" is not installed`,
      [
        {
          code: "input.missing_package",
          message: `template package "${normalizedId}" is not installed`,
          path: "templateId",
        },
      ],
    );
  }

  const renderResult = renderWbTemplateFromResolvedPackage(pkg, {
    scope,
  });

  if (!renderResult.ok) {
    return failure(
      normalizedId,
      renderResult.error.code,
      renderResult.error.message,
      renderResult.error.issues,
    );
  }

  return {
    ok: true,
    templateId: normalizedId,
    model: renderResult.value.model,
    meta: renderResult.value.meta,
  };
}

export async function listInstalledBuilderTemplatePackageIds(): Promise<string[]> {
  const engine = await initializeWbTemplateEngine();
  const templates = await engine.listTemplates();
  return templates.map((item) => item.id).sort((a, b) => a.localeCompare(b));
}
