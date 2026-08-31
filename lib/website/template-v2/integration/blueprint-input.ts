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
import { isTechRoutingIndustry } from "@/lib/website/template-v2/composer/package-sector";
import { isStructureFirstEnabled } from "@/lib/website/generation-flags";
import { resolveSectionOrderFromProject } from "@/lib/website/template-v2/integration/strategy-section-order";

/** Package-specific defaults for blueprint generation. */
export const PACKAGE_BLUEPRINT_DEFAULTS: Record<
  string,
  Partial<BlueprintInput>
> = {
  "saas-enterprise": {
    industry: "saas",
    websiteGoal: "saas",
    brandPersonality: "technical",
    premiumLevel: "premium",
    visualStyle: "modern",
    targetAudience: "enterprise",
  },
  "corporate-business": {
    industry: "corporate",
    websiteGoal: "trust",
    brandPersonality: "professional",
    premiumLevel: "luxury",
    visualStyle: "luxury",
    targetAudience: "enterprise",
  },
};

const GOAL_KEYWORDS: Array<{ pattern: RegExp; goal: WebsiteGoal }> = [
  {
    pattern:
      /\b(gaming|esports|e-sports|game studio|video game|saas|software|platform|tech|technology|ai startup|fintech|developer tools)\b/i,
    goal: "saas",
  },
  { pattern: /saas|software|platform/i, goal: "saas" },
  { pattern: /book|reserv|hotel|restaurant|dining|menu/i, goal: "booking" },
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
  const imageCount = manifest.items?.length ?? 0;
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

  let industry =
    normalizeIndustry(profile?.industry) ||
    pkgDefaults.industry ||
    templatePackageId.replace(/-premium$/, "");

  if (
    templatePackageId === "_generation-default" &&
    (isTechRoutingIndustry(industry) ||
      isTechRoutingIndustry(profile?.industry))
  ) {
    industry = "ai-startup";
  }

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

  const sectionOrder = isStructureFirstEnabled()
    ? resolveSectionOrderFromProject(project)
    : undefined;

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
      project.title?.toLowerCase().replace(/\s+/g, "-") ??
      `${templatePackageId}-${industry}`,
    blueprintId: `bp-${templatePackageId}-${industry}`,
    ...(sectionOrder?.length ? { sectionOrder } : {}),
  };
}
