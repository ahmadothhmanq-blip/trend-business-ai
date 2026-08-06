import { buildWebsiteBlueprint } from "@/lib/website/template-v2/blueprint/engine";
import type { BlueprintInput } from "@/lib/website/template-v2/blueprint/types";
import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import { runDesignDirector } from "@/lib/website/template-v2/design-director/engine";
import type { DesignDirectorResult } from "@/lib/website/template-v2/design-director/types";
import {
  isProductionBlueprintEnabled,
  PRODUCTION_INTEGRATION_VERSION,
} from "@/lib/website/template-v2/integration/constants";
import { WB_WEBSITE_BLUEPRINT_SETTING } from "@/lib/website/template-v2/constants";
import {
  resolveBlueprintInputFromGeneration,
  type ResolveBlueprintInputParams,
} from "@/lib/website/template-v2/integration/blueprint-input";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

export type ProductionPipelineResult = {
  optimizedBlueprint: WebsiteBlueprint;
  directorResult: DesignDirectorResult;
  integrationVersion: string;
};

export type ProductionPipelineParams = ResolveBlueprintInputParams & {
  /** Use a pre-built blueprint instead of generating one. */
  blueprint?: WebsiteBlueprint;
  blueprintInput?: BlueprintInput;
  auditOnly?: boolean;
};

/**
 * Production design pipeline:
 * Input → Blueprint Engine → Design Director → optimized blueprint (SSOT)
 *
 * The Decision Engine runs inside the Blueprint Engine.
 */
export function runProductionDesignPipeline(
  params: ProductionPipelineParams,
): ProductionPipelineResult {
  const blueprintInput =
    params.blueprintInput ??
    resolveBlueprintInputFromGeneration(params);

  const directorResult = runDesignDirector({
    blueprint: params.blueprint,
    blueprintInput: params.blueprint ? undefined : blueprintInput,
    auditOnly: params.auditOnly,
  });

  return {
    optimizedBlueprint: directorResult.optimizedBlueprint,
    directorResult,
    integrationVersion: PRODUCTION_INTEGRATION_VERSION,
  };
}

export type ResolveProductionBlueprintParams = {
  project: GeneratedWebsiteProject;
  templatePackageId: string;
  language?: string | null;
  seed?: string;
  /** Explicit opt-out for fallback behavior. */
  forceFallback?: boolean;
};

/**
 * Resolve production blueprint for V2 generation.
 * Returns null when disabled or on failure — caller uses legacy presentation fallback.
 */
export function resolveProductionBlueprint(
  params: ResolveProductionBlueprintParams,
): ProductionPipelineResult | null {
  if (params.forceFallback || !isProductionBlueprintEnabled()) {
    return null;
  }

  try {
    return runProductionDesignPipeline({
      project: params.project,
      templatePackageId: params.templatePackageId,
      language: params.language,
      seed: params.seed,
    });
  } catch {
    return null;
  }
}

/**
 * Read persisted blueprint from project settings (for re-apply / preview).
 */
export function readPersistedBlueprint(
  project: GeneratedWebsiteProject,
): WebsiteBlueprint | null {
  const settings = project.settings as Record<string, unknown> | undefined;
  const raw = settings?.[WB_WEBSITE_BLUEPRINT_SETTING];
  if (!raw || typeof raw !== "object") return null;
  return raw as WebsiteBlueprint;
}
