import type {
  RequirementAnalysisResult,
  UniversalBlueprintCore,
  UniversalServiceBlueprint,
  UniversalServiceId,
} from "@/lib/ai-core/universal-planner/types";
import {
  REQUIRED_SERVICE_BLUEPRINT_KEYS,
  UNIVERSAL_ADAPTER_VERSION,
  type UniversalServiceBlueprintContract,
} from "@/lib/ai-core/universal-planner/adapters/types";

export type ServiceRouteDefinition = {
  productId: string;
  route: string;
  streamRoute?: string;
  actionsRoute?: string;
  dashboardHref: string;
  workspaceType?: string;
  mode: "generation" | "assistant" | "workspace";
};

export const SERVICE_ROUTE_DEFINITIONS: Record<
  Exclude<UniversalServiceId, "future-service">,
  ServiceRouteDefinition
> = {
  "website-builder": {
    productId: "website",
    route: "/api/website-builder",
    streamRoute: "/api/website-builder/stream",
    dashboardHref: "/dashboard/website-builder",
    mode: "generation",
  },
  "app-builder": {
    productId: "webapp",
    route: "/api/webapp-builder",
    dashboardHref: "/dashboard/app-builder",
    mode: "generation",
  },
  "landing-page-builder": {
    productId: "landing-page",
    route: "/api/landing-page-builder",
    dashboardHref: "/dashboard/landing-page-builder",
    mode: "generation",
  },
  "logo-designer": {
    productId: "logo-designer",
    route: "/api/logo-designer",
    dashboardHref: "/dashboard/logo-maker",
    workspaceType: "brand",
    mode: "generation",
  },
  "brand-designer": {
    productId: "brand-designer",
    route: "/api/brand-identity",
    streamRoute: "/api/brand-identity/stream",
    dashboardHref: "/dashboard/brand-studio",
    workspaceType: "brand",
    mode: "generation",
  },
  "image-generator": {
    productId: "image-generator",
    route: "/api/image-generator",
    streamRoute: "/api/image-generator/stream",
    dashboardHref: "/dashboard/image-generator",
    workspaceType: "creative",
    mode: "generation",
  },
  "video-studio": {
    productId: "video-studio",
    route: "/api/video-studio",
    dashboardHref: "/dashboard/video-studio",
    workspaceType: "creative",
    mode: "generation",
  },
  "content-studio": {
    productId: "content-studio",
    route: "/api/content-studio",
    streamRoute: "/api/content-studio/stream",
    actionsRoute: "/api/content-studio/actions",
    dashboardHref: "/dashboard/content-studio",
    workspaceType: "content",
    mode: "generation",
  },
  marketing: {
    productId: "marketing-ai",
    route: "/api/marketing/generate",
    actionsRoute: "/api/marketing/actions",
    dashboardHref: "/dashboard/marketing",
    workspaceType: "marketing",
    mode: "generation",
  },
  "social-media": {
    productId: "social-media-manager",
    route: "/api/social-media/generate",
    actionsRoute: "/api/social-media/actions",
    dashboardHref: "/dashboard/social-media",
    workspaceType: "social",
    mode: "generation",
  },
  crm: {
    productId: "crm",
    route: "/api/crm/actions",
    actionsRoute: "/api/crm/actions",
    dashboardHref: "/dashboard/crm",
    workspaceType: "business",
    mode: "assistant",
  },
  erp: {
    productId: "erp",
    route: "/api/erp/actions",
    actionsRoute: "/api/erp/actions",
    dashboardHref: "/dashboard/erp",
    workspaceType: "business",
    mode: "assistant",
  },
  "business-manager": {
    productId: "business-manager",
    route: "/api/business-manager/actions",
    actionsRoute: "/api/business-manager/actions",
    dashboardHref: "/dashboard/business-manager",
    workspaceType: "business",
    mode: "assistant",
  },
  "business-intelligence": {
    productId: "business-intelligence",
    route: "/api/bi/actions",
    actionsRoute: "/api/bi/actions",
    dashboardHref: "/dashboard/business-intelligence",
    workspaceType: "business",
    mode: "assistant",
  },
};

export function baseServiceBlueprintFields(
  blueprint: UniversalBlueprintCore,
  requirements: RequirementAnalysisResult,
  routeDef: ServiceRouteDefinition,
): UniversalServiceBlueprintContract {
  return {
    productId: routeDef.productId,
    route: routeDef.route,
    universalBlueprintRef: blueprint.briefId,
    industryId: blueprint.industry.industryId,
    intentSummary: blueprint.intent.summary,
    requiresAuth: requirements.capabilities.auth.required || routeDef.mode !== "generation",
  };
}

export function buildSupportedServiceBlueprint(
  serviceId: Exclude<UniversalServiceId, "future-service">,
  blueprint: UniversalBlueprintCore,
  requirements: RequirementAnalysisResult,
  extras: Record<string, unknown> = {},
): UniversalServiceBlueprint {
  const routeDef = SERVICE_ROUTE_DEFINITIONS[serviceId];
  const base = baseServiceBlueprintFields(blueprint, requirements, routeDef);

  return {
    serviceId,
    adapterVersion: UNIVERSAL_ADAPTER_VERSION,
    supported: true,
    serviceBlueprint: {
      ...base,
      dashboardHref: routeDef.dashboardHref,
      mode: routeDef.mode,
      workspaceType: routeDef.workspaceType,
      streamRoute: routeDef.streamRoute,
      actionsRoute: routeDef.actionsRoute,
      goals: blueprint.intent.goals,
      constraints: blueprint.intent.constraints,
      capabilities: blueprint.requirements,
      domainHints: requirements.domainHints,
      routingProfile: blueprint.industry.routingProfile,
      ...extras,
    },
  };
}

export function isValidServiceBlueprintContract(
  serviceBlueprint: Record<string, unknown>,
): serviceBlueprint is UniversalServiceBlueprintContract {
  return REQUIRED_SERVICE_BLUEPRINT_KEYS.every(
    (key) => typeof serviceBlueprint[key] === "string" || typeof serviceBlueprint[key] === "boolean",
  );
}
