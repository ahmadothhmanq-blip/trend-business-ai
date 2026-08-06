import type { BlueprintInput } from "@/lib/website/template-v2/blueprint/types";
import type {
  AccessibilityLevel,
  BrandPersonality,
  BusinessModel,
  BusinessSize,
  ContentDensity,
  ImageAvailability,
  PremiumLevel,
  TargetAudience,
  VisualStyle,
  WebsiteGoal,
} from "@/lib/website/template-v2/variants/decision/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

/** Package-specific defaults for blueprint generation. */
export const PACKAGE_BLUEPRINT_DEFAULTS: Record<
  string,
  Partial<BlueprintInput>
> = {
  "corporate-business": {
    industry: "corporate",
    websiteGoal: "trust",
    targetAudience: "b2b",
    brandPersonality: "professional",
    premiumLevel: "premium",
    visualStyle: "corporate",
    businessModel: "service",
  },
  "saas-enterprise": {
    industry: "saas",
    websiteGoal: "saas",
    targetAudience: "b2b",
    brandPersonality: "technical",
    premiumLevel: "premium",
    visualStyle: "modern",
    businessModel: "product",
  },
  "restaurant-premium": {
    industry: "restaurant",
    websiteGoal: "booking",
    targetAudience: "consumer",
    brandPersonality: "warm",
    premiumLevel: "luxury",
    visualStyle: "editorial",
    businessModel: "service",
  },
  "ecommerce-premium": {
    industry: "ecommerce",
    websiteGoal: "ecommerce",
    targetAudience: "b2c",
    brandPersonality: "bold",
    premiumLevel: "premium",
    visualStyle: "modern",
    businessModel: "product",
  },
  "medical-premium": {
    industry: "medical",
    websiteGoal: "trust",
    targetAudience: "b2c",
    brandPersonality: "warm",
    premiumLevel: "premium",
    visualStyle: "corporate",
    businessModel: "service",
  },
  "real-estate-premium": {
    industry: "real-estate",
    websiteGoal: "lead-generation",
    targetAudience: "luxury",
    brandPersonality: "luxury",
    premiumLevel: "luxury",
    visualStyle: "luxury",
    businessModel: "service",
  },
  "creative-agency-premium": {
    industry: "creative-agency",
    websiteGoal: "portfolio",
    targetAudience: "b2c",
    brandPersonality: "bold",
    premiumLevel: "premium",
    visualStyle: "bold",
    businessModel: "service",
  },
  "education-premium": {
    industry: "education",
    websiteGoal: "brand-awareness",
    targetAudience: "b2c",
    brandPersonality: "warm",
    premiumLevel: "premium",
    visualStyle: "editorial",
    businessModel: "service",
  },
  "finance-premium": {
    industry: "finance",
    websiteGoal: "trust",
    targetAudience: "enterprise",
    brandPersonality: "professional",
    premiumLevel: "premium",
    visualStyle: "corporate",
    businessModel: "service",
  },
  "hotel-resort-premium": {
    industry: "hotel-resort",
    websiteGoal: "booking",
    targetAudience: "luxury",
    brandPersonality: "luxury",
    premiumLevel: "luxury",
    visualStyle: "luxury",
    businessModel: "service",
  },
};

const GOAL_KEYWORDS: Array<{ pattern: RegExp; goal: WebsiteGoal }> = [
  { pattern: /saas|software|platform/i, goal: "saas" },
  { pattern: /book|reserv|hotel|restaurant/i, goal: "booking" },
  { pattern: /shop|ecommerce|retail|store/i, goal: "ecommerce" },
  { pattern: /portfolio|creative|agency|studio/i, goal: "portfolio" },
  { pattern: /lead|inquir|contact/i, goal: "lead-generation" },
  { pattern: /sale|pricing/i, goal: "sales" },
  { pattern: /trust|medical|finance|legal/i, goal: "trust" },
];

function inferGoalFromText(...parts: (string | undefined)[]): WebsiteGoal | undefined {
  const text = parts.filter(Boolean).join(" ");
  for (const { pattern, goal } of GOAL_KEYWORDS) {
    if (pattern.test(text)) return goal;
  }
  return undefined;
}

function normalizeIndustry(raw?: string): string {
  return (raw ?? "general")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "general";
}

function inferImageAvailability(
  project: GeneratedWebsiteProject,
): ImageAvailability {
  const manifest = project.assetManifest;
  if (!manifest) return "moderate";
  const imageCount =
    (manifest.images?.length ?? 0) + (manifest.slots?.length ?? 0);
  if (imageCount === 0) return "none";
  if (imageCount <= 2) return "limited";
  if (imageCount <= 6) return "moderate";
  return "rich";
}

function inferAccessibility(language?: string | null): AccessibilityLevel {
  const rtl = language && /arabic|ar\b|hebrew|fa\b|urdu/i.test(language);
  return rtl ? "enhanced" : "standard";
}

function inferDevicePriority(
  targetAudience?: TargetAudience,
): BlueprintInput["devicePriority"] {
  if (targetAudience === "startup" || targetAudience === "consumer") {
    return "mobile-first";
  }
  if (targetAudience === "enterprise") return "desktop-first";
  return "balanced";
}

export type ResolveBlueprintInputParams = {
  project: GeneratedWebsiteProject;
  templatePackageId: string;
  language?: string | null;
  seed?: string;
};

/**
 * Derive BlueprintInput from generation context + package defaults.
 */
export function resolveBlueprintInputFromGeneration(
  params: ResolveBlueprintInputParams,
): BlueprintInput {
  const { project, templatePackageId } = params;
  const pkgDefaults = PACKAGE_BLUEPRINT_DEFAULTS[templatePackageId] ?? {};
  const profile = project.businessProfile;
  const strategy = project.strategy as { goals?: string[] } | undefined;

  const industry =
    normalizeIndustry(profile?.industry) ||
    pkgDefaults.industry ||
    templatePackageId.replace(/-premium$/, "");

  const websiteGoal =
    pkgDefaults.websiteGoal ??
    inferGoalFromText(
      profile?.industry,
      profile?.offer,
      ...(strategy?.goals ?? []),
      ...(profile?.businessGoals ?? []),
    ) ??
    "lead-generation";

  const targetAudience: TargetAudience =
    pkgDefaults.targetAudience ??
    (profile?.targetAudience?.toLowerCase().includes("enterprise")
      ? "enterprise"
      : profile?.targetAudience?.toLowerCase().includes("b2b")
        ? "b2b"
        : "b2c");

  const brandPersonality: BrandPersonality =
    pkgDefaults.brandPersonality ??
    (profile?.tone === "bold"
      ? "bold"
      : profile?.tone === "warm"
        ? "warm"
        : profile?.tone === "luxury"
          ? "luxury"
          : "professional");

  const premiumLevel: PremiumLevel =
    pkgDefaults.premiumLevel ??
    (templatePackageId.includes("premium") ||
    templatePackageId.includes("enterprise")
      ? "premium"
      : "standard");

  const visualStyle: VisualStyle =
    pkgDefaults.visualStyle ?? (premiumLevel === "luxury" ? "luxury" : "modern");

  const businessSize: BusinessSize =
    targetAudience === "enterprise"
      ? "enterprise"
      : targetAudience === "startup"
        ? "small"
        : "medium";

  const contentDensity: ContentDensity =
    websiteGoal === "saas" || websiteGoal === "ecommerce" ? "dense" : "medium";

  return {
    industry,
    businessSubtype: profile?.offer?.slice(0, 48) || industry,
    brandPersonality,
    businessSize,
    targetAudience,
    websiteGoal,
    languageDirection:
      params.language && /arabic|ar\b|hebrew|fa\b|urdu/i.test(params.language)
        ? "rtl"
        : "ltr",
    contentDensity,
    imageAvailability: inferImageAvailability(project),
    businessModel: pkgDefaults.businessModel ?? "service",
    premiumLevel,
    visualStyle,
    devicePriority: inferDevicePriority(targetAudience),
    accessibilityLevel: inferAccessibility(params.language),
    seed:
      params.seed ??
      project.settings?.id?.toString() ??
      `${templatePackageId}-${industry}`,
    blueprintId: `bp-${templatePackageId}-${industry}`,
  };
}
