import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import type { ImageProfileContext } from "@/lib/ai-core/image-engine/profiles/types";
import { resolveImageProfile } from "@/lib/ai-core/image-engine/profiles";
import type { DetectedImageContext } from "@/lib/ai-core/image-engine/rules/types";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[_\s]+/g, "-").trim();
}

/**
 * Detect business industry, subcategory, and visual style before image selection.
 */
export function detectImageContext(ctx: ImageProfileContext): DetectedImageContext {
  const resolved = resolveImageProfile(ctx);
  const subcategory =
    ctx.subcategory?.trim() ||
    resolved.profile.subcategories?.find((sub) => {
      const hay = [ctx.industry, ctx.businessType, ctx.routingIndustryId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(sub);
    }) ||
    null;

  const visualStyle =
    ctx.visualStyle?.trim() ||
    ctx.brandStyle?.trim() ||
    resolved.profile.visualStyle;

  return {
    industryId: resolved.profile.id,
    industryLabel: resolved.profile.label,
    subcategory,
    visualStyle,
    colorMood: resolved.profile.colorMood,
    matchedBy: resolved.matchedBy,
    confidence: resolved.confidence,
  };
}

/** Map template package IDs to image profile industries. */
export const PACKAGE_INDUSTRY_MAP: Record<string, string> = {
  "saas-enterprise": "saas",
  "corporate-business": "corporate",
  "restaurant-premium": "restaurant",
  "restaurant-signature": "restaurant",
  "real-estate-premium": "real-estate",
  "real-estate-prestige": "real-estate",
  "medical-premium": "medical",
  "creative-agency-premium": "creative-agency",
  "creative-portfolio": "creative-agency",
  "hotel-resort-premium": "hotel",
  "finance-premium": "finance",
  "education-premium": "education",
  "ecommerce-premium": "ecommerce",
};

export function contextFromPackage(
  templatePackageId: string,
  extras: ImageProfileContext = {},
): ImageProfileContext {
  const industry =
    extras.industry ||
    PACKAGE_INDUSTRY_MAP[templatePackageId] ||
    extras.routingIndustryId ||
    "corporate";
  return {
    ...extras,
    industry,
    routingIndustryId: extras.routingIndustryId ?? industry,
  };
}

export function slotOrientationForKind(kind: ImageSlotKind): "landscape" | "portrait" | "square" | "any" {
  switch (kind) {
    case "team":
    case "testimonials":
      return "portrait";
    case "hero":
    case "backgrounds":
    case "cta":
      return "landscape";
    case "products":
      return "square";
    default:
      return "any";
  }
}
