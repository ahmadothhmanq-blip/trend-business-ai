import {
  getUniversalPlannerAdapter,
  IMPLEMENTED_SERVICE_IDS,
  UNIVERSAL_PLANNER_ADAPTERS,
} from "@/lib/ai-core/universal-planner/adapters/registry";
import {
  isValidServiceBlueprintContract,
  SERVICE_ROUTE_DEFINITIONS,
} from "@/lib/ai-core/universal-planner/adapters/shared";
import {
  REQUIRED_SERVICE_BLUEPRINT_KEYS,
  type UniversalPlannerAdapterInput,
} from "@/lib/ai-core/universal-planner/adapters/types";
import type {
  RequirementAnalysisResult,
  UniversalBlueprintCore,
  UniversalServiceBlueprint,
  UniversalServiceId,
} from "@/lib/ai-core/universal-planner/types";

export const KNOWN_UNIVERSAL_SERVICE_IDS: UniversalServiceId[] = [
  ...IMPLEMENTED_SERVICE_IDS,
  "future-service",
];

function unsupportedBlueprint(serviceId: UniversalServiceId): UniversalServiceBlueprint {
  return {
    serviceId,
    adapterVersion: "1",
    supported: false,
    note: "No dedicated adapter registered for this service id.",
    serviceBlueprint: {},
  };
}

function runAdapter(
  serviceId: UniversalServiceId,
  input: UniversalPlannerAdapterInput,
): UniversalServiceBlueprint {
  const adapter = getUniversalPlannerAdapter(serviceId);
  if (!adapter) {
    return unsupportedBlueprint(serviceId);
  }
  return adapter.build(input);
}

export function buildUniversalServicePlans(
  blueprint: UniversalBlueprintCore,
  requirements: RequirementAnalysisResult,
): UniversalServiceBlueprint[] {
  const input: UniversalPlannerAdapterInput = { blueprint, requirements };
  const orderedTargets: UniversalServiceId[] = requirements.targetServices.length
    ? requirements.targetServices
    : ["future-service"];

  const plans: UniversalServiceBlueprint[] = orderedTargets.map((serviceId) =>
    runAdapter(serviceId, input),
  );

  const existing = new Set(plans.map((plan) => plan.serviceId));
  for (const serviceId of KNOWN_UNIVERSAL_SERVICE_IDS) {
    if (!existing.has(serviceId)) {
      plans.push(runAdapter(serviceId, input));
    }
  }

  return plans;
}

export function validateUniversalAdapterRegistry(): {
  ok: boolean;
  missingRoutes: UniversalServiceId[];
  duplicateIds: UniversalServiceId[];
} {
  const seen = new Set<UniversalServiceId>();
  const duplicateIds: UniversalServiceId[] = [];

  for (const adapter of UNIVERSAL_PLANNER_ADAPTERS) {
    if (seen.has(adapter.serviceId)) {
      duplicateIds.push(adapter.serviceId);
    }
    seen.add(adapter.serviceId);
  }

  const missingRoutes = IMPLEMENTED_SERVICE_IDS.filter(
    (serviceId) => !(serviceId in SERVICE_ROUTE_DEFINITIONS),
  );

  return {
    ok: duplicateIds.length === 0 && missingRoutes.length === 0,
    missingRoutes,
    duplicateIds,
  };
}

export function validateServiceBlueprintEntry(
  entry: UniversalServiceBlueprint,
  blueprintBriefId: string,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!entry.supported) {
    errors.push(`service ${entry.serviceId} is not supported`);
    return { ok: false, errors };
  }

  if (entry.adapterVersion !== "1") {
    errors.push(`service ${entry.serviceId} has invalid adapterVersion`);
  }

  if (!isValidServiceBlueprintContract(entry.serviceBlueprint)) {
    errors.push(
      `service ${entry.serviceId} missing contract keys: ${REQUIRED_SERVICE_BLUEPRINT_KEYS.filter(
        (key) =>
          typeof entry.serviceBlueprint[key] !== "string" &&
          typeof entry.serviceBlueprint[key] !== "boolean",
      ).join(", ")}`,
    );
  } else if (entry.serviceBlueprint.universalBlueprintRef !== blueprintBriefId) {
    errors.push(
      `service ${entry.serviceId} blueprint ref mismatch (${entry.serviceBlueprint.universalBlueprintRef} != ${blueprintBriefId})`,
    );
  }

  return { ok: errors.length === 0, errors };
}

export {
  getUniversalPlannerAdapter,
  IMPLEMENTED_SERVICE_IDS,
  UNIVERSAL_PLANNER_ADAPTERS,
} from "@/lib/ai-core/universal-planner/adapters/registry";
