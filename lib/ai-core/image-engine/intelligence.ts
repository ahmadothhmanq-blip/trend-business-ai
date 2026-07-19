import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";
import {
  imageStyleFragment,
  resolveImageEngineStyle,
} from "@/lib/ai-core/image-engine/styles";
import type {
  ImageIntelligenceContext,
  ImagePurpose,
} from "@/lib/ai-core/image-engine/types";

/**
 * Build image intelligence context from Industry Intelligence,
 * Brand Identity, Premium Design System, Smart Templates, and Design Renderer.
 */
export function buildImageIntelligence(params: {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  preferredStyle?: string | null;
  brandIdentity?: BrandIdentityBrief | null;
}): ImageIntelligenceContext {
  const intel = params.templateSelection?.industryIntelligence;
  const premium = params.designSystem.premium;
  const premiumTpl = params.templateSelection?.designConfiguration
    ?.premiumTemplate as
    | {
        brandStyle?: string;
        designStyle?: string;
        imageRequirements?: Array<{ brief?: string } | string>;
      }
    | undefined;
  const audience =
    params.profile?.targetAudience ||
    params.strategy.contentStrategy?.brandVoice ||
    "discerning customers";

  const premiumImageReqs = Array.isArray(premiumTpl?.imageRequirements)
    ? premiumTpl.imageRequirements
        .map((row) =>
          typeof row === "string" ? row : typeof row?.brief === "string" ? row.brief : "",
        )
        .filter(Boolean)
    : [];

  const brand = params.brandIdentity;
  const imageStyle = resolveImageEngineStyle({
    preferred:
      params.preferredStyle ||
      brand?.imageDirection ||
      premiumTpl?.brandStyle,
    premiumStyleId: brand?.premiumStyleId || premium?.styleId,
    designStyle: params.designSystem.style,
    designPreset:
      params.designSystem.stylePreset ||
      params.templateSelection?.designPreset,
    industryDesignStyle: premiumTpl?.designStyle || intel?.designStyle,
  });

  return {
    businessType:
      params.profile?.industry ||
      intel?.label ||
      "business",
    industry:
      params.profile?.industry ||
      intel?.industryPattern ||
      params.designSystem.industryPattern ||
      "general",
    brandStyle:
      brand?.strategy.brandStyle ||
      premiumTpl?.brandStyle ||
      premium?.label ||
      params.designSystem.style ||
      intel?.designStyle ||
      "premium",
    designStyle:
      premiumTpl?.designStyle || intel?.designStyle || params.designSystem.style,
    designPreset:
      String(params.designSystem.stylePreset || "") ||
      params.templateSelection?.designPreset ||
      "modern",
    targetAudience: brand?.strategy.targetAudience || audience,
    offer: params.profile?.offer || params.strategy.positioning,
    projectName:
      brand?.brandName || params.profile?.projectName || "Brand",
    imageStyle,
    imageRequirements:
      premiumImageReqs.length > 0
        ? premiumImageReqs
        : (intel?.imageRequirements ?? []),
    brandImageDirection: brand?.imageDirection,
    templateLabel: params.templateSelection?.label,
    premiumStyleId: brand?.premiumStyleId || premium?.styleId,
    colors: {
      primary: brand?.colors.primary || params.designSystem.colors.primary,
      secondary: brand?.colors.secondary || params.designSystem.colors.secondary,
      accent: brand?.colors.accent || params.designSystem.colors.accent,
    },
  };
}

/** Compose a full generation prompt for a purpose + optional shot brief. */
export function composeImagePrompt(params: {
  purpose: ImagePurpose;
  ctx: ImageIntelligenceContext;
  sectionName?: string;
  shotBrief?: string;
  contentNotes?: string;
  artDirectionFragment?: string;
}): string {
  const styleFrag = imageStyleFragment(params.ctx.imageStyle);
  const purposeLine = purposePromptSeed(params.purpose, params);
  return [
    purposeLine,
    `Business type: ${params.ctx.businessType}.`,
    `Industry: ${params.ctx.industry}.`,
    `Offer: ${params.ctx.offer}.`,
    `Brand style: ${params.ctx.brandStyle}.`,
    `Design system: ${params.ctx.designStyle} / ${params.ctx.designPreset}.`,
    `Target audience: ${params.ctx.targetAudience}.`,
    `Visual style: ${styleFrag}.`,
    params.ctx.brandImageDirection
      ? `Brand image direction: ${params.ctx.brandImageDirection}.`
      : "",
    params.artDirectionFragment
      ? `Art direction: ${params.artDirectionFragment}.`
      : "",
    params.shotBrief ? `Shot brief: ${params.shotBrief}.` : "",
    params.contentNotes
      ? `Section direction: ${params.contentNotes}.`
      : "",
    params.ctx.templateLabel
      ? `Smart template: ${params.ctx.templateLabel}.`
      : "",
    `Color mood near ${params.ctx.colors.primary} and ${params.ctx.colors.secondary}.`,
    "Award-winning commercial photography, ultra sharp, premium agency quality.",
    "No text overlays, no logos, no watermarks, no UI mockups, no empty placeholders, no generic stock smiles.",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function purposePromptSeed(
  purpose: ImagePurpose,
  params: {
    ctx: ImageIntelligenceContext;
    sectionName?: string;
  },
): string {
  const { ctx, sectionName } = params;
  switch (purpose) {
    case "hero":
      return `Photorealistic website hero image for ${ctx.projectName} (${ctx.industry}): ${ctx.offer}. Wide cinematic composition.`;
    case "product":
      return `Photorealistic product visual for ${ctx.offer} in ${ctx.industry}, premium product staging.`;
    case "service":
      return `Photorealistic service imagery for ${ctx.offer} in ${ctx.industry}, people or craft in authentic context.`;
    case "background":
      return `Atmospheric background photography for ${ctx.industry} brand website, subtle depth, suitable as section backdrop.`;
    case "gallery":
      return `Gallery photograph for ${ctx.projectName} showcasing ${ctx.offer} / ${ctx.industry}, editorial composition.`;
    case "brand":
      return `Brand mood photograph for ${ctx.projectName}, ${ctx.brandStyle}, premium brand visual.`;
    case "section":
      return `Supporting photorealistic image for website section "${sectionName || "Features"}" in ${ctx.industry}.`;
    case "testimonial":
      return `Authentic portrait photography for testimonials of ${ctx.projectName}, trustworthy client or guest in natural light.`;
    default:
      return `Photorealistic website image for ${ctx.projectName}.`;
  }
}

export function defaultAspectForPurpose(
  purpose: ImagePurpose,
): import("@/lib/ai-core/assets/settings").ImageAspectRatio {
  switch (purpose) {
    case "hero":
    case "background":
      return "16:9";
    case "gallery":
    case "section":
      return "3:2";
    case "product":
    case "service":
      return "1:1";
    case "testimonial":
      return "1:1";
    default:
      return "16:9";
  }
}

export function styleFromContext(ctx: ImageIntelligenceContext): ImageStylePreset {
  return ctx.imageStyle;
}
