import type {
  RequirementAnalysisResult,
  UniversalBlueprintCore,
  UniversalServiceBlueprint,
  UniversalServiceId,
} from "@/lib/ai-core/universal-planner/types";

export const UNIVERSAL_ADAPTER_VERSION = "1" as const;

/** Input every service adapter receives — shared Universal Blueprint + requirements. */
export type UniversalPlannerAdapterInput = {
  blueprint: UniversalBlueprintCore;
  requirements: RequirementAnalysisResult;
};

/** Contract every Trend Business AI service adapter must satisfy. */
export type UniversalPlannerAdapter = {
  serviceId: UniversalServiceId;
  adapterVersion: typeof UNIVERSAL_ADAPTER_VERSION;
  build: (input: UniversalPlannerAdapterInput) => UniversalServiceBlueprint;
};

/** Minimum fields every supported service blueprint must expose for downstream wiring. */
export type UniversalServiceBlueprintContract = {
  productId: string;
  route: string;
  universalBlueprintRef: string;
  industryId: string;
  intentSummary: string;
  requiresAuth: boolean;
};

export const REQUIRED_SERVICE_BLUEPRINT_KEYS: Array<
  keyof UniversalServiceBlueprintContract
> = [
  "productId",
  "route",
  "universalBlueprintRef",
  "industryId",
  "intentSummary",
  "requiresAuth",
];
