import type { WbTemplateResolvedPackage } from "@/lib/website/template-engine/spec/types";
import { WB_TEMPLATE_RENDERER_CONTRACT_VERSION } from "@/lib/website/template-renderer-contract/constants";
import { issue } from "@/lib/website/template-renderer-contract/errors";
import {
  validateRendererInput,
  validateRuntimeModel,
} from "@/lib/website/template-renderer-contract/validation";
import type {
  WbTemplateRenderer,
  WbTemplateRendererInput,
  WbTemplateRendererResult,
} from "@/lib/website/template-renderer-contract/types";
import { adaptResolvedTemplatePackage } from "@/lib/website/template-renderer/adapt";
import { buildRuntimeTemplateModel } from "@/lib/website/template-renderer/normalize";
import { validatePackageReferences } from "@/lib/website/template-renderer/references";

function failure(
  code: string,
  message: string,
  issues: ReturnType<typeof issue>[],
): Extract<WbTemplateRendererResult, { ok: false }> {
  return {
    ok: false,
    error: {
      code,
      message,
      issues,
    },
  };
}

/**
 * Normalizes a validated Template Package into a canonical runtime Template Model.
 * Produces no HTML, CSS, React output, or component instances.
 */
function renderWbTemplateRuntimeModelSync(
  input: WbTemplateRendererInput,
): WbTemplateRendererResult {
  const contractVersion =
    input.contractVersion ?? WB_TEMPLATE_RENDERER_CONTRACT_VERSION;

  if (contractVersion !== WB_TEMPLATE_RENDERER_CONTRACT_VERSION) {
    return failure(
      "contract.unsupported_version",
      `unsupported renderer contract version "${contractVersion}"`,
      [
        issue(
          "contract.unsupported_version",
          `expected contract version ${WB_TEMPLATE_RENDERER_CONTRACT_VERSION}`,
          "contractVersion",
        ),
      ],
    );
  }

  const inputValidation = validateRendererInput(input);
  if (!inputValidation.valid) {
    return failure(
      inputValidation.issues[0]?.code ?? "input.invalid_package",
      "renderer input failed contract validation",
      inputValidation.issues,
    );
  }

  const referenceIssues = validatePackageReferences(input.package);
  if (referenceIssues.length > 0) {
    return failure(
      referenceIssues[0]?.code ?? "output.invalid_reference",
      "template package contains invalid internal references",
      referenceIssues,
    );
  }

  const model = buildRuntimeTemplateModel(input.package, {
    contractVersion,
    scope: input.scope,
  });

  const outputValidation = validateRuntimeModel(model);
  if (!outputValidation.valid) {
    return failure(
      "output.invalid_model",
      "normalized runtime model failed contract validation",
      outputValidation.issues,
    );
  }

  return {
    ok: true,
    value: {
      model,
      meta: {
        contractVersion,
        templateId: input.package.manifest.id,
        templateVersion: input.package.manifest.version,
        packageSpecVersion: input.package.manifest.specVersion,
        normalizedAt: input.package.loadedAt,
        ...(input.scope ? { scope: input.scope } : {}),
      },
    },
  };
}

export const renderWbTemplateRuntimeModel: WbTemplateRenderer =
  renderWbTemplateRuntimeModelSync;

/**
 * Convenience entry point for Template Engine resolved packages.
 */
export function renderWbTemplateFromResolvedPackage(
  pkg: WbTemplateResolvedPackage,
  options?: Omit<WbTemplateRendererInput, "package">,
): WbTemplateRendererResult {
  return renderWbTemplateRuntimeModelSync({
    package: adaptResolvedTemplatePackage(pkg),
    ...options,
  });
}
