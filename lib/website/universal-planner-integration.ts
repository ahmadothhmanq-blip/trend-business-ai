import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { createHash } from "node:crypto";
import {
  isUniversalPlannerWebsiteEnabled,
  runUniversalPlanner,
  validateServiceBlueprintEntry,
} from "@/lib/ai-core/universal-planner";
import type { UniversalBlueprint, UniversalServiceBlueprint } from "@/lib/ai-core/universal-planner";
import type { WebsiteGenerationInput } from "@/lib/website/types";

const WEBSITE_SERVICE_ID = "website-builder" as const;

export type WebsitePlannerIntegrationResult = {
  enabled: boolean;
  blueprint?: UniversalBlueprint;
  websiteServicePlan?: UniversalServiceBlueprint;
  inputPatch?: Partial<WebsiteGenerationInput>;
};

export function buildPlannerLockedWebsitePlan(prompt: string) {
  const promptHash = createHash("sha256").update(prompt.trim()).digest("hex").slice(0, 16);
  return {
    id: `planner-${promptHash}`,
    version: "1",
    createdAt: new Date().toISOString(),
    promptHash,
    industry: "business",
    industryLabel: "Business",
    businessType: "General",
    style: "professional",
    audience: "customers",
    language: "English",
    tone: "Professional",
    template: "corporate-business",
    theme: "corporate-business",
    layout: "business",
    hero: "Professional services",
    navigation: "standard",
    colorPalette: {
      primary: "#1f2937",
      secondary: "#111827",
      accent: "#2563eb",
      background: "#ffffff",
      foreground: "#111827",
      surface: "#f8fafc",
    },
    typography: {
      display: "Geist",
      heading: "Geist",
      body: "Geist",
    },
    imageStyle: "professional",
    imageKeywords: ["business", "professional"],
    sections: [],
    ctaStyle: "consultation",
    features: [],
    components: [],
    locked: {
      industry: true,
      template: true,
      theme: true,
      layout: true,
      sections: true,
      images: true,
      hero: true,
      navigation: true,
    },
    sources: {
      industry: "universal-planner",
      template: "universal-planner",
      theme: "universal-planner",
      design: "universal-planner",
      route: "universal-planner",
      reasoningChain: ["universal-planner"],
      validation: "universal-planner",
    },
  };
}

function toPlannerBrief(input: WebsiteGenerationInput): CoreBrief {
  return {
    prompt: input.continueInstruction?.trim() || input.prompt,
    productId: "website",
    language: input.language,
    theme: input.theme,
    features: input.features,
    metadata: {
      industryId: input.industryId,
      websiteGenerationInput: input,
      masterWebsitePlan: buildPlannerLockedWebsitePlan(input.prompt),
    },
  };
}

export async function resolveWebsitePlannerIntegration(params: {
  input: WebsiteGenerationInput;
  onProgress?: (message: string) => void;
}): Promise<WebsitePlannerIntegrationResult> {
  if (!isUniversalPlannerWebsiteEnabled()) {
    return { enabled: false };
  }

  params.onProgress?.("[planner] Universal AI Planner enabled for Website Builder");

  const planner = await runUniversalPlanner({
    brief: toPlannerBrief(params.input),
    onProgress: params.onProgress
      ? (message) => params.onProgress?.(`[planner] ${message}`)
      : undefined,
    reuseExisting: true,
  });

  const websiteServicePlan = planner.blueprint.servicePlans.find(
    (entry) => entry.serviceId === WEBSITE_SERVICE_ID,
  );
  if (!websiteServicePlan) {
    throw new Error("Universal Planner did not return website-builder adapter plan.");
  }

  const validation = validateServiceBlueprintEntry(
    websiteServicePlan,
    planner.blueprint.briefId,
  );
  if (!validation.ok) {
    throw new Error(
      `Universal Planner website adapter plan invalid: ${validation.errors.join("; ")}`,
    );
  }

  params.onProgress?.("[planner] Website Builder adapter blueprint validated");

  return {
    enabled: true,
    blueprint: planner.blueprint,
    websiteServicePlan,
    inputPatch: {
      universalPlannerEnabled: true,
      universalPlannerBlueprint: planner.blueprint,
      universalPlannerWebsitePlan: websiteServicePlan,
      universalPlannerTraceRef: planner.blueprint.trace.planningTraceRef,
    },
  };
}
