import type {
  AccessibilityLevel,
  BrandPersonality,
  BusinessModel,
  BusinessSize,
  ContentDensity,
  DevicePriority,
  ImageAvailability,
  LanguageDirection,
  PremiumLevel,
  TargetAudience,
  VisualStyle,
  WebsiteGoal,
} from "@/lib/website/template-v2/variants/decision/types";
import { normalizeIndustry } from "@/lib/website/template-v2/variants/decision/weights";
import type { BlueprintInput } from "@/lib/website/template-v2/blueprint/types";

export type ResolvedBlueprintContext = Required<
  Pick<
    BlueprintInput,
    | "industry"
    | "businessSubtype"
    | "brandPersonality"
    | "businessSize"
    | "targetAudience"
    | "websiteGoal"
    | "languageDirection"
    | "contentDensity"
    | "imageAvailability"
    | "businessModel"
    | "premiumLevel"
    | "visualStyle"
    | "devicePriority"
    | "accessibilityLevel"
  >
> & {
  seed?: string;
  sectionOrder?: BlueprintInput["sectionOrder"];
  blueprintId?: string;
};

const GOAL_INFERENCE: Partial<
  Record<string, { goal: WebsiteGoal; audience: TargetAudience; model: BusinessModel }>
> = {
  saas: { goal: "saas", audience: "b2b", model: "product" },
  gaming: { goal: "saas", audience: "b2c", model: "product" },
  technology: { goal: "saas", audience: "b2b", model: "product" },
  tech: { goal: "saas", audience: "b2b", model: "product" },
  esports: { goal: "saas", audience: "b2c", model: "product" },
  corporate: { goal: "trust", audience: "b2b", model: "service" },
  "creative-agency": { goal: "portfolio", audience: "b2c", model: "service" },
  "real-estate": { goal: "lead-generation", audience: "luxury", model: "service" },
  "hotel-resort": { goal: "booking", audience: "luxury", model: "service" },
  restaurant: { goal: "booking", audience: "consumer", model: "service" },
  medical: { goal: "trust", audience: "b2c", model: "service" },
  finance: { goal: "trust", audience: "enterprise", model: "service" },
  ecommerce: { goal: "ecommerce", audience: "b2c", model: "product" },
  education: { goal: "brand-awareness", audience: "b2c", model: "service" },
};

const PERSONALITY_BY_INDUSTRY: Partial<Record<string, BrandPersonality>> = {
  finance: "professional",
  medical: "warm",
  "hotel-resort": "luxury",
  "real-estate": "luxury",
  "creative-agency": "bold",
  saas: "technical",
  gaming: "technical",
  technology: "technical",
  tech: "technical",
  esports: "bold",
  restaurant: "warm",
};

const STYLE_BY_PREMIUM: Record<PremiumLevel, VisualStyle> = {
  standard: "modern",
  premium: "corporate",
  luxury: "luxury",
};

export function resolveBlueprintContext(
  input: BlueprintInput,
): ResolvedBlueprintContext {
  const industry = normalizeIndustry(input.industry);
  const inferred = GOAL_INFERENCE[industry];

  const websiteGoal = input.websiteGoal ?? inferred?.goal ?? "lead-generation";
  const targetAudience =
    input.targetAudience ?? inferred?.audience ?? "b2c";
  const businessModel =
    input.businessModel ?? inferred?.model ?? "service";

  const premiumLevel = input.premiumLevel ?? "premium";
  const brandPersonality =
    input.brandPersonality ??
    PERSONALITY_BY_INDUSTRY[industry] ??
    (premiumLevel === "luxury" ? "luxury" : "professional");

  return {
    industry,
    businessSubtype: input.businessSubtype?.trim() || industry,
    brandPersonality,
    businessSize: input.businessSize ?? "small",
    targetAudience,
    websiteGoal,
    languageDirection: input.languageDirection ?? "ltr",
    contentDensity: input.contentDensity ?? "medium",
    imageAvailability: input.imageAvailability ?? "moderate",
    businessModel,
    premiumLevel,
    visualStyle: input.visualStyle ?? STYLE_BY_PREMIUM[premiumLevel],
    devicePriority: input.devicePriority ?? "balanced",
    accessibilityLevel: input.accessibilityLevel ?? "standard",
    seed: input.seed,
    sectionOrder: input.sectionOrder,
    blueprintId: input.blueprintId,
  };
}

export function inferBusinessSubtype(
  industry: string,
  goal: WebsiteGoal,
): string {
  if (goal === "saas") return "saas-platform";
  if (goal === "portfolio") return "creative-studio";
  if (goal === "booking") return "hospitality";
  if (goal === "ecommerce") return "retail";
  return industry;
}
