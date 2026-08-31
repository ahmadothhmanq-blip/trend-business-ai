import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  isUniversalPlannerAppEnabled,
  runUniversalPlanner,
  validateServiceBlueprintEntry,
} from "@/lib/ai-core/universal-planner";
import type {
  UniversalBlueprint,
  UniversalServiceBlueprint,
} from "@/lib/ai-core/universal-planner";
import { buildPlannerLockedWebsitePlan } from "@/lib/website/universal-planner-integration";
import type { WebAppPluginInput } from "@/plugins/webapp/types";

const APP_SERVICE_ID = "app-builder" as const;

export type AppPlannerIntegrationResult = {
  enabled: boolean;
  blueprint?: UniversalBlueprint;
  appServicePlan?: UniversalServiceBlueprint;
  inputPatch?: Partial<WebAppPluginInput>;
};

function toPlannerBrief(input: WebAppPluginInput): CoreBrief {
  return {
    prompt: input.prompt,
    productId: "webapp",
    language: input.language,
    theme: input.designStyle,
    features: input.features,
    metadata: {
      industryId: "business",
      websiteGenerationInput: {
        projectType: "web-application",
      },
      masterWebsitePlan: buildPlannerLockedWebsitePlan(input.prompt),
      appGenerationInput: input,
    },
  };
}

export async function resolveAppPlannerIntegration(params: {
  input: WebAppPluginInput;
  onProgress?: (message: string) => void;
}): Promise<AppPlannerIntegrationResult> {
  if (!isUniversalPlannerAppEnabled()) {
    return { enabled: false };
  }

  params.onProgress?.("[planner] Universal AI Planner enabled for App Builder");

  const planner = await runUniversalPlanner({
    brief: toPlannerBrief(params.input),
    onProgress: params.onProgress
      ? (message) => params.onProgress?.(`[planner] ${message}`)
      : undefined,
    reuseExisting: true,
  });

  const appServicePlan = planner.blueprint.servicePlans.find(
    (entry) => entry.serviceId === APP_SERVICE_ID,
  );
  if (!appServicePlan) {
    throw new Error(
      "Universal Planner did not return app-builder adapter plan.",
    );
  }

  const validation = validateServiceBlueprintEntry(
    appServicePlan,
    planner.blueprint.briefId,
  );
  if (!validation.ok) {
    throw new Error(
      `Universal Planner app adapter plan invalid: ${validation.errors.join("; ")}`,
    );
  }

  params.onProgress?.("[planner] App Builder adapter blueprint validated");

  return {
    enabled: true,
    blueprint: planner.blueprint,
    appServicePlan,
    inputPatch: {
      universalPlannerEnabled: true,
      universalPlannerBlueprint: planner.blueprint,
      universalPlannerAppPlan: appServicePlan,
      universalPlannerTraceRef: planner.blueprint.trace.planningTraceRef,
    },
  };
}

